"use client"

import { useOffline } from '@/components/providers/OfflineProvider'
import { useState, useCallback } from 'react'
import type { Dish } from '@/lib/firebase/dishes'
import type { Order } from '@/lib/firebase/orders'

/**
 * Hook pour utiliser l'API offline-first dans les composants
 * Remplace les appels directs à Firebase par des appels offline-first
 */
export function useOfflineApi() {
  const { offlineApi, isOnline, pendingSyncCount } = useOffline()
  const [isLoading, setIsLoading] = useState(false)

  // CRUD pour les plats
  const dishes = {
    getAll: useCallback(async (): Promise<Dish[]> => {
      setIsLoading(true)
      try {
        return await offlineApi.getDishes()
      } finally {
        setIsLoading(false)
      }
    }, [offlineApi]),

    create: useCallback(async (dishData: Omit<Dish, 'id' | 'createdAt' | 'updatedAt'>): Promise<Dish> => {
      setIsLoading(true)
      try {
        return await offlineApi.createDish(dishData)
      } finally {
        setIsLoading(false)
      }
    }, [offlineApi]),

    update: useCallback(async (dishId: string, updateData: Partial<Dish>): Promise<Dish> => {
      setIsLoading(true)
      try {
        return await offlineApi.updateDish(dishId, updateData)
      } finally {
        setIsLoading(false)
      }
    }, [offlineApi]),

    delete: useCallback(async (dishId: string): Promise<void> => {
      setIsLoading(true)
      try {
        await offlineApi.deleteDish(dishId)
      } finally {
        setIsLoading(false)
      }
    }, [offlineApi])
  }

  // CRUD pour les commandes
  const orders = {
    getAll: useCallback(async (): Promise<Order[]> => {
      setIsLoading(true)
      try {
        return await offlineApi.getOrders()
      } finally {
        setIsLoading(false)
      }
    }, [offlineApi]),

    create: useCallback(async (orderData: Omit<Order, 'id' | 'orderNumber' | 'orderTime' | 'createdAt' | 'updatedAt'>): Promise<Order> => {
      setIsLoading(true)
      try {
        return await offlineApi.createOrder(orderData)
      } finally {
        setIsLoading(false)
      }
    }, [offlineApi]),

    updateStatus: useCallback(async (orderId: string, status: Order['status']): Promise<Order> => {
      setIsLoading(true)
      try {
        return await offlineApi.updateOrderStatus(orderId, status)
      } finally {
        setIsLoading(false)
      }
    }, [offlineApi])
  }

  // Utilitaires
  const sync = {
    getPendingCount: useCallback(async (): Promise<number> => {
      return await offlineApi.getPendingSyncCount()
    }, [offlineApi]),

    forceSync: useCallback(async (): Promise<void> => {
      if (isOnline) {
        await offlineApi.forcSync()
      }
    }, [offlineApi, isOnline])
  }

  return {
    dishes,
    orders,
    sync,
    isLoading,
    isOnline,
    pendingSyncCount,
    status: {
      hasUnsyncedChanges: pendingSyncCount > 0,
      canSync: isOnline && pendingSyncCount > 0
    }
  }
} 