"use client"

import { ChefHat, LogIn, UserPlus, ShoppingCart } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'

interface HeaderProps {
  onLogin: () => void
  onRegister: () => void
  onCartToggle: () => void
  isLoading: boolean
}

export default function Header({ onLogin, onRegister, onCartToggle, isLoading }: HeaderProps) {
  const { state } = useCart()
  const itemCount = state.itemCount

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 dark:bg-gray-800/95 dark:border-gray-700 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-restaurant-500 to-restaurant-600 rounded-xl shadow-md">
              <ChefHat className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Restaurant Manager
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Saveurs authentiques et fraîches
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Cart Button */}
            <button
              onClick={onCartToggle}
              className="relative p-3 text-gray-600 dark:text-gray-300 hover:text-restaurant-600 dark:hover:text-restaurant-400 hover:bg-restaurant-50 dark:hover:bg-gray-700 rounded-xl transition-all duration-200"
            >
              <ShoppingCart className="h-6 w-6" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-restaurant-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                  {itemCount}
                </span>
              )}
            </button>
            
            {/* Auth Buttons */}
            <button
              onClick={onLogin}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200"
              disabled={isLoading}
            >
              <LogIn className="h-4 w-4 mr-2" />
              Connexion
            </button>
            
            <button
              onClick={onRegister}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-restaurant-500 to-restaurant-600 border border-transparent rounded-lg hover:from-restaurant-600 hover:to-restaurant-700 focus:ring-4 focus:ring-restaurant-300 dark:focus:ring-restaurant-800 transition-all duration-200 shadow-md"
              disabled={isLoading}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Inscription
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}