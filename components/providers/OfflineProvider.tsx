"use client"

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { OfflineManager } from '@/lib/offline/manager'
import { OfflineApiClient } from '@/lib/api/offline-api'

interface OfflineContextType {
  isOnline: boolean
  pendingSyncCount: number
  lastSyncTime: number | null
  offlineApi: OfflineApiClient
  forceSync: () => Promise<void>
  clearCache: () => Promise<void>
}

const OfflineContext = createContext<OfflineContextType | null>(null)

interface OfflineProviderProps {
  children: ReactNode
}

export function OfflineProvider({ children }: OfflineProviderProps) {
  const [offlineManager] = useState(() => new OfflineManager())
  const [offlineApi] = useState(() => new OfflineApiClient(offlineManager))
  const [isOnline, setIsOnline] = useState(true)
  const [pendingSyncCount, setPendingSyncCount] = useState(0)
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null)

  useEffect(() => {
    // Initialiser le gestionnaire offline
    const initOfflineManager = async () => {
      try {
        await offlineManager.init()
        setIsOnline(offlineManager.isOnlineMode())
        setLastSyncTime(offlineManager.getLastSyncTime())
        
        // Mettre à jour le compteur de synchronisation
        const count = await offlineManager.getPendingSyncCount()
        setPendingSyncCount(count)
      } catch (error) {
        console.error('Erreur lors de l\'initialisation du gestionnaire offline:', error)
      }
    }

    initOfflineManager()

    // Écouter les changements de connexion
    const handleOnline = () => {
      setIsOnline(true)
      console.log('🌐 Connexion rétablie')
    }

    const handleOffline = () => {
      setIsOnline(false)
      console.log('📱 Passage en mode hors ligne')
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Mettre à jour périodiquement les statistiques
    const interval = setInterval(async () => {
      try {
        const count = await offlineManager.getPendingSyncCount()
        setPendingSyncCount(count)
        setLastSyncTime(offlineManager.getLastSyncTime())
      } catch (error) {
        console.error('Erreur lors de la mise à jour des stats offline:', error)
      }
    }, 5000) // Vérifier toutes les 5 secondes

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      clearInterval(interval)
      offlineManager.destroy()
    }
  }, [offlineManager])

  const forceSync = async () => {
    try {
      await offlineManager.syncWithServer()
      const count = await offlineManager.getPendingSyncCount()
      setPendingSyncCount(count)
      setLastSyncTime(offlineManager.getLastSyncTime())
    } catch (error) {
      console.error('Erreur lors de la synchronisation forcée:', error)
    }
  }

  const clearCache = async () => {
    try {
      await offlineManager.forceClearCache()
      setPendingSyncCount(0)
      setLastSyncTime(null)
      console.log('Cache vidé avec succès')
    } catch (error) {
      console.error('Erreur lors du vidage du cache:', error)
    }
  }

  const contextValue: OfflineContextType = {
    isOnline,
    pendingSyncCount,
    lastSyncTime,
    offlineApi,
    forceSync,
    clearCache
  }

  return (
    <OfflineContext.Provider value={contextValue}>
      {children}
    </OfflineContext.Provider>
  )
}

export function useOffline(): OfflineContextType {
  const context = useContext(OfflineContext)
  if (!context) {
    throw new Error('useOffline must be used within an OfflineProvider')
  }
  return context
} 