"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChefHat, LogIn, UserPlus, ShoppingCart, Menu, X, User as UserIcon, LogOut } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import Link from 'next/link'
import { getAuth, onAuthStateChanged, User } from 'firebase/auth'
import { getFirestore, doc, getDoc } from 'firebase/firestore'
import app from '@/lib/firebase/config'
import type { User as FirebaseUser } from 'firebase/auth'
import { useAuth } from '@/lib/hooks/useAuth'

interface HeaderProps {
  onLogin: () => void
  onRegister: () => void
  onCartToggle: () => void
  isLoading: boolean
}

export default function Header({ onLogin, onRegister, onCartToggle, isLoading }: HeaderProps) {
  const router = useRouter()
  const { state } = useCart()
  const itemCount = state.itemCount
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  // Utiliser le hook useAuth pour récupérer l'utilisateur et le rôle
  const { user, role, loading, logout } = useAuth()
  
  console.log("Header - État actuel:", { user: user?.email, role, loading })

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  const handleCartClick = () => {
    if (itemCount > 0) {
      // Rediriger vers la page de commande si le panier n'est pas vide
      router.push('/checkout')
    } else {
      // Ouvrir le modal panier si le panier est vide
      onCartToggle()
    }
  }

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/auth');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 dark:bg-gray-800/95 dark:border-gray-700 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3 sm:py-4">
          {/* Logo et titre */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity">
            <div className="p-1.5 sm:p-2 bg-gradient-to-r from-restaurant-500 to-restaurant-600 rounded-lg sm:rounded-xl shadow-md">
              <ChefHat className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                Restaurant Manager
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                Saveurs authentiques et fraîches
              </p>
            </div>
            <div className="sm:hidden">
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                Restaurant
              </h1>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Manager
              </p>
            </div>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2 lg:gap-3">
            {/* User Role Badge - Only shown if user is logged in */}
            {user && role && (
              <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-1.5">
                <UserIcon className="h-4 w-4 mr-1.5 text-restaurant-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  {role}
                </span>
              </div>
            )}
            
            {/* Cart Button */}
            <button
              onClick={handleCartClick}
              className="relative p-2.5 lg:p-3 text-gray-600 dark:text-gray-300 hover:text-restaurant-600 dark:hover:text-restaurant-400 hover:bg-restaurant-50 dark:hover:bg-gray-700 rounded-lg lg:rounded-xl transition-all duration-200"
            >
              <ShoppingCart className="h-5 w-5 lg:h-6 lg:w-6" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-restaurant-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </button>
            
            {/* Auth Buttons - Only shown if user is NOT logged in */}
            {!user && (
              <>
                <button
                  onClick={onLogin}
                  className="inline-flex items-center px-3 lg:px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200"
                  disabled={isLoading}
                >
                  <LogIn className="h-4 w-4 mr-1.5 lg:mr-2" />
                  <span className="hidden lg:inline">Connexion</span>
                  <span className="lg:hidden">Login</span>
                </button>
                
                <button
                  onClick={onRegister}
                  className="inline-flex items-center px-3 lg:px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-restaurant-500 to-restaurant-600 border border-transparent rounded-lg hover:from-restaurant-600 hover:to-restaurant-700 focus:ring-4 focus:ring-restaurant-300 dark:focus:ring-restaurant-800 transition-all duration-200 shadow-md"
                  disabled={isLoading}
                >
                  <UserPlus className="h-4 w-4 mr-1.5 lg:mr-2" />
                  <span className="hidden lg:inline">Inscription</span>
                  <span className="lg:hidden">Sign up</span>
                </button>
              </>
            )}

            {/* Logout Button - Only shown if user IS logged in */}
            {user && (
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-3 lg:px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200"
              >
                <LogOut className="h-4 w-4 mr-1.5 lg:mr-2" />
                <span className="hidden lg:inline">Déconnexion</span>
                <span className="lg:hidden">Logout</span>
              </button>
            )}
          </div>

          {/* Mobile Navigation */}
          <div className="flex items-center gap-2 md:hidden">
            {/* User Role Badge Mobile - Only shown if user is logged in */}
            {user && role && (
              <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg px-2 py-1">
                <UserIcon className="h-3 w-3 mr-1 text-restaurant-500" />
                <span className="text-xs font-medium text-gray-700 dark:text-gray-200">
                  {role}
                </span>
              </div>
            )}
            
            {/* Cart Button Mobile */}
            <button
              onClick={handleCartClick}
              className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-restaurant-600 dark:hover:text-restaurant-400 hover:bg-restaurant-50 dark:hover:bg-gray-700 rounded-lg transition-all duration-200"
            >
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-restaurant-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center animate-pulse">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </button>

            {/* Hamburger Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-restaurant-600 dark:hover:text-restaurant-400 hover:bg-restaurant-50 dark:hover:bg-gray-700 rounded-lg transition-all duration-200"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={closeMobileMenu}
            />
            <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-lg z-50">
              <div className="px-4 py-3 space-y-3">
                {/* Auth Buttons - Only shown if user is NOT logged in */}
                {!user && (
                  <>
                    <button
                      onClick={() => {
                        onLogin()
                        closeMobileMenu()
                      }}
                      className="w-full flex items-center justify-center px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200"
                      disabled={isLoading}
                    >
                      <LogIn className="h-4 w-4 mr-2" />
                      Connexion
                    </button>
                    
                    <button
                      onClick={() => {
                        onRegister()
                        closeMobileMenu()
                      }}
                      className="w-full flex items-center justify-center px-4 py-3 text-sm font-medium text-white bg-gradient-to-r from-restaurant-500 to-restaurant-600 border border-transparent rounded-lg hover:from-restaurant-600 hover:to-restaurant-700 focus:ring-4 focus:ring-restaurant-300 dark:focus:ring-restaurant-800 transition-all duration-200 shadow-md"
                      disabled={isLoading}
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Inscription
                    </button>
                  </>
                )}

                {/* Logout Button - Only shown if user IS logged in */}
                {user && (
                  <button
                    onClick={() => {
                      handleLogout()
                      closeMobileMenu()
                    }}
                    className="w-full flex items-center justify-center px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Déconnexion
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}