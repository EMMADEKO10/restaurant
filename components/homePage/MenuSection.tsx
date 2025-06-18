"use client"

import { useState, useEffect } from 'react'
import { Plus, Utensils, Coffee, Dessert, ChefHat } from 'lucide-react'
import { useCart, MenuItem, CartItem } from '@/contexts/CartContext'
import { getAvailableDishes } from '@/lib/firebase/dishes'
import type { Dish } from '@/lib/firebase/dishes'

export default function MenuSection() {
  const [activeCategory, setActiveCategory] = useState<'all' | 'food' | 'drink' | 'dessert' | 'appetizer'>('all')
  const [dishes, setDishes] = useState<Dish[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { addItem } = useCart()

  // Récupérer les plats disponibles depuis Firestore
  useEffect(() => {
    const loadDishes = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const availableDishes = await getAvailableDishes()
        setDishes(availableDishes)
      } catch (err) {
        console.error('Erreur lors du chargement des plats:', err)
        setError('Erreur lors du chargement du menu')
      } finally {
        setIsLoading(false)
      }
    }

    loadDishes()
  }, [])

  // Convertir les plats Firestore en format MenuItem
  const menuItems: MenuItem[] = dishes.map(dish => ({
    id: dish.id || '',
    name: dish.name,
    description: dish.description,
    price: dish.price,
    image: dish.imageUrl || '🍽️', // Utiliser l'image Cloudinary ou une icône par défaut
    category: dish.category,
    allergens: dish.allergens || []
  }))

  const filteredItems = activeCategory === 'all' 
    ? menuItems 
    : menuItems.filter(item => item.category === activeCategory)

  const handleAddToCart = (item: MenuItem) => {
    const cartItem: CartItem = {
      ...item,
      quantity: 1
    }
    addItem(cartItem)
  }

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'food': return 'Plats'
      case 'drink': return 'Boissons'
      case 'dessert': return 'Desserts'
      case 'appetizer': return 'Entrées'
      default: return category
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'food': return <Utensils className="h-4 w-4" />
      case 'drink': return <Coffee className="h-4 w-4" />
      case 'dessert': return <Dessert className="h-4 w-4" />
      case 'appetizer': return <ChefHat className="h-4 w-4" />
      default: return <Utensils className="h-4 w-4" />
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex justify-center">
          <div className="inline-flex bg-white dark:bg-gray-800 rounded-xl p-1 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-3 rounded-lg font-medium text-gray-400">
              Chargement...
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden animate-pulse">
              <div className="h-48 bg-gray-200 dark:bg-gray-700"></div>
              <div className="p-6 space-y-3">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
          <ChefHat className="h-8 w-8 text-red-500" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Erreur de chargement
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {error}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-restaurant-600 hover:bg-restaurant-700 rounded-lg transition-colors"
        >
          Réessayer
        </button>
      </div>
    )
  }

  if (dishes.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
          <ChefHat className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Aucun plat disponible
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Le menu sera bientôt disponible.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Category Filter */}
      <div className="flex justify-center">
        <div className="inline-flex bg-white dark:bg-gray-800 rounded-xl p-1 shadow-lg border border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              activeCategory === 'all'
                ? 'bg-restaurant-500 text-white shadow-md'
                : 'text-gray-600 dark:text-gray-300 hover:text-restaurant-600 dark:hover:text-restaurant-400'
            }`}
          >
            Tout
          </button>
          {['food', 'drink', 'dessert', 'appetizer'].map((category) => {
            const categoryItems = dishes.filter(dish => dish.category === category)
            if (categoryItems.length === 0) return null
            
            return (
              <button
                key={category}
                onClick={() => setActiveCategory(category as any)}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                  activeCategory === category
                    ? 'bg-restaurant-500 text-white shadow-md'
                    : 'text-gray-600 dark:text-gray-300 hover:text-restaurant-600 dark:hover:text-restaurant-400'
                }`}
              >
                {getCategoryIcon(category)}
                {getCategoryLabel(category)}
              </button>
            )
          })}
        </div>
      </div>

      {/* Menu Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
          >
            {/* Image */}
            <div className="h-48 bg-gradient-to-br from-restaurant-100 to-restaurant-200 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center overflow-hidden">
              {item.image && item.image.startsWith('http') ? (
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                    target.nextElementSibling?.classList.remove('hidden')
                  }}
                />
              ) : null}
              <span className={`text-6xl ${item.image && item.image.startsWith('http') ? 'hidden' : ''}`}>
                {item.image || '🍽️'}
              </span>
            </div>
            
            {/* Content */}
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-restaurant-600 dark:group-hover:text-restaurant-400 transition-colors">
                  {item.name}
                </h3>
                <span className="text-xl font-bold text-restaurant-600 dark:text-restaurant-400">
                  {item.price.toFixed(2)}€
                </span>
              </div>
              
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
                {item.description}
              </p>
              
              {/* Allergens */}
              {item.allergens && item.allergens.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Allergènes:</p>
                  <div className="flex flex-wrap gap-1">
                    {item.allergens.slice(0, 3).map((allergen: string) => (
                      <span
                        key={allergen}
                        className="px-2 py-1 text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded-full"
                      >
                        {allergen}
                      </span>
                    ))}
                    {item.allergens.length > 3 && (
                      <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                        +{item.allergens.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              )}
              
              {/* Add to Cart Button */}
              <button
                onClick={() => handleAddToCart(item)}
                className="w-full bg-gradient-to-r from-restaurant-500 to-restaurant-600 hover:from-restaurant-600 hover:to-restaurant-700 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105"
              >
                <Plus className="h-4 w-4" />
                Ajouter au panier
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State for Filtered Results */}
      {filteredItems.length === 0 && dishes.length > 0 && (
        <div className="text-center py-12">
          <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
            {getCategoryIcon(activeCategory)}
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Aucun {getCategoryLabel(activeCategory).toLowerCase()} disponible
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Essayez une autre catégorie ou revenez plus tard.
          </p>
        </div>
      )}
    </div>
  )
} 