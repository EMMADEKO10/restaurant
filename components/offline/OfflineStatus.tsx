"use client"

import { useState, useEffect } from 'react'
import { useOffline } from '@/components/providers/OfflineProvider'
import { 
  Wifi, 
  WifiOff, 
  Cloud, 
  CloudOff, 
  RefreshCw, 
  Trash2, 
  Database, 
  CheckCircle2,
  AlertCircle,
  Clock
} from 'lucide-react'

interface OfflineStatusProps {
  showDetails?: boolean
  className?: string
}

export function OfflineStatus({ showDetails = false, className = "" }: OfflineStatusProps) {
  const { 
    isOnline, 
    pendingSyncCount, 
    lastSyncTime, 
    forceSync, 
    clearCache 
  } = useOffline()
  
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isClearingCache, setIsClearingCache] = useState(false)

  const handleForceSync = async () => {
    setIsRefreshing(true)
    try {
      await forceSync()
    } catch (error) {
      console.error('Erreur lors de la synchronisation:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleClearCache = async () => {
    if (confirm('Êtes-vous sûr de vouloir vider le cache offline ? Toutes les données non synchronisées seront perdues.')) {
      setIsClearingCache(true)
      try {
        await clearCache()
      } catch (error) {
        console.error('Erreur lors du vidage du cache:', error)
      } finally {
        setIsClearingCache(false)
      }
    }
  }

  const formatLastSync = (timestamp: number | null) => {
    if (!timestamp) return 'Jamais synchronisé'
    
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / 60000)
    
    if (minutes < 1) return 'Synchronisé à l\'instant'
    if (minutes === 1) return 'Synchronisé il y a 1 minute'
    if (minutes < 60) return `Synchronisé il y a ${minutes} minutes`
    
    const hours = Math.floor(minutes / 60)
    if (hours === 1) return 'Synchronisé il y a 1 heure'
    if (hours < 24) return `Synchronisé il y a ${hours} heures`
    
    const days = Math.floor(hours / 24)
    if (days === 1) return 'Synchronisé il y a 1 jour'
    return `Synchronisé il y a ${days} jours`
  }

  const getStatusIcon = () => {
    if (!isOnline) return <WifiOff className="h-5 w-5 text-red-500" />
    if (pendingSyncCount > 0) return <CloudOff className="h-5 w-5 text-orange-500" />
    return <CheckCircle2 className="h-5 w-5 text-green-500" />
  }

  const getStatusText = () => {
    if (!isOnline) return 'Hors ligne'
    if (pendingSyncCount > 0) return 'Synchronisation en attente'
    return 'Synchronisé'
  }

  const getStatusColor = () => {
    if (!isOnline) return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
    if (pendingSyncCount > 0) return 'border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20'
    return 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
  }

  return (
    <div className={`border rounded-lg p-4 ${getStatusColor()} ${className}`}>
      {/* En-tête compact */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {getStatusIcon()}
          <div>
            <div className="font-medium text-gray-900 dark:text-white">
              {getStatusText()}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {formatLastSync(lastSyncTime)}
            </div>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="flex items-center gap-2">
          {isOnline && (
            <button
              onClick={handleForceSync}
              disabled={isRefreshing}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50 transition-colors"
              title="Forcer la synchronisation"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          )}
          
          <button
            onClick={handleClearCache}
            disabled={isClearingCache}
            className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 disabled:opacity-50 transition-colors"
            title="Vider le cache offline"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Détails étendus */}
      {showDetails && (
        <div className="mt-4 space-y-3 border-t pt-3 border-gray-200 dark:border-gray-700">
          {/* Statut de connexion */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Connexion</span>
            <div className="flex items-center gap-2">
              {isOnline ? (
                <>
                  <Wifi className="h-4 w-4 text-green-500" />
                  <span className="text-green-600 dark:text-green-400">En ligne</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-4 w-4 text-red-500" />
                  <span className="text-red-600 dark:text-red-400">Hors ligne</span>
                </>
              )}
            </div>
          </div>

          {/* Éléments en attente */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Synchronisation</span>
            <div className="flex items-center gap-2">
              {pendingSyncCount > 0 ? (
                <>
                  <Clock className="h-4 w-4 text-orange-500" />
                  <span className="text-orange-600 dark:text-orange-400">
                    {pendingSyncCount} élément{pendingSyncCount > 1 ? 's' : ''} en attente
                  </span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="text-green-600 dark:text-green-400">À jour</span>
                </>
              )}
            </div>
          </div>

          {/* Stockage local */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Cache local</span>
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-blue-500" />
              <span className="text-blue-600 dark:text-blue-400">Actif</span>
            </div>
          </div>

          {/* Messages d'aide */}
          {!isOnline && (
            <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-yellow-800 dark:text-yellow-200">
                  <div className="font-medium">Mode hors ligne activé</div>
                  <div className="mt-1">
                    Vos modifications sont sauvegardées localement et seront synchronisées 
                    automatiquement lors de la reconnexion.
                  </div>
                </div>
              </div>
            </div>
          )}

          {pendingSyncCount > 0 && isOnline && (
            <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded">
              <div className="flex items-start gap-2">
                <Cloud className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800 dark:text-blue-200">
                  <div className="font-medium">Synchronisation en cours</div>
                  <div className="mt-1">
                    {pendingSyncCount} modification{pendingSyncCount > 1 ? 's' : ''} en attente 
                    de synchronisation avec le serveur.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
} 