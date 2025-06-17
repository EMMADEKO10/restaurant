"use client"

import { useState, useRef } from 'react'
import { Plus, X, ChefHat, Upload, Image as ImageIcon } from 'lucide-react'
import { useAuth } from '@/lib/hooks/useAuth'
import { uploadImageToCloudinary } from '@/lib/cloudinary'
import type { Dish } from '@/lib/firebase/dishes'

interface CreateDishFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (dish: Omit<Dish, 'id' | 'createdAt' | 'updatedAt'>) => void
  editingDish?: Dish | null
}

const allergenOptions = [
  'gluten', 'lactose', 'œufs', 'poissons', 'crustacés', 'mollusques',
  'arachides', 'fruits à coque', 'céleri', 'moutarde', 'graines de sésame',
  'sulfites', 'lupin', 'soja'
]

export default function CreateDishForm({ isOpen, onClose, onSubmit, editingDish }: CreateDishFormProps) {
  const { user } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(editingDish?.imageUrl || null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({})
  
  const [formData, setFormData] = useState({
    name: editingDish?.name || '',
    description: editingDish?.description || '',
    price: editingDish?.price?.toString() || '',
    category: editingDish?.category || 'food' as const,
    allergens: editingDish?.allergens || [] as string[],
    isAvailable: editingDish?.isAvailable ?? true
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleAllergenToggle = (allergen: string) => {
    setFormData(prev => ({
      ...prev,
      allergens: prev.allergens.includes(allergen)
        ? prev.allergens.filter(a => a !== allergen)
        : [...prev.allergens, allergen]
    }))
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      
      // Créer un aperçu de l'image
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
      
      // Clear image error
      if (formErrors.image) {
        setFormErrors(prev => ({ ...prev, image: '' }))
      }
    }
  }

  const validateForm = () => {
    const errors: { [key: string]: string } = {}

    if (!formData.name.trim()) {
      errors.name = 'Le nom du plat est requis'
    }

    if (!formData.description.trim()) {
      errors.description = 'La description est requise'
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      errors.price = 'Le prix doit être supérieur à 0'
    }

    // Vérifier qu'une image est sélectionnée seulement pour les nouveaux plats
    if (!editingDish && !selectedFile && !imagePreview) {
      errors.image = 'Une image est requise'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      let imageUrl = editingDish?.imageUrl || ''

      // Upload de l'image vers Cloudinary si un nouveau fichier est sélectionné
      if (selectedFile) {
        console.log('Upload vers Cloudinary...')
        imageUrl = await uploadImageToCloudinary(selectedFile)
        console.log('URL Cloudinary obtenue:', imageUrl)
      }

      const dishData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        imageUrl,
        category: formData.category,
        allergens: formData.allergens,
        isAvailable: formData.isAvailable,
        userId: user.uid
      }
      
      await onSubmit(dishData)
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        price: '',
        category: 'food',
        allergens: [],
        isAvailable: true
      })
      setImagePreview(null)
      setSelectedFile(null)
      setFormErrors({})
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      
      onClose()
    } catch (error: any) {
      console.error('Erreur lors de la création du plat:', error)
      // Afficher l'erreur à l'utilisateur
      setFormErrors(prev => ({ 
        ...prev, 
        submit: error.message || 'Une erreur est survenue lors de la création du plat'
      }))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    // Reset form when closing
    setFormData({
      name: '',
      description: '',
      price: '',
      category: 'food',
      allergens: [],
      isAvailable: true
    })
    setImagePreview(null)
    setSelectedFile(null)
    setFormErrors({})
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-restaurant-100 dark:bg-restaurant-900/20 rounded-lg">
                <ChefHat className="h-5 w-5 text-restaurant-600 dark:text-restaurant-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {editingDish ? 'Modifier le plat' : 'Créer un nouveau plat'}
              </h2>
            </div>
            <button
              onClick={handleClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Error Message */}
            {formErrors.submit && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">{formErrors.submit}</p>
              </div>
            )}

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Image du plat {!editingDish && '*'}
              </label>
              <div className="space-y-4">
                {/* Image Preview */}
                {imagePreview && (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Aperçu"
                      className="w-full h-48 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null)
                        setSelectedFile(null)
                        if (fileInputRef.current) {
                          fileInputRef.current.value = ''
                        }
                      }}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
                
                {/* Upload Button */}
                <div>
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      {imagePreview ? (
                        <ImageIcon className="w-8 h-8 mb-2 text-gray-500 dark:text-gray-400" />
                      ) : (
                        <Upload className="w-8 h-8 mb-2 text-gray-500 dark:text-gray-400" />
                      )}
                      <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-semibold">Cliquez pour uploader</span> ou glissez-déposez
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        PNG, JPG, GIF jusqu'à 10MB
                      </p>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageSelect}
                    />
                  </label>
                </div>
                {formErrors.image && (
                  <p className="text-sm text-red-600 dark:text-red-400">{formErrors.image}</p>
                )}
              </div>
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nom du plat *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-restaurant-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                    formErrors.name 
                      ? 'border-red-500 dark:border-red-500' 
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="Ex: Burger Classique"
                />
                {formErrors.name && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">{formErrors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Prix (€) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-restaurant-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                    formErrors.price 
                      ? 'border-red-500 dark:border-red-500' 
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="14.90"
                />
                {formErrors.price && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">{formErrors.price}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-restaurant-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                  formErrors.description 
                    ? 'border-red-500 dark:border-red-500' 
                    : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="Décrivez les ingrédients et la préparation..."
              />
              {formErrors.description && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">{formErrors.description}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Catégorie *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-restaurant-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="food">Plat</option>
                  <option value="drink">Boisson</option>
                  <option value="dessert">Dessert</option>
                  <option value="appetizer">Entrée</option>
                </select>
              </div>
            </div>

            {/* Allergens */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Allergènes
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {allergenOptions.map((allergen) => (
                  <label key={allergen} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.allergens.includes(allergen)}
                      onChange={() => handleAllergenToggle(allergen)}
                      className="rounded border-gray-300 text-restaurant-600 focus:ring-restaurant-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                      {allergen}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Availability */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isAvailable"
                name="isAvailable"
                checked={formData.isAvailable}
                onChange={(e) => setFormData(prev => ({ ...prev, isAvailable: e.target.checked }))}
                className="rounded border-gray-300 text-restaurant-600 focus:ring-restaurant-500"
              />
              <label htmlFor="isAvailable" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Plat disponible à la commande
              </label>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-restaurant-600 hover:bg-restaurant-700 disabled:bg-restaurant-400 rounded-lg transition-colors flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {editingDish ? 'Modification...' : 'Création...'}
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    {editingDish ? 'Modifier le plat' : 'Créer le plat'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 