// lib/offline/manager.ts
// Gestionnaire principal de l'architecture offline-first

import { OfflineStorage, SyncQueueItem } from './storage'
// Import des types seulement pour éviter les problèmes côté client
import type { Dish } from '../firebase/dishes'
import type { Order } from '../firebase/orders'

export interface NetworkState {
  isOnline: boolean
  lastSync: number | null
}

export class OfflineManager {
  private storage: OfflineStorage
  private networkState: NetworkState
  private syncInProgress = false
  private syncInterval: NodeJS.Timeout | null = null

  constructor() {
    this.storage = new OfflineStorage()
    this.networkState = {
      isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
      lastSync: null
    }

    this.setupNetworkListeners()
  }

  async init(): Promise<void> {
    await this.storage.init()
    
    // Récupérer la dernière synchronisation
    const lastSync = await this.storage.getMetadata('lastSync')
    if (lastSync) {
      this.networkState.lastSync = lastSync
    }

    // Démarrer la synchronisation automatique
    this.startAutoSync()

    // Synchroniser au démarrage si en ligne
    if (this.networkState.isOnline) {
      this.syncWithServer()
    }
  }

  // Gestion du réseau
  private setupNetworkListeners(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        console.log('🌐 Connexion rétablie - Démarrage de la synchronisation')
        this.networkState.isOnline = true
        this.syncWithServer()
      })

      window.addEventListener('offline', () => {
        console.log('📱 Mode hors ligne activé')
        this.networkState.isOnline = false
      })
    }
  }

  private startAutoSync(): void {
    // Synchroniser toutes les 30 secondes si en ligne
    this.syncInterval = setInterval(() => {
      if (this.networkState.isOnline && !this.syncInProgress) {
        this.syncWithServer()
      }
    }, 30000)
  }

  private stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
      this.syncInterval = null
    }
  }

  // État du réseau
  isOnlineMode(): boolean {
    return this.networkState.isOnline
  }

  getLastSyncTime(): number | null {
    return this.networkState.lastSync
  }

  // API pour les plats - Mode offline-first
  async getDishes(): Promise<Dish[]> {
    try {
      if (this.networkState.isOnline) {
        // Si en ligne, essayer de récupérer depuis l'API
        const response = await fetch('/api/dishes')
        if (response.ok) {
          const dishes = await response.json()
          
          // Sauvegarder en local
          for (const dish of dishes) {
            await this.storage.saveDish(dish)
          }
          
          return dishes
        }
      }
      // Si hors ligne ou erreur API, récupérer depuis le stockage local
      return await this.storage.getDishes()
    } catch (error) {
      console.warn('Erreur lors de la récupération des plats online, utilisation du cache:', error)
      return await this.storage.getDishes()
    }
  }

  async createDish(dishData: Omit<Dish, 'id' | 'createdAt' | 'updatedAt'>): Promise<Dish> {
    const dish: Dish = {
      ...dishData,
      id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    // Sauvegarder localement immédiatement
    await this.storage.saveDish(dish)

    // Ajouter à la queue de synchronisation
    await this.storage.addToSyncQueue({
      collection: 'dishes',
      action: 'create',
      data: dish,
      userId: dishData.userId
    })

    // Si en ligne, essayer de synchroniser immédiatement
    if (this.networkState.isOnline) {
      this.syncWithServer()
    }

    return dish
  }

  async updateDish(dishId: string, updateData: Partial<Dish>): Promise<Dish> {
    // Mettre à jour localement
    await this.storage.updateDish(dishId, updateData)

    // Ajouter à la queue de synchronisation
    await this.storage.addToSyncQueue({
      collection: 'dishes',
      action: 'update',
      data: { id: dishId, ...updateData }
    })

    // Si en ligne, essayer de synchroniser
    if (this.networkState.isOnline) {
      this.syncWithServer()
    }

    const updatedDish = await this.storage.getDish(dishId)
    return updatedDish!
  }

  async deleteDish(dishId: string): Promise<void> {
    // Marquer comme supprimé localement
    await this.storage.deleteDish(dishId)

    // Ajouter à la queue de synchronisation
    await this.storage.addToSyncQueue({
      collection: 'dishes',
      action: 'delete',
      data: { id: dishId }
    })

    // Si en ligne, essayer de synchroniser
    if (this.networkState.isOnline) {
      this.syncWithServer()
    }
  }

  // API pour les commandes - Mode offline-first
  async getOrders(): Promise<Order[]> {
    try {
      if (this.networkState.isOnline) {
        // Si en ligne, récupérer depuis l'API
        const response = await fetch('/api/orders')
        if (response.ok) {
          const orders = await response.json()
          
          // Sauvegarder en local
          for (const order of orders) {
            await this.storage.saveOrder(order)
          }
          
          return orders
        }
      }
      // Si hors ligne ou erreur API, récupérer depuis le stockage local
      return await this.storage.getOrders()
    } catch (error) {
      console.warn('Erreur lors de la récupération des commandes online, utilisation du cache:', error)
      return await this.storage.getOrders()
    }
  }

  async createOrder(orderData: Omit<Order, 'id' | 'orderNumber' | 'orderTime' | 'createdAt' | 'updatedAt'>): Promise<Order> {
    const order: Order = {
      ...orderData,
      id: `offline_order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      orderNumber: `OFF-${Date.now().toString().slice(-6)}`,
      orderTime: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    }

    // Sauvegarder localement
    await this.storage.saveOrder(order)

    // Ajouter à la queue de synchronisation
    await this.storage.addToSyncQueue({
      collection: 'orders',
      action: 'create',
      data: order
    })

    // Si en ligne, essayer de synchroniser immédiatement
    if (this.networkState.isOnline) {
      this.syncWithServer()
    }

    return order
  }

  async updateOrder(orderId: string, updateData: Partial<Order>): Promise<Order> {
    // Mettre à jour localement
    await this.storage.updateOrder(orderId, updateData)

    // Ajouter à la queue de synchronisation
    await this.storage.addToSyncQueue({
      collection: 'orders',
      action: 'update',
      data: { id: orderId, ...updateData }
    })

    // Si en ligne, essayer de synchroniser
    if (this.networkState.isOnline) {
      this.syncWithServer()
    }

    const updatedOrder = await this.storage.getOrder(orderId)
    return updatedOrder!
  }

  // Synchronisation avec le serveur
  async syncWithServer(): Promise<void> {
    if (!this.networkState.isOnline || this.syncInProgress) {
      return
    }

    console.log('🔄 Début de la synchronisation avec le serveur...')
    this.syncInProgress = true

    try {
      const syncQueue = await this.storage.getSyncQueue()
      const pendingItems = syncQueue.filter(item => !item.synced && item.retryCount < 3)

      for (const item of pendingItems) {
        try {
          await this.syncItem(item)
          await this.storage.markAsSynced(item.id!)
          console.log(`✅ Synchronisé: ${item.collection} ${item.action}`)
        } catch (error) {
          console.error(`❌ Erreur de sync pour ${item.collection} ${item.action}:`, error)
          await this.storage.incrementRetryCount(item.id!)
        }
      }

      // Nettoyer les items synchronisés
      await this.storage.clearSyncedItems()

      // Mettre à jour le timestamp de la dernière sync
      this.networkState.lastSync = Date.now()
      await this.storage.setMetadata('lastSync', this.networkState.lastSync)

      console.log('✅ Synchronisation terminée avec succès')
    } catch (error) {
      console.error('❌ Erreur lors de la synchronisation:', error)
    } finally {
      this.syncInProgress = false
    }
  }

  private async syncItem(item: SyncQueueItem): Promise<void> {
    switch (item.collection) {
      case 'dishes':
        await this.syncDish(item)
        break
      case 'orders':
        await this.syncOrder(item)
        break
      default:
        throw new Error(`Collection inconnue: ${item.collection}`)
    }
  }

  private async syncDish(item: SyncQueueItem): Promise<void> {
    switch (item.action) {
      case 'create':
        // Créer un nouveau plat via l'API
        const response = await fetch('/api/dishes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item.data)
        })
        if (response.ok) {
          const newDish = await response.json()
          // Mettre à jour l'ID local avec l'ID du serveur
          await this.storage.updateDish(item.data.id, { id: newDish.id })
        }
        break

      case 'update':
        if (item.data.id.startsWith('offline_')) {
          // Si c'est un ID offline, on ne peut pas mettre à jour
          console.warn('Impossible de mettre à jour un plat avec un ID offline')
        } else {
          await fetch(`/api/dishes/${item.data.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item.data)
          })
        }
        break

      case 'delete':
        if (!item.data.id.startsWith('offline_')) {
          await fetch(`/api/dishes/${item.data.id}`, {
            method: 'DELETE'
          })
        }
        break
    }
  }

  private async syncOrder(item: SyncQueueItem): Promise<void> {
    switch (item.action) {
      case 'create':
        // Créer une nouvelle commande via l'API
        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item.data)
        })
        if (response.ok) {
          const newOrder = await response.json()
          // Mettre à jour l'ID local avec l'ID du serveur
          await this.storage.updateOrder(item.data.id, { id: newOrder.id })
        }
        break

      case 'update':
        if (item.data.id.startsWith('offline_')) {
          console.warn('Impossible de mettre à jour une commande avec un ID offline')
        } else {
          await fetch(`/api/orders/${item.data.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item.data)
          })
        }
        break
    }
  }

  // Utilitaires
  async getPendingSyncCount(): Promise<number> {
    const syncQueue = await this.storage.getSyncQueue()
    return syncQueue.filter(item => !item.synced).length
  }

  async forceClearCache(): Promise<void> {
    await this.storage.clearStore('dishes')
    await this.storage.clearStore('orders')
    await this.storage.clearStore('sync_queue')
    console.log('🗑️ Cache vidé')
  }

  async destroy(): Promise<void> {
    this.stopAutoSync()
    await this.storage.close()
  }
} 