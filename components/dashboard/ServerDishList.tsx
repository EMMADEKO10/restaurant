"use client"

import { useState } from 'react'
import { ChefHat, Image as ImageIcon } from 'lucide-react'
import type { Dish } from '@/lib/firebase/dishes'

interface ServerDishListProps {
  dishes: Dish[]
}

export default function ServerDishList({ dishes }: ServerDishListProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const filteredDishes = selectedCategory === 'all' 
    ? dishes 
    : dishes.filter(dish => dish.category === selectedCategory)

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'food': return 'Plat'
      case 'drink': return 'Boisson'
      case 'dessert': return 'Dessert'
      case 'appetizer': return 'Entrée'
      default: return category
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'food': return 'bg-restaurant-100 text-restaurant-800 dark:bg-restaurant-900/20 dark:text-restaurant-400'
      case 'drink': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
      case 'dessert': return 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-400'
      case 'appetizer': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Menu du Restaurant ({dishes.length})
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Consultez les plats et boissons disponibles
          </p>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1 text-sm font-medium rounded-full transition-colors ${
            selectedCategory === 'all'
              ? 'bg-restaurant-600 text-white'
              : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          Tout
        </button>
        {['food', 'drink', 'dessert', 'appetizer'].map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-3 py-1 text-sm font-medium rounded-full transition-colors ${
              selectedCategory === category
                ? 'bg-restaurant-600 text-white'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {getCategoryLabel(category)}
          </button>
        ))}
      </div>

      {/* Dishes Grid */}
      {filteredDishes.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
            <ChefHat className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Aucun plat trouvé
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {selectedCategory === 'all' 
              ? 'Aucun plat disponible dans le menu'
              : `Aucun ${getCategoryLabel(selectedCategory).toLowerCase()} dans cette catégorie.`
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDishes.map((dish) => (
            <div
              key={dish.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Dish Image */}
              <div className="h-48 bg-gradient-to-br from-restaurant-100 to-restaurant-200 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center relative overflow-hidden">
                {dish.imageUrl ? (
                  <img
                    src={dish.imageUrl}
                    alt={dish.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                      target.nextElementSibling?.classList.remove('hidden')
                    }}
                  />
                ) : null}
                <div className={`absolute inset-0 flex items-center justify-center ${dish.imageUrl ? 'hidden' : ''}`}>
                  <ImageIcon className="h-12 w-12 text-gray-400" />
                </div>
              </div>

              {/* Dish Content */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-gray-900 dark:text-white truncate">
                    {dish.name}
                  </h4>
                  <span className="text-lg font-semibold text-restaurant-600 dark:text-restaurant-400">
                    {dish.price.toLocaleString('fr-CD')} FC
                  </span>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                  {dish.description}
                </p>

                {/* Category Badge */}
                <div className="flex items-center justify-between mb-3">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(dish.category)}`}>
                    {getCategoryLabel(dish.category)}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    dish.isAvailable 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                  }`}>
                    {dish.isAvailable ? 'Disponible' : 'Indisponible'}
                  </span>
                </div>

                {/* Allergens */}
                {dish.allergens && dish.allergens.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Allergènes:</p>
                    <div className="flex flex-wrap gap-1">
                      {dish.allergens.slice(0, 3).map((allergen) => (
                        <span
                          key={allergen}
                          className="px-1.5 py-0.5 text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded"
                        >
                          {allergen}
                        </span>
                      ))}
                      {dish.allergens.length > 3 && (
                        <span className="px-1.5 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                          +{dish.allergens.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 