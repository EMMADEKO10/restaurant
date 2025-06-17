"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChefHat, Users, BarChart3, Settings, LogIn, UserPlus } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function HomePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleNavigation = (path: string) => {
    setIsLoading(true)
    setTimeout(() => {
      router.push(path)
    }, 300)
  }

  const features = [
    {
      icon: ChefHat,
      title: "Gestion du Menu",
      description: "Créez et gérez votre carte avec facilité",
      color: "text-restaurant-600 bg-restaurant-50 dark:bg-restaurant-900/20"
    },
    {
      icon: Users,
      title: "Prise de Commandes",
      description: "Interface intuitive pour les serveurs",
      color: "text-business-600 bg-business-50 dark:bg-business-900/20"
    },
    {
      icon: BarChart3,
      title: "Analytics",
      description: "Suivez vos performances en temps réel",
      color: "text-success-600 bg-success-50 dark:bg-success-900/20"
    },
    {
      icon: Settings,
      title: "Configuration",
      description: "Personnalisez selon vos besoins",
      color: "text-warning-600 bg-warning-50 dark:bg-warning-900/20"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-restaurant-50 via-white to-business-50 dark:from-dark-900 dark:via-dark-800 dark:to-dark-900">
      {/* Header */}
      <header className="relative overflow-hidden bg-white/80 backdrop-blur-sm border-b border-gray-200 dark:bg-dark-800/80 dark:border-dark-700">
        <div className="container-main">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-restaurant-500 rounded-lg">
                <ChefHat className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Restaurant Manager
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Gestion complète de votre établissement
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleNavigation('/auth/login')}
                className="btn btn-outline"
                disabled={isLoading}
              >
                <LogIn className="h-4 w-4 mr-2" />
                Connexion
              </button>
              <button
                onClick={() => handleNavigation('/auth/register')}
                className="btn btn-primary"
                disabled={isLoading}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Inscription
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="container-main">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Gérez votre restaurant avec
              <span className="text-restaurant-500"> simplicité</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              Une plateforme complète pour optimiser vos opérations, 
              améliorer l'expérience client et augmenter vos profits.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => handleNavigation('/auth/register')}
                className="btn btn-primary text-lg px-8 py-4"
                disabled={isLoading}
              >
                Commencer gratuitement
              </button>
              <button
                onClick={() => handleNavigation('/auth/login')}
                className="btn btn-ghost text-lg px-8 py-4"
                disabled={isLoading}
              >
                Démo en ligne
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-dark-800">
        <div className="container-main">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Fonctionnalités principales
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Tout ce dont vous avez besoin pour gérer votre restaurant efficacement
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group p-6 rounded-xl border border-gray-200 dark:border-dark-700 bg-white dark:bg-dark-900 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className={cn(
                  "w-12 h-12 rounded-lg flex items-center justify-center mb-4",
                  feature.color
                )}>
                  <feature.icon className="h-6 w-6" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h4>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-restaurant-50 dark:bg-dark-900">
        <div className="container-main">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-restaurant-600 dark:text-restaurant-400 mb-2">
                500+
              </div>
              <div className="text-gray-600 dark:text-gray-300">
                Restaurants utilisent notre plateforme
              </div>
            </div>
            <div>
              <div className="text-4xl font-bold text-business-600 dark:text-business-400 mb-2">
                50k+
              </div>
              <div className="text-gray-600 dark:text-gray-300">
                Commandes traitées quotidiennement
              </div>
            </div>
            <div>
              <div className="text-4xl font-bold text-success-600 dark:text-success-400 mb-2">
                99.9%
              </div>
              <div className="text-gray-600 dark:text-gray-300">
                Taux de disponibilité
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-restaurant-500 to-business-500">
        <div className="container-main text-center">
          <h3 className="text-3xl font-bold text-white mb-4">
            Prêt à transformer votre restaurant ?
          </h3>
          <p className="text-xl text-restaurant-100 mb-8">
            Rejoignez des centaines de restaurateurs qui font confiance à notre plateforme
          </p>
          <button
            onClick={() => handleNavigation('/auth/register')}
            className="btn bg-white text-restaurant-600 hover:bg-gray-100 text-lg px-8 py-4"
            disabled={isLoading}
          >
            Commencer maintenant
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container-main">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <ChefHat className="h-6 w-6 text-restaurant-400" />
                <span className="text-xl font-bold">Restaurant Manager</span>
              </div>
              <p className="text-gray-400">
                La solution complète pour la gestion de votre restaurant.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Produit</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Fonctionnalités</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Tarifs</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Intégrations</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Entreprise</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">À propos</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Carrières</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Restaurant Manager. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  )
} 