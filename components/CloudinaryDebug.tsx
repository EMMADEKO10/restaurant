"use client"

import { useState } from 'react'

export default function CloudinaryDebug() {
  const [isVisible, setIsVisible] = useState(false)

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
  const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsVisible(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg"
        >
          Debug Cloudinary
        </button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border max-w-md">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold">Configuration Cloudinary</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-2 text-sm">
        <div>
          <strong>Cloud Name:</strong> 
          <span className={cloudName ? 'text-green-600' : 'text-red-600'}>
            {cloudName || 'Non configuré'}
          </span>
        </div>
        
        <div>
          <strong>Upload Preset:</strong> 
          <span className={uploadPreset ? 'text-green-600' : 'text-red-600'}>
            {uploadPreset || 'Non configuré'}
          </span>
        </div>
        
        <div>
          <strong>API Key:</strong> 
          <span className={apiKey ? 'text-green-600' : 'text-red-600'}>
            {apiKey ? 'Configuré' : 'Non configuré'}
          </span>
        </div>
      </div>

      {!cloudName || !uploadPreset ? (
        <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded text-xs">
          <p className="font-semibold mb-1">Configuration manquante :</p>
          <p>Créez un fichier <code>.env.local</code> à la racine du projet avec :</p>
          <pre className="mt-1 bg-gray-100 dark:bg-gray-700 p-2 rounded text-xs overflow-x-auto">
{`NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dxug8bsuy
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=restaurant_dishes
NEXT_PUBLIC_CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret`}
          </pre>
        </div>
      ) : (
        <div className="mt-3 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded text-xs">
          ✅ Configuration Cloudinary correcte
        </div>
      )}
    </div>
  )
} 