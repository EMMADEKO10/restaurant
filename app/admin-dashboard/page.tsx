"use client"

import { useState, useEffect } from 'react'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { UserMenu } from '@/components/auth/UserMenu'
import { useAuth } from '@/lib/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { getAllDishes } from '@/lib/firebase/dishes'
import { getFirestore, collection, getDocs } from 'firebase/firestore'
import type { Dish } from '@/lib/firebase/dishes'
import { Utensils, Users, CreditCard, Database, ShieldAlert, Loader2 } from 'lucide-react'

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

// Interface pour les paiements
interface Payment {
  id: string;
  amount: number;
  status: string;
  customerName: string;
  customerEmail: string;
  createdAt: any;
  items: any[];
}

export default function AdminDashboardPage() {
  const { user, role, loading } = useAuth()
  const router = useRouter()
  
  const [dishes, setDishes] = useState<Dish[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'dishes' | 'users' | 'payments'>('dishes')

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
          
          // Charger les paiements (simulation pour l'instant)
          // Dans un cas réel, vous feriez une requête à votre système de paiement
          const mockPayments: Payment[] = [
            {
              id: '1',
              amount: 45.90,
              status: 'completed',
              customerName: 'Jean Dupont',
              customerEmail: 'jean@exemple.com',
              createdAt: new Date(),
              items: [{ name: 'Burger Deluxe', quantity: 2 }]
            },
            {
              id: '2',
              amount: 32.50,
              status: 'completed',
              customerName: 'Marie Martin',
              customerEmail: 'marie@exemple.com',
              createdAt: new Date(),
              items: [{ name: 'Pizza Margherita', quantity: 1 }]
            },
            {
              id: '3',
              amount: 18.90,
              status: 'pending',
              customerName: 'Lucas Bernard',
              customerEmail: 'lucas@exemple.com',
              createdAt: new Date(),
              items: [{ name: 'Salade César', quantity: 1 }]
            }
          ]
          setPayments(mockPayments)
          
        } catch (error) {
          console.error('Erreur lors du chargement des données:', error)
        } finally {
          setIsLoading(false)
        }
      }
    }

    loadData()
  }, [user, role])

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
              Gérez les plats, les utilisateurs et les paiements
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
                  <CreditCard className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Paiements
                  </p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {payments.length}
                  </p>
                </div>
              </div>
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
                  onClick={() => setActiveTab('payments')}
                  className={`py-4 px-6 font-medium text-sm border-b-2 ${
                    activeTab === 'payments'
                      ? 'border-restaurant-500 text-restaurant-600 dark:text-restaurant-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <div className="flex items-center">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Paiements
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
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Nom
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Prix
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Catégorie
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Créé par
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                          {dishes.map((dish) => (
                            <tr key={dish.id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  {dish.imageUrl ? (
                                    <img className="h-10 w-10 rounded-full object-cover mr-3" src={dish.imageUrl} alt={dish.name} />
                                  ) : (
                                    <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mr-3">
                                      <Utensils className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                                    </div>
                                  )}
                                  <div>
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">{dish.name}</div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">{dish.description.substring(0, 50)}...</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900 dark:text-white">{dish.price.toFixed(2)} €</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400">
                                  {dish.category}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {dish.createdBy || "Système"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
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
                  
                  {/* Payments Tab */}
                  {activeTab === 'payments' && (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              ID Transaction
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Client
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
                          {payments.map((payment) => (
                            <tr key={payment.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                #{payment.id}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900 dark:text-white">{payment.customerName}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">{payment.customerEmail}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                {payment.amount.toFixed(2)} €
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  payment.status === 'completed'
                                    ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400'
                                    : payment.status === 'pending'
                                    ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400'
                                    : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400'
                                }`}>
                                  {payment.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {payment.createdAt.toLocaleDateString()}
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
      </div>
    </AuthGuard>
  )
}
