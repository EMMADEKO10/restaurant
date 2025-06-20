"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChefHat, LogIn, UserPlus } from 'lucide-react'
import Header from '@/components/homePage/Header'
import MenuSection from '@/components/homePage/MenuSection'
import Cart from '@/components/homePage/Cart'
import FirebaseTest from '@/components/debug/FirebaseTest'

export default function HomePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  // const [showDebug, setShowDebug] = useState(false)

  const handleNavigation = (path: string) => {
    setIsLoading(true)
    setTimeout(() => {
      router.push(path)
    }, 300)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-restaurant-50 via-white to-business-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header 
        onLogin={() => handleNavigation('/auth/login')}
        onRegister={() => handleNavigation('/auth/register')}
        onCartToggle={() => setIsCartOpen(!isCartOpen)}
        isLoading={isLoading}
      />
      
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Bienvenue chez 
            <span className="text-restaurant-500"> Restaurant Manager</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Découvrez notre délicieuse sélection de plats et boissons. 
            Ajoutez vos favoris au panier et passez votre commande facilement.
          </p>
          
          {/* Bouton de debug temporaire */}
          {/* <button
            onClick={() => setShowDebug(!showDebug)}
            className="mt-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            {showDebug ? 'Masquer Debug' : 'Afficher Debug Firebase'}
          </button> */}
        </div>

        {/* {showDebug && (
          <div className="mb-8">
            <FirebaseTest />
          </div>
        )} */}

        <MenuSection />
      </main>

      <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  )
}