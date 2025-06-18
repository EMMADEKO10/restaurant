"use client"

import { useState, useEffect } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'

export default function FirebaseTest() {
  const [testResult, setTestResult] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)

  const testFirebaseConnection = async () => {
    setIsLoading(true)
    setTestResult('')

    try {
      // Test 1: Vérifier la configuration
      setTestResult('✅ Configuration Firebase chargée\n')
      
      // Test 2: Tenter de lire la collection dishes
      setTestResult(prev => prev + '🔄 Test de connexion à Firestore...\n')
      
      const dishesRef = collection(db, 'dishes')
      const snapshot = await getDocs(dishesRef)
      
      setTestResult(prev => prev + `✅ Connexion Firestore réussie\n`)
      setTestResult(prev => prev + `📊 Nombre total de documents: ${snapshot.size}\n`)
      
      // Test 3: Vérifier les variables d'environnement
      setTestResult(prev => prev + '\n🔧 Variables d\'environnement:\n')
      const envVars = [
        'NEXT_PUBLIC_FIREBASE_API_KEY',
        'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
        'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
        'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
        'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
        'NEXT_PUBLIC_FIREBASE_APP_ID'
      ]
      
      envVars.forEach(varName => {
        const value = process.env[varName]
        const status = value ? '✅' : '❌'
        const displayValue = value ? `${value.substring(0, 10)}...` : 'Non définie'
        setTestResult(prev => prev + `${status} ${varName}: ${displayValue}\n`)
      })
      
    } catch (error: any) {
      setTestResult(prev => prev + `❌ Erreur: ${error.message}\n`)
      console.error('Erreur de test Firebase:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold mb-4">Test de Connexion Firebase</h3>
      
      <button
        onClick={testFirebaseConnection}
        disabled={isLoading}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {isLoading ? 'Test en cours...' : 'Tester la connexion'}
      </button>
      
      {testResult && (
        <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
          <pre className="whitespace-pre-wrap text-sm font-mono">
            {testResult}
          </pre>
        </div>
      )}
    </div>
  )
} 