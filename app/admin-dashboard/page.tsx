"use client"

import { useState, useEffect } from 'react'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { UserMenu } from '@/components/auth/UserMenu'
import { useAuth } from '@/lib/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { getAllDishes, createDish, updateDish, deleteDish, type Dish } from '@/lib/firebase/dishes'
import { getAllOrders, type Order, type OrderItem } from '@/lib/firebase/orders'
import { getFirestore, collection, getDocs } from 'firebase/firestore'
import { Utensils, Users, CreditCard, Database, ShieldAlert, Loader2, Receipt, Coffee, Pizza, Plus } from 'lucide-react'
import CreateDishForm from '@/components/dashboard/CreateDishForm'
import DishList from '@/components/dashboard/DishList'

// Interface pour les utilisateurs
interface User {
  id: string;
  email: string;
  displayName: string;
  role: {
    role: string;
    permissions: string[];
  };
  createdAt: any;
}

export default function AdminDashboardPage() {
  const { user, role, loading } = useAuth()
  const router = useRouter()
  
  const [dishes, setDishes] = useState<Dish[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'dishes' | 'users' | 'orders'>('dishes')
  
  // États pour la gestion des plats
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false)
  const [editingDish, setEditingDish] = useState<Dish | null>(null)
  
  // Statistiques
  const [todayTotal, setTodayTotal] = useState(0)
  const [drinksTotal, setDrinksTotal] = useState(0)
  const [foodTotal, setFoodTotal] = useState(0)

  // Vérifier que l'utilisateur est un admin
  useEffect(() => {
    if (!loading && role !== 'admin' && role !== 'super_admin') {
      router.push('/dashboard')
    }
  }, [loading, role, router])

  // Charger les données
  useEffect(() => {
    const loadData = async () => {
      if (user && (role === 'admin' || role === 'super_admin')) {
        setIsLoading(true)
        try {
          // Charger les plats
          const allDishes = await getAllDishes()
          setDishes(allDishes)
          
          // Charger les utilisateurs
          const db = getFirestore()
          const usersSnapshot = await getDocs(collection(db, 'users'))
          const usersData = usersSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as User[]
          setUsers(usersData)
          
          // Charger les commandes
          const allOrders = await getAllOrders()
          setOrders(allOrders)
          
          // Calculer les statistiques
          calculateOrderStatistics(allOrders)
          
        } catch (error) {
          console.error('Erreur lors du chargement des données:', error)
        } finally {
          setIsLoading(false)
        }
      }
    }

    loadData()
  }, [user, role])

  // Calculer les statistiques des commandes
  const calculateOrderStatistics = (ordersList: Order[]) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    let todayTotalAmount = 0
    let drinksTotalAmount = 0
    let foodTotalAmount = 0
    
    ordersList.forEach(order => {
      // Vérifier si la commande est d'aujourd'hui
      const orderDate = order.orderTime?.toDate ? order.orderTime.toDate() : new Date(order.orderTime)
      const isToday = orderDate >= today
      
      if (isToday && (order.status === 'completed' || order.status === 'ready')) {
        todayTotalAmount += order.total
        
        // Calculer le total par catégorie
        order.items.forEach((item: OrderItem) => {
          if (item.category === 'drink') {
            drinksTotalAmount += item.price * item.quantity
          } else {
            foodTotalAmount += item.price * item.quantity
          }
        })
      }
    })
    
    setTodayTotal(todayTotalAmount)
    setDrinksTotal(drinksTotalAmount)
    setFoodTotal(foodTotalAmount)
  }

  // Formater la date
  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A'
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Obtenir la couleur du statut
  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400'
      case 'confirmed':
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400'
      case 'preparing':
        return 'bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-400'
      case 'ready':
        return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400'
      case 'completed':
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
      case 'cancelled':
        return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400'
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
    }
  }

  // Gestion des plats
  const handleCreateDish = async (dishData: Omit<Dish, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newDish = await createDish({
        ...dishData,
        userId: user?.uid || ''
      })
      setDishes(prev => [newDish, ...prev])
      setIsCreateFormOpen(false)
      console.log('Nouveau plat créé:', newDish)
    } catch (error) {
      console.error('Erreur lors de la création du plat:', error)
      throw error
    }
  }

  const handleEditDish = (dish: Dish) => {
    setEditingDish(dish)
    setIsCreateFormOpen(true)
  }

  const handleUpdateDish = async (dishData: Omit<Dish, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingDish?.id) {
      try {
        await updateDish(editingDish.id, dishData)
        setDishes(prev => prev.map(dish => 
          dish.id === editingDish.id 
            ? { ...dish, ...dishData, id: editingDish.id }
            : dish
        ))
        setEditingDish(null)
        setIsCreateFormOpen(false)
        console.log('Plat mis à jour:', editingDish.id)
      } catch (error) {
        console.error('Erreur lors de la mise à jour du plat:', error)
        throw error
      }
    }
  }

  const handleDeleteDish = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce plat ?')) {
      try {
        await deleteDish(id)
        setDishes(prev => prev.filter(dish => dish.id !== id))
        console.log('Plat supprimé:', id)
      } catch (error) {
        console.error('Erreur lors de la suppression du plat:', error)
      }
    }
  }

  const handleCloseForm = () => {
    setIsCreateFormOpen(false)
    setEditingDish(null)
  }

  // Si l'utilisateur n'est pas encore chargé ou n'est pas admin, afficher un chargement
  if (loading || !user || (role !== 'admin' && role !== 'super_admin')) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-restaurant-500" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Vérification des autorisations...</p>
        </div>
      </div>
    )
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <a href="/" className="flex items-center group hover:opacity-80 transition-opacity">
                  <ShieldAlert className="h-8 w-8 text-restaurant-500 mr-3 group-hover:text-restaurant-600 transition-colors" />
                  <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Dashboard Administrateur
                  </h1>
                </a>
              </div>
              <UserMenu />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Administration du système
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Gérez les plats, les utilisateurs et les commandes
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-restaurant-100 dark:bg-restaurant-900/20 rounded-lg">
                  <Utensils className="h-6 w-6 text-restaurant-600 dark:text-restaurant-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Plats
                  </p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {dishes.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Utilisateurs
                  </p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {users.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <Receipt className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Commandes
                  </p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {orders.length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Revenue Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <CreditCard className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total du jour
                  </p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {todayTotal.toLocaleString('fr-CD')} FC
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <Coffee className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total boissons
                  </p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {drinksTotal.toLocaleString('fr-CD')} FC
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                  <Pizza className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total plats
                  </p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {foodTotal.toFixed(2)} FC
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Actions rapides
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button 
                onClick={() => setIsCreateFormOpen(true)}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-restaurant-100 dark:bg-restaurant-900/20 rounded-lg group-hover:bg-restaurant-200 dark:group-hover:bg-restaurant-900/40 transition-colors">
                    <Plus className="h-5 w-5 text-restaurant-600 dark:text-restaurant-400" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Créer un plat</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Ajouter un nouveau plat au menu</p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-8">
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="flex -mb-px">
                <button
                  onClick={() => setActiveTab('dishes')}
                  className={`py-4 px-6 font-medium text-sm border-b-2 ${
                    activeTab === 'dishes'
                      ? 'border-restaurant-500 text-restaurant-600 dark:text-restaurant-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <div className="flex items-center">
                    <Utensils className="h-4 w-4 mr-2" />
                    Plats
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('users')}
                  className={`py-4 px-6 font-medium text-sm border-b-2 ${
                    activeTab === 'users'
                      ? 'border-restaurant-500 text-restaurant-600 dark:text-restaurant-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    Utilisateurs
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`py-4 px-6 font-medium text-sm border-b-2 ${
                    activeTab === 'orders'
                      ? 'border-restaurant-500 text-restaurant-600 dark:text-restaurant-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <div className="flex items-center">
                    <Receipt className="h-4 w-4 mr-2" />
                    Commandes
                  </div>
                </button>
              </nav>
            </div>
            
            {/* Tab Content */}
            <div className="p-6">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-restaurant-600"></div>
                  <span className="ml-3 text-gray-600 dark:text-gray-400">Chargement des données...</span>
                </div>
              ) : (
                <>
                  {/* Dishes Tab */}
                  {activeTab === 'dishes' && (
                    <div>
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          Gestion des plats et boissons
                        </h3>
                        <button
                          onClick={() => setIsCreateFormOpen(true)}
                          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-restaurant-600 hover:bg-restaurant-700 rounded-lg transition-colors"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Nouveau plat
                        </button>
                      </div>
                      
                      <DishList
                        dishes={dishes}
                        onEdit={handleEditDish}
                        onDelete={handleDeleteDish}
                        onCreateNew={() => setIsCreateFormOpen(true)}
                      />
                    </div>
                  )}
                  
                  {/* Users Tab */}
                  {activeTab === 'users' && (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Utilisateur
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Rôle
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Date d'inscription
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                          {users.map((user) => (
                            <tr key={user.id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mr-3">
                                    <Users className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                                  </div>
                                  <div>
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">{user.displayName}</div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  user.role.role === 'admin' || user.role.role === 'super_admin'
                                    ? 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400'
                                    : user.role.role === 'server'
                                    ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                                }`}>
                                  {user.role.role}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {user.createdAt ? new Date(user.createdAt.seconds * 1000).toLocaleDateString() : "N/A"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  
                  {/* Orders Tab */}
                  {activeTab === 'orders' && (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              N° Commande
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Table
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Montant
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Statut
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Date
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                          {orders.map((order) => (
                            <tr key={order.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                #{order.orderNumber}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900 dark:text-white">Table {order.table.number}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">{order.table.capacity} personnes</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                {order.total.toFixed(2)} €
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                                  {order.status === 'pending' && 'En attente'}
                                  {order.status === 'confirmed' && 'Confirmée'}
                                  {order.status === 'preparing' && 'En préparation'}
                                  {order.status === 'ready' && 'Prête'}
                                  {order.status === 'completed' && 'Servie'}
                                  {order.status === 'cancelled' && 'Annulée'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {formatDate(order.orderTime)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </main>

        {/* Create/Edit Dish Form */}
        <CreateDishForm
          isOpen={isCreateFormOpen}
          onClose={handleCloseForm}
          onSubmit={editingDish ? handleUpdateDish : handleCreateDish}
          editingDish={editingDish}
        />
      </div>
    </AuthGuard>
  )
}
