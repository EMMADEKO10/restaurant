// lib/api/offline-api.ts
// Couche d'abstraction entre l'UI et les données
import { OfflineManager } from '../offline/manager';

export class OfflineApiClient {
  private offlineManager: OfflineManager;

  constructor(offlineManager: OfflineManager) {
    this.offlineManager = offlineManager;
  }

  // API pour les plats
  async getDishes(): Promise<any[]> {
    return await this.offlineManager.getDishes();
  }

  async createDish(dishData: any): Promise<any> {
    return await this.offlineManager.createDish(dishData);
  }

  async updateDish(dishId: string, updateData: any): Promise<any> {
    return await this.offlineManager.updateDish(dishId, updateData);
  }

  async deleteDish(dishId: string): Promise<void> {
    // Soft delete pour permettre la sync
    await this.offlineManager.updateDish(dishId, { 
      isAvailable: false
    });
  }

  // API pour les commandes
  async getOrders(): Promise<any[]> {
    return await this.offlineManager.getOrders();
  }

  async createOrder(orderData: any): Promise<any> {
    return await this.offlineManager.createOrder(orderData);
  }

  async updateOrderStatus(orderId: string, status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled'): Promise<any> {
    return await this.offlineManager.updateOrder(orderId, { status });
  }

  // Méthodes utilitaires
  isOnline(): boolean {
    return this.offlineManager.isOnlineMode();
  }

  async getPendingSyncCount(): Promise<number> {
    return await this.offlineManager.getPendingSyncCount();
  }

  async forcSync(): Promise<void> {
    await this.offlineManager.syncWithServer();
  }
}

// API cliente pour l'architecture offline-first
// Cette API ne contient que la logique client, les appels serveur se font via fetch