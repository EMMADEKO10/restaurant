"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/contexts/CartContext'
import { 
  CheckCircle, 
  Home, 
  Receipt, 
  MapPin,
  Phone,
  Clock
} from 'lucide-react'
import Header from '@/components/homePage/Header'

export default function CheckoutSuccessPage() {
  const router = useRouter()
  const { state, clearCart } = useCart()

  useEffect(() => {
    // Vider le panier après 5 secondes
    const timer = setTimeout(() => {
      clearCart()
    }, 5000)

    return () => clearTimeout(timer)
  }, [clearCart])

  const handleBackToHome = () => {
    clearCart()
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-restaurant-50 via-white to-business-50">
      <Header 
        onLogin={() => router.push('/auth/login')}
        onRegister={() => router.push('/auth/register')}
        onCartToggle={() => {}}
        isLoading={false}
      />

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          {/* Success Icon */}
          <div className="mb-8">
            <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Commande confirmée !
            </h1>
            <p className="text-lg text-gray-600">
              Votre commande a été enregistrée avec succès
            </p>
          </div>

          {/* Order Details */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Détails de votre commande</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="flex items-center">
                <Receipt className="h-5 w-5 text-gray-400 mr-3" />
                <div className="text-left">
                  <p className="text-sm text-gray-500">Numéro de commande</p>
                  <p className="font-medium text-gray-900">#{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-gray-400 mr-3" />
                <div className="text-left">
                  <p className="text-sm text-gray-500">Date de commande</p>
                  <p className="font-medium text-gray-900">{new Date().toLocaleDateString('fr-FR')}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-gray-400 mr-3" />
                <div className="text-left">
                  <p className="text-sm text-gray-500">Heure de commande</p>
                  <p className="font-medium text-gray-900">{new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <MapPin className="h-5 w-5 text-gray-400 mr-3" />
                <div className="text-left">
                  <p className="text-sm text-gray-500">Table</p>
                  <p className="font-medium text-gray-900">Table 5 (8 personnes)</p>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="border-t pt-6">
              <h3 className="font-semibold text-gray-900 mb-4">Résumé de la commande</h3>
              <div className="space-y-3 mb-4">
                {state.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-500">Quantité: {item.quantity}</p>
                    </div>
                    <p className="font-medium text-gray-900">
                      {(item.price * item.quantity).toFixed(2)} €
                    </p>
                  </div>
                ))}
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-lg font-semibold text-gray-900">
                  <span>Total</span>
                  <span>{state.total.toFixed(2)} €</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-blue-50 rounded-2xl p-6 mb-8">
            <h3 className="font-semibold text-gray-900 mb-4">Informations importantes</h3>
            <div className="space-y-3 text-left">
              <div className="flex items-start">
                <Phone className="h-5 w-5 text-blue-500 mr-3 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Contact</p>
                  <p className="text-sm text-gray-600">Nous vous contacterons pour confirmer votre commande</p>
                </div>
              </div>
              <div className="flex items-start">
                <Clock className="h-5 w-5 text-blue-500 mr-3 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Préparation</p>
                  <p className="text-sm text-gray-600">Votre commande sera prête dans environ 15-20 minutes</p>
                </div>
              </div>
              <div className="flex items-start">
                <MapPin className="h-5 w-5 text-blue-500 mr-3 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Adresse</p>
                  <p className="text-sm text-gray-600">123 Rue de la Gastronomie, 75001 Paris</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleBackToHome}
              className="inline-flex items-center justify-center px-8 py-3 bg-restaurant-600 text-white rounded-lg hover:bg-restaurant-700 transition-colors"
            >
              <Home className="h-4 w-4 mr-2" />
              Retour à l'accueil
            </button>
            
            <button
              onClick={() => window.print()}
              className="inline-flex items-center justify-center px-8 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Receipt className="h-4 w-4 mr-2" />
              Imprimer la confirmation
            </button>
          </div>

          {/* Auto-redirect notice */}
          <p className="text-sm text-gray-500 mt-6">
            Vous serez automatiquement redirigé vers l'accueil dans quelques secondes...
          </p>
        </div>
      </div>
    </div>
  )
} 