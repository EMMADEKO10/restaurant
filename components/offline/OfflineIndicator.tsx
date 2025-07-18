"use client"

import { useState, useEffect } from 'react'
import { Wifi, WifiOff, RefreshCw, Cloud, CloudOff, CheckCircle } from 'lucide-react'
import { useOffline } from '@/components/providers/OfflineProvider'

export function OfflineIndicator() {
  const { isOnline, pendingSyncCount, lastSyncTime, forceSync } = useOffline()
  const [isVisible, setIsVisible] = useState(false)

  // Afficher l'indicateur quand hors ligne ou qu'il y a des éléments à synchroniser
  useEffect(() => {
    setIsVisible(!isOnline || pendingSyncCount > 0)
  }, [isOnline, pendingSyncCount])

  const formatLastSync = (timestamp: number | null) => {
    if (!timestamp) return 'Jamais'
    
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / 60000)
    
    if (minutes < 1) return 'À l\'instant'
    if (minutes === 1) return 'Il y a 1 minute'
    if (minutes < 60) return `Il y a ${minutes} minutes`
    
    const hours = Math.floor(minutes / 60)
    if (hours === 1) return 'Il y a 1 heure'
    if (hours < 24) return `Il y a ${hours} heures`
    
    return 'Il y a plus d\'un jour'
  }

  const handleForceSync = async () => {
    try {
      await forceSync()
    } catch (error) {
      console.error('Erreur lors de la synchronisation forcée:', error)
    }
  }

  if (!isVisible) return null

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className={`
        px-4 py-2 rounded-lg shadow-lg transition-all duration-300 transform
        ${isOnline 
          ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800' 
          : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
        }
      `}>
        <div className="flex items-center gap-3">
          {/* Icône de statut */}
          <div className="flex items-center gap-2">
            {isOnline ? (
              <Wifi className="h-4 w-4 text-green-500" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-500" />
            )}
            
            {pendingSyncCount > 0 && (
              <CloudOff className="h-4 w-4 text-orange-500" />
            )}
            
            {isOnline && pendingSyncCount === 0 && (
              <CheckCircle className="h-4 w-4 text-green-500" />
            )}
          </div>

          {/* Message */}
          <div className="text-sm">
            {!isOnline ? (
              <div>
                <div className="font-medium text-red-700 dark:text-red-300">
                  Mode hors ligne
                </div>
                <div className="text-red-600 dark:text-red-400 text-xs">
                  Vos modifications seront synchronisées à la reconnexion
                </div>
              </div>
            ) : pendingSyncCount > 0 ? (
              <div>
                <div className="font-medium text-blue-700 dark:text-blue-300">
                  Synchronisation en cours...
                </div>
                <div className="text-blue-600 dark:text-blue-400 text-xs">
                  {pendingSyncCount} élément{pendingSyncCount > 1 ? 's' : ''} en attente
                </div>
              </div>
            ) : (
              <div>
                <div className="font-medium text-green-700 dark:text-green-300">
                  Synchronisé
                </div>
                <div className="text-green-600 dark:text-green-400 text-xs">
                  Dernière sync: {formatLastSync(lastSyncTime)}
                </div>
              </div>
            )}
          </div>

          {/* Bouton de synchronisation manuelle */}
          {isOnline && (
            <button
              onClick={handleForceSync}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              title="Forcer la synchronisation"
            >
              <RefreshCw className="h-4 w-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
} 