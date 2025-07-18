// lib/offline/storage.ts
// Gestion du stockage IndexedDB pour l'architecture offline-first

export interface SyncQueueItem {
  id?: number
  collection: string
  action: 'create' | 'update' | 'delete'
  data: any
  timestamp: number
  synced: boolean
  retryCount: number
  userId?: string
}

export interface OfflineEntity {
  id: string
  data: any
  lastModified: number
  isDeleted?: boolean
  needsSync?: boolean
}

export class OfflineStorage {
  private dbName = 'restaurant-offline'
  private version = 1
  private db: IDBDatabase | null = null

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version)

      request.onerror = () => {
        reject(new Error('Erreur lors de l\'ouverture de la base de données IndexedDB'))
      }

      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // Store pour les plats
        if (!db.objectStoreNames.contains('dishes')) {
          const dishesStore = db.createObjectStore('dishes', { keyPath: 'id' })
          dishesStore.createIndex('category', 'data.category', { unique: false })
          dishesStore.createIndex('isAvailable', 'data.isAvailable', { unique: false })
          dishesStore.createIndex('lastModified', 'lastModified', { unique: false })
        }

        // Store pour les commandes
        if (!db.objectStoreNames.contains('orders')) {
          const ordersStore = db.createObjectStore('orders', { keyPath: 'id' })
          ordersStore.createIndex('status', 'data.status', { unique: false })
          ordersStore.createIndex('orderTime', 'data.orderTime', { unique: false })
          ordersStore.createIndex('lastModified', 'lastModified', { unique: false })
        }

        // Store pour la queue de synchronisation
        if (!db.objectStoreNames.contains('sync_queue')) {
          const syncStore = db.createObjectStore('sync_queue', { keyPath: 'id', autoIncrement: true })
          syncStore.createIndex('synced', 'synced', { unique: false })
          syncStore.createIndex('collection', 'collection', { unique: false })
          syncStore.createIndex('timestamp', 'timestamp', { unique: false })
        }

        // Store pour les métadonnées
        if (!db.objectStoreNames.contains('metadata')) {
          db.createObjectStore('metadata', { keyPath: 'key' })
        }
      }
    })
  }

  // Méthodes CRUD pour les plats
  async saveDish(dish: any): Promise<void> {
    const entity: OfflineEntity = {
      id: dish.id || `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      data: dish,
      lastModified: Date.now(),
      needsSync: true
    }

    await this.saveToStore('dishes', entity)
  }

  async getDishes(): Promise<any[]> {
    const entities = await this.getAllFromStore('dishes')
    return entities
      .filter(entity => !entity.isDeleted)
      .map(entity => ({ ...entity.data, id: entity.id }))
  }

  async getDish(id: string): Promise<any | null> {
    const entity = await this.getFromStore('dishes', id)
    return entity && !entity.isDeleted ? { ...entity.data, id: entity.id } : null
  }

  async updateDish(id: string, updates: any): Promise<void> {
    const existing = await this.getFromStore('dishes', id)
    if (existing) {
      const updated: OfflineEntity = {
        ...existing,
        data: { ...existing.data, ...updates },
        lastModified: Date.now(),
        needsSync: true
      }
      await this.saveToStore('dishes', updated)
    }
  }

  async deleteDish(id: string): Promise<void> {
    const existing = await this.getFromStore('dishes', id)
    if (existing) {
      const deleted: OfflineEntity = {
        ...existing,
        isDeleted: true,
        lastModified: Date.now(),
        needsSync: true
      }
      await this.saveToStore('dishes', deleted)
    }
  }

  // Méthodes CRUD pour les commandes
  async saveOrder(order: any): Promise<void> {
    const entity: OfflineEntity = {
      id: order.id || `offline_order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      data: order,
      lastModified: Date.now(),
      needsSync: true
    }

    await this.saveToStore('orders', entity)
  }

  async getOrders(): Promise<any[]> {
    const entities = await this.getAllFromStore('orders')
    return entities
      .filter(entity => !entity.isDeleted)
      .map(entity => ({ ...entity.data, id: entity.id }))
  }

  async getOrder(id: string): Promise<any | null> {
    const entity = await this.getFromStore('orders', id)
    return entity && !entity.isDeleted ? { ...entity.data, id: entity.id } : null
  }

  async updateOrder(id: string, updates: any): Promise<void> {
    const existing = await this.getFromStore('orders', id)
    if (existing) {
      const updated: OfflineEntity = {
        ...existing,
        data: { ...existing.data, ...updates },
        lastModified: Date.now(),
        needsSync: true
      }
      await this.saveToStore('orders', updated)
    }
  }

  // Gestion de la queue de synchronisation
  async addToSyncQueue(item: Omit<SyncQueueItem, 'id' | 'timestamp' | 'synced' | 'retryCount'>): Promise<void> {
    const syncItem: Omit<SyncQueueItem, 'id'> = {
      ...item,
      timestamp: Date.now(),
      synced: false,
      retryCount: 0
    }

    await this.addToStore('sync_queue', syncItem)
  }

  async getSyncQueue(): Promise<SyncQueueItem[]> {
    return this.getAllFromStore('sync_queue')
  }

  async markAsSynced(syncId: number): Promise<void> {
    const item = await this.getFromStore('sync_queue', syncId)
    if (item) {
      await this.saveToStore('sync_queue', { ...item, synced: true })
    }
  }

  async incrementRetryCount(syncId: number): Promise<void> {
    const item = await this.getFromStore('sync_queue', syncId)
    if (item) {
      await this.saveToStore('sync_queue', { ...item, retryCount: item.retryCount + 1 })
    }
  }

  async clearSyncedItems(): Promise<void> {
    const transaction = this.db!.transaction(['sync_queue'], 'readwrite')
    const store = transaction.objectStore('sync_queue')
    const index = store.index('synced')
    const request = index.openCursor(IDBKeyRange.only(true))

    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result
      if (cursor) {
        cursor.delete()
        cursor.continue()
      }
    }
  }

  // Métadonnées
  async setMetadata(key: string, value: any): Promise<void> {
    await this.saveToStore('metadata', { key, value })
  }

  async getMetadata(key: string): Promise<any> {
    const item = await this.getFromStore('metadata', key)
    return item?.value
  }

  // Méthodes utilitaires privées
  private async saveToStore(storeName: string, data: any): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite')
      const store = transaction.objectStore(storeName)
      const request = store.put(data)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  private async addToStore(storeName: string, data: any): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite')
      const store = transaction.objectStore(storeName)
      const request = store.add(data)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  private async getFromStore(storeName: string, key: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly')
      const store = transaction.objectStore(storeName)
      const request = store.get(key)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    })
  }

  private async getAllFromStore(storeName: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly')
      const store = transaction.objectStore(storeName)
      const request = store.getAll()

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result || [])
    })
  }

  // Nettoyage
  async clearStore(storeName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite')
      const store = transaction.objectStore(storeName)
      const request = store.clear()

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async close(): Promise<void> {
    if (this.db) {
      this.db.close()
      this.db = null
    }
  }
}