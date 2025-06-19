"use client"

import { useState, useEffect } from 'react'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { UserMenu } from '@/components/auth/UserMenu'
import CreateDishForm from '@/components/dashboard/CreateDishForm'
import DishList from '@/components/dashboard/DishList'
import { useAuth } from '@/lib/hooks/useAuth'
import { createDish, updateDish, deleteDish, getUserDishes } from '@/lib/firebase/dishes'
import type { Dish } from '@/lib/firebase/dishes'
import { Utensils, Users, Calendar, BarChart3, Plus } from 'lucide-react'

export default function DashboardPage() {
  const { user } = useAuth()
  const [dishes, setDishes] = useState<Dish[]>([])
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false)
  const [editingDish, setEditingDish] = useState<Dish | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Charger les plats de l'utilisateur
  useEffect(() => {
    const loadDishes = async () => {
      if (user) {
        try {
          setIsLoading(true)
          const userDishes = await getUserDishes(user.uid)
          setDishes(userDishes)
        } catch (error) {
          console.error('Erreur lors du chargement des plats:', error)
        } finally {
          setIsLoading(false)
        }
      }
    }

    loadDishes()
  }, [user])

  const handleCreateDish = async (dishData: Omit<Dish, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newDish = await createDish(dishData)
      setDishes(prev => [newDish, ...prev])
      console.log('Nouveau plat créé:', newDish)
    } catch (error) {
      console.error('Erreur lors de la création des plats :', error)
      throw error
    }
  }

  const handleEditDish = (dish: Dish) => {
    setEditingDish(dish)
    setIsCreateFormOpen(true)
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
        console.log('Plat mis à jour:', editingDish.id)
      } catch (error) {
        console.error('Erreur lors de la mise à jour du plat:', error)
        throw error
      }
    }
  }

  const handleCloseForm = () => {
    setIsCreateFormOpen(false)
    setEditingDish(null)
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
                  <Utensils className="h-8 w-8 text-restaurant-500 mr-3 group-hover:text-restaurant-600 transition-colors" />
                  <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Restaurant Manager
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
              Tableau de bord
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Bienvenue dans votre espace de gestion restaurant
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-restaurant-100 dark:bg-restaurant-900/20 rounded-lg">
                  <Users className="h-6 w-6 text-restaurant-600 dark:text-restaurant-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Clients aujourd'hui
                  </p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    24
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-business-100 dark:bg-business-900/20 rounded-lg">
                  <Calendar className="h-6 w-6 text-business-600 dark:text-business-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Réservations
                  </p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    8
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Chiffre d'affaires
                  </p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    €1,250
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                  <Utensils className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Plats créés
                  </p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {dishes.length}
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
              <button className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left">
                <h4 className="font-medium text-gray-900 dark:text-white">Nouvelle réservation</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Ajouter une réservation</p>
              </button>
              <button className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left">
                <h4 className="font-medium text-gray-900 dark:text-white">Voir les rapports</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Analyser les performances</p>
              </button>
            </div>
          </div>

          {/* Dishes Management */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-restaurant-600"></div>
                <span className="ml-3 text-gray-600 dark:text-gray-400">Chargement des plats...</span>
              </div>
            ) : (
              <DishList
                dishes={dishes}
                onEdit={handleEditDish}
                onDelete={handleDeleteDish}
                onCreateNew={() => setIsCreateFormOpen(true)}
              />
            )}
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