"use client"

import { useState } from 'react'
import { Plus, Utensils, Coffee } from 'lucide-react'
import { useCart, MenuItem, CartItem } from '@/contexts/CartContext'

// Données d'exemple pour les produits
const menuItems: MenuItem[] = [
  // Plats
  {
    id: '1',
    name: 'Burger Classique',
    description: 'Pain artisanal, steak haché 200g, cheddar, salade, tomate, oignon',
    price: 14.90,
    image: '🍔',
    category: 'food',
    allergens: ['gluten', 'lactose']
  },
  {
    id: '2',
    name: 'Pizza Margherita',
    description: 'Base tomate, mozzarella di bufala, basilic frais, huile d\'olive',
    price: 12.50,
    image: '🍕',
    category: 'food',
    allergens: ['gluten', 'lactose']
  },
  {
    id: '3',
    name: 'Salade César',
    description: 'Salade romaine, poulet grillé, parmesan, croûtons, sauce césar',
    price: 11.90,
    image: '🥗',
    category: 'food',
    allergens: ['lactose', 'œufs']
  },
  {
    id: '4',
    name: 'Pasta Carbonara',
    description: 'Spaghetti, lardons, œuf, parmesan, crème fraîche, poivre noir',
    price: 13.90,
    image: '🍝',
    category: 'food',
    allergens: ['gluten', 'lactose', 'œufs']
  },
  {
    id: '5',
    name: 'Tacos Poulet',
    description: 'Tortilla, poulet épicé, cheddar, salade, tomate, sauce épicée',
    price: 9.90,
    image: '🌮',
    category: 'food',
    allergens: ['gluten', 'lactose']
  },
  {
    id: '6',
    name: 'Fish & Chips',
    description: 'Poisson pané, frites maison, sauce tartare, salade de chou',
    price: 15.90,
    image: '🍟',
    category: 'food',
    allergens: ['gluten', 'œufs']
  },
  
  // Boissons
  {
    id: '7',
    name: 'Coca-Cola',
    description: 'Boisson gazeuse rafraîchissante - 33cl',
    price: 3.50,
    image: '🥤',
    category: 'drink'
  },
  {
    id: '8',
    name: 'Jus d\'Orange Frais',
    description: 'Jus d\'orange pressé du jour - 25cl',
    price: 4.90,
    image: '🍊',
    category: 'drink'
  },
  {
    id: '9',
    name: 'Café Espresso',
    description: 'Café italien intense et aromatique',
    price: 2.50,
    image: '☕',
    category: 'drink'
  },
  {
    id: '10',
    name: 'Thé Vert',
    description: 'Thé vert bio, miel et citron disponibles',
    price: 3.00,
    image: '🍵',
    category: 'drink'
  },
  {
    id: '11',
    name: 'Smoothie Fruits Rouges',
    description: 'Fraises, framboises, myrtilles, yaourt grec - 40cl',
    price: 5.90,
    image: '🥤',
    category: 'drink'
  },
  {
    id: '12',
    name: 'Bière Artisanale',
    description: 'Bière blonde locale, 5.2% vol - 33cl',
    price: 4.50,
    image: '🍺',
    category: 'drink'
  }
]

export default function MenuSection() {
  const [activeCategory, setActiveCategory] = useState<'all' | 'food' | 'drink'>('all')
  const { addItem } = useCart()

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
          <button
            onClick={() => setActiveCategory('food')}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
              activeCategory === 'food'
                ? 'bg-restaurant-500 text-white shadow-md'
                : 'text-gray-600 dark:text-gray-300 hover:text-restaurant-600 dark:hover:text-restaurant-400'
            }`}
          >
            <Utensils className="h-4 w-4" />
            Plats
          </button>
          <button
            onClick={() => setActiveCategory('drink')}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
              activeCategory === 'drink'
                ? 'bg-restaurant-500 text-white shadow-md'
                : 'text-gray-600 dark:text-gray-300 hover:text-restaurant-600 dark:hover:text-restaurant-400'
            }`}
          >
            <Coffee className="h-4 w-4" />
            Boissons
          </button>
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
            <div className="h-48 bg-gradient-to-br from-restaurant-100 to-restaurant-200 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center">
              <span className="text-6xl">{item.image}</span>
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
                    {item.allergens.map((allergen: string) => (
                      <span
                        key={allergen}
                        className="px-2 py-1 text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded-full"
                      >
                        {allergen}
                      </span>
                    ))}
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
    </div>
  )
}