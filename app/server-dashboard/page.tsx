"use client"

import { useState, useEffect } from 'react'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { UserMenu } from '@/components/auth/UserMenu'
import { useAuth } from '@/lib/hooks/useAuth'
import { getAllOrders, updateOrderStatus, type Order } from '@/lib/firebase/orders'
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Coffee, 
  Utensils, 
  Users, 
  Bell,
  Eye,
  Check,
  X,
  RefreshCw
} from 'lucide-react'

export default function ServerDashboardPage() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [filter, setFilter] = useState<'all' | 'pending' | 'preparing' | 'ready'>('all')

  // Charger les commandes
  useEffect(() => {
    const loadOrders = async () => {
      try {
        setIsLoading(true)
        const allOrders = await getAllOrders()
        setOrders(allOrders)
      } catch (error) {
        console.error('Erreur lors du chargement des commandes:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadOrders()
    
    // Rafraîchir toutes les 30 secondes
    const interval = setInterval(loadOrders, 30000)
    return () => clearInterval(interval)
  }, [])

  // Filtrer les commandes
  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true
    return order.status === filter
  })

  // Mettre à jour le statut d'une commande
  const handleStatusUpdate = async (orderId: string, newStatus: Order['status']) => {
    try {
      await updateOrderStatus(orderId, newStatus)
      setOrders(prev => prev.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus }
          : order
      ))
      console.log(`Statut de la commande ${orderId} mis à jour vers ${newStatus}`)
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error)
    }
  }

  // Compter les commandes par statut
  const getStatusCount = (status: Order['status']) => {
    return orders.filter(order => order.status === status).length
  }

  // Obtenir l'icône et la couleur pour le statut
  const getStatusInfo = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return { icon: Clock, color: 'text-yellow-600 bg-yellow-100', bg: 'bg-yellow-50 border-yellow-200' }
      case 'confirmed':
        return { icon: CheckCircle, color: 'text-blue-600 bg-blue-100', bg: 'bg-blue-50 border-blue-200' }
      case 'preparing':
        return { icon: Coffee, color: 'text-orange-600 bg-orange-100', bg: 'bg-orange-50 border-orange-200' }
      case 'ready':
        return { icon: Bell, color: 'text-green-600 bg-green-100', bg: 'bg-green-50 border-green-200' }
      case 'completed':
        return { icon: CheckCircle, color: 'text-gray-600 bg-gray-100', bg: 'bg-gray-50 border-gray-200' }
      case 'cancelled':
        return { icon: X, color: 'text-red-600 bg-red-100', bg: 'bg-red-50 border-red-200' }
      default:
        return { icon: AlertCircle, color: 'text-gray-600 bg-gray-100', bg: 'bg-gray-50 border-gray-200' }
    }
  }

  // Formater l'heure
  const formatTime = (timestamp: any) => {
    if (!timestamp) return 'N/A'
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  // Calculer le temps écoulé
  const getTimeElapsed = (timestamp: any) => {
    if (!timestamp) return 'N/A'
    const orderTime = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - orderTime.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 60) {
      return `${diffMins} min`
    } else {
      const hours = Math.floor(diffMins / 60)
      const mins = diffMins % 60
      return `${hours}h${mins > 0 ? ` ${mins}min` : ''}`
    }
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-restaurant-500 mr-3" />
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Dashboard Serveur
                </h1>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => window.location.reload()}
                  className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                  title="Actualiser"
                >
                  <RefreshCw className="h-5 w-5" />
                </button>
                <UserMenu />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Gestion des Commandes
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Suivez et gérez les commandes en temps réel
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    En attente
                  </p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {getStatusCount('pending')}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                  <Coffee className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    En préparation
                  </p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {getStatusCount('preparing')}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <Bell className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Prêtes
                  </p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {getStatusCount('ready')}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total aujourd'hui
                  </p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {orders.length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'all', label: 'Toutes', count: orders.length },
                { key: 'pending', label: 'En attente', count: getStatusCount('pending') },
                { key: 'preparing', label: 'En préparation', count: getStatusCount('preparing') },
                { key: 'ready', label: 'Prêtes', count: getStatusCount('ready') }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key as any)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filter === tab.key
                      ? 'bg-restaurant-100 text-restaurant-700 dark:bg-restaurant-900/20 dark:text-restaurant-400'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>
          </div>

          {/* Orders List */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-restaurant-600"></div>
                <span className="ml-3 text-gray-600 dark:text-gray-400">Chargement des commandes...</span>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-12">
                <Utensils className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Aucune commande
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {filter === 'all' 
                    ? 'Aucune commande pour le moment' 
                    : `Aucune commande ${filter === 'pending' ? 'en attente' : filter === 'preparing' ? 'en préparation' : 'prête'}`
                  }
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredOrders.map((order) => {
                  const statusInfo = getStatusInfo(order.status)
                  const StatusIcon = statusInfo.icon
                  
                  return (
                    <div key={order.id} className={`p-6 ${statusInfo.bg} border-l-4 border-l-${order.status === 'ready' ? 'green' : order.status === 'preparing' ? 'orange' : 'yellow'}-500`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-3">
                            <div className={`p-2 rounded-lg ${statusInfo.color}`}>
                              <StatusIcon className="h-5 w-5" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Commande #{order.orderNumber}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Table {order.table.number} • {formatTime(order.orderTime)} • {getTimeElapsed(order.orderTime)}
                              </p>
                            </div>
                          </div>
                          
                          <div className="mb-4">
                            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Articles commandés:</h4>
                            <div className="space-y-1">
                              {order.items.map((item, index) => (
                                <div key={index} className="flex justify-between text-sm">
                                  <span className="text-gray-700 dark:text-gray-300">
                                    {item.quantity}x {item.name}
                                  </span>
                                  <span className="text-gray-600 dark:text-gray-400">
                                    €{(item.price * item.quantity).toFixed(2)}
                                  </span>
                                </div>
                              ))}
                            </div>
                            <div className="border-t border-gray-200 dark:border-gray-600 mt-2 pt-2">
                              <div className="flex justify-between font-semibold">
                                <span>Total:</span>
                                <span>€{order.total.toFixed(2)}</span>
                              </div>
                            </div>
                          </div>
                          
                          {order.notes && (
                            <div className="mb-4">
                              <h4 className="font-medium text-gray-900 dark:text-white mb-1">Notes:</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-2 rounded">
                                {order.notes}
                              </p>
                            </div>
                          )}
                        </div>
                        
                        <div className="ml-6 flex flex-col gap-2">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                            title="Voir les détails"
                          >
                            <Eye className="h-5 w-5" />
                          </button>
                          
                          {order.status === 'pending' && (
                            <button
                              onClick={() => handleStatusUpdate(order.id!, 'preparing')}
                              className="p-2 bg-orange-100 text-orange-600 hover:bg-orange-200 rounded-lg transition-colors"
                              title="Commencer la préparation"
                            >
                              <Coffee className="h-5 w-5" />
                            </button>
                          )}
                          
                          {order.status === 'preparing' && (
                            <button
                              onClick={() => handleStatusUpdate(order.id!, 'ready')}
                              className="p-2 bg-green-100 text-green-600 hover:bg-green-200 rounded-lg transition-colors"
                              title="Marquer comme prête"
                            >
                              <Bell className="h-5 w-5" />
                            </button>
                          )}
                          
                          {order.status === 'ready' && (
                            <button
                              onClick={() => handleStatusUpdate(order.id!, 'completed')}
                              className="p-2 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded-lg transition-colors"
                              title="Marquer comme servie"
                            >
                              <Check className="h-5 w-5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </main>

        {/* Order Details Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Détails de la commande #{selectedOrder.orderNumber}
                  </h3>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Informations de la table</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Table {selectedOrder.table.number} • Capacité: {selectedOrder.table.capacity} personnes
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Articles</h4>
                    <div className="space-y-2">
                      {selectedOrder.items.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="text-gray-700 dark:text-gray-300">
                            {item.quantity}x {item.name}
                          </span>
                          <span className="text-gray-600 dark:text-gray-400">
                            €{(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-gray-200 dark:border-gray-600 mt-2 pt-2">
                      <div className="flex justify-between font-semibold">
                        <span>Total:</span>
                        <span>€{selectedOrder.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  
                  {selectedOrder.notes && (
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">Notes spéciales</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-3 rounded">
                        {selectedOrder.notes}
                      </p>
                    </div>
                  )}
                  
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Horaires</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Commande passée: {formatTime(selectedOrder.orderTime)}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Temps écoulé: {getTimeElapsed(selectedOrder.orderTime)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  )
} 