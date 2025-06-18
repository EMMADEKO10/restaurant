"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/contexts/CartContext'
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  Users, 
  CheckCircle, 
  CreditCard,
  Receipt
} from 'lucide-react'
import Header from '@/components/homePage/Header'

interface Table {
  id: string
  number: number
  capacity: number
  isAvailable: boolean
  location: 'indoor' | 'outdoor' | 'window'
}

export default function CheckoutPage() {
  const router = useRouter()
  const { state, clearCart } = useCart()
  const [selectedTable, setSelectedTable] = useState<Table | null>(null)
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Tables disponibles (simulation)
  const availableTables: Table[] = [
    { id: '1', number: 1, capacity: 2, isAvailable: true, location: 'window' },
    { id: '2', number: 2, capacity: 4, isAvailable: true, location: 'indoor' },
    { id: '3', number: 3, capacity: 6, isAvailable: true, location: 'outdoor' },
    { id: '4', number: 4, capacity: 2, isAvailable: true, location: 'window' },
    { id: '5', number: 5, capacity: 8, isAvailable: true, location: 'indoor' },
    { id: '6', number: 6, capacity: 4, isAvailable: true, location: 'outdoor' },
    { id: '7', number: 7, capacity: 2, isAvailable: false, location: 'window' },
    { id: '8', number: 8, capacity: 6, isAvailable: true, location: 'indoor' },
  ]

  const getLocationIcon = (location: string) => {
    switch (location) {
      case 'window': return '🪟'
      case 'outdoor': return '🌳'
      case 'indoor': return '🏠'
      default: return '🪑'
    }
  }

  const getLocationLabel = (location: string) => {
    switch (location) {
      case 'window': return 'Fenêtre'
      case 'outdoor': return 'Terrasse'
      case 'indoor': return 'Intérieur'
      default: return 'Standard'
    }
  }

  const handleTableSelect = (table: Table) => {
    setSelectedTable(table)
    setCurrentStep(2)
  }

  const handleSubmitOrder = async () => {
    if (!selectedTable) {
      return
    }

    setIsSubmitting(true)
    
    // Simulation d'envoi de commande
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Redirection vers la page de confirmation
    router.push('/checkout/success')
  }

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-restaurant-50 via-white to-business-50">
        <Header 
          onLogin={() => router.push('/auth/login')}
          onRegister={() => router.push('/auth/register')}
          onCartToggle={() => {}}
          isLoading={false}
        />
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="max-w-md mx-auto">
            <Receipt className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Panier vide</h1>
            <p className="text-gray-600 mb-6">Votre panier est vide. Ajoutez des plats pour continuer.</p>
            <button
              onClick={() => router.push('/')}
              className="inline-flex items-center px-6 py-3 bg-restaurant-600 text-white rounded-lg hover:bg-restaurant-700 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour au menu
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-restaurant-50 via-white to-business-50">
      <Header 
        onLogin={() => router.push('/auth/login')}
        onRegister={() => router.push('/auth/register')}
        onCartToggle={() => {}}
        isLoading={false}
      />

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => router.push('/')}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour au menu
          </button>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-4">
              {[1, 2].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    currentStep >= step 
                      ? 'bg-restaurant-500 border-restaurant-500 text-white' 
                      : 'border-gray-300 text-gray-500'
                  }`}>
                    {currentStep > step ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <span className="font-semibold">{step}</span>
                    )}
                  </div>
                  {step < 2 && (
                    <div className={`w-16 h-0.5 mx-2 ${
                      currentStep > step ? 'bg-restaurant-500' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-center mt-4 space-x-8">
              <span className={`text-sm ${currentStep >= 1 ? 'text-restaurant-600 font-medium' : 'text-gray-500'}`}>
                Sélection de table
              </span>
              <span className={`text-sm ${currentStep >= 2 ? 'text-restaurant-600 font-medium' : 'text-gray-500'}`}>
                Confirmation
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {currentStep === 1 && (
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Choisissez votre table</h2>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {availableTables.map((table) => (
                      <button
                        key={table.id}
                        onClick={() => table.isAvailable && handleTableSelect(table)}
                        disabled={!table.isAvailable}
                        className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                          table.isAvailable
                            ? 'border-gray-200 hover:border-restaurant-500 hover:shadow-lg cursor-pointer'
                            : 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-50'
                        }`}
                      >
                        <div className="text-center">
                          <div className="text-2xl mb-2">{getLocationIcon(table.location)}</div>
                          <h3 className="font-semibold text-gray-900">Table {table.number}</h3>
                          <p className="text-sm text-gray-600 mb-2">
                            {table.capacity} {table.capacity === 1 ? 'personne' : 'personnes'}
                          </p>
                          <p className="text-xs text-gray-500">{getLocationLabel(table.location)}</p>
                          {!table.isAvailable && (
                            <p className="text-xs text-red-500 mt-1">Occupée</p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Confirmation de commande</h2>
                  
                  <div className="space-y-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">Résumé de la commande</h3>
                      <div className="space-y-2 text-sm">
                        <p><strong>Table :</strong> {selectedTable?.number} ({getLocationLabel(selectedTable?.location || '')})</p>
                        <p><strong>Capacité :</strong> {selectedTable?.capacity} personnes</p>
                        <p><strong>Heure de commande :</strong> {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
                        <p><strong>Date :</strong> {new Date().toLocaleDateString('fr-FR')}</p>
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <button
                        onClick={() => setCurrentStep(1)}
                        className="px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Retour
                      </button>
                      <button
                        onClick={handleSubmitOrder}
                        disabled={isSubmitting}
                        className="px-8 py-3 bg-restaurant-600 text-white rounded-lg hover:bg-restaurant-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Traitement...
                          </>
                        ) : (
                          <>
                            <CreditCard className="h-4 w-4 mr-2" />
                            Confirmer la commande
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Résumé de la commande</h3>
                
                <div className="space-y-3 mb-6">
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
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Sous-total</span>
                    <span className="font-medium">{state.total.toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Service</span>
                    <span className="font-medium">Gratuit</span>
                  </div>
                  <div className="flex justify-between items-center text-lg font-semibold text-gray-900">
                    <span>Total</span>
                    <span>{state.total.toFixed(2)} €</span>
                  </div>
                </div>

                {selectedTable && (
                  <div className="mt-6 p-4 bg-restaurant-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Table sélectionnée</h4>
                    <div className="flex items-center">
                      <span className="text-2xl mr-2">{getLocationIcon(selectedTable.location)}</span>
                      <div>
                        <p className="font-medium">Table {selectedTable.number}</p>
                        <p className="text-sm text-gray-600">
                          {selectedTable.capacity} personnes • {getLocationLabel(selectedTable.location)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 