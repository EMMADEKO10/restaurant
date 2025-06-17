import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore'
import { db } from './config'
import { uploadImageToCloudinary } from '../cloudinary'

export interface Dish {
  id?: string
  name: string
  description: string
  price: number
  imageUrl: string
  category: 'food' | 'drink' | 'dessert' | 'appetizer'
  allergens?: string[]
  isAvailable: boolean
  userId: string
  createdAt?: any
  updatedAt?: any
}

// Créer un nouveau plat
export const createDish = async (dishData: Omit<Dish, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const dishWithTimestamp = {
      ...dishData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }
    
    const docRef = await addDoc(collection(db, 'dishes'), dishWithTimestamp)
    return { id: docRef.id, ...dishData }
  } catch (error) {
    console.error('Erreur lors de la création du plat:', error)
    throw error
  }
}

// Récupérer tous les plats d'un utilisateur
export const getUserDishes = async (userId: string) => {
  try {
    const q = query(
      collection(db, 'dishes'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    )
    
    const querySnapshot = await getDocs(q)
    const dishes: Dish[] = []
    
    querySnapshot.forEach((doc) => {
      dishes.push({ id: doc.id, ...doc.data() } as Dish)
    })
    
    return dishes
  } catch (error) {
    console.error('Erreur lors de la récupération des plats:', error)
    throw error
  }
}

// Mettre à jour un plat
export const updateDish = async (dishId: string, dishData: Partial<Dish>) => {
  try {
    const dishRef = doc(db, 'dishes', dishId)
    await updateDoc(dishRef, {
      ...dishData,
      updatedAt: serverTimestamp()
    })
  } catch (error) {
    console.error('Erreur lors de la mise à jour du plat:', error)
    throw error
  }
}

// Supprimer un plat
export const deleteDish = async (dishId: string) => {
  try {
    // Supprimer le document (les images Cloudinary restent, mais c'est acceptable)
    await deleteDoc(doc(db, 'dishes', dishId))
  } catch (error) {
    console.error('Erreur lors de la suppression du plat:', error)
    throw error
  }
}

// Upload d'image vers Cloudinary
export const uploadDishImage = async (file: File, userId: string): Promise<string> => {
  try {
    console.log('Début de l\'upload vers Cloudinary...')
    
    const imageUrl = await uploadImageToCloudinary(file)
    
    console.log('Upload Cloudinary terminé, URL obtenue:', imageUrl)
    
    return imageUrl
  } catch (error: any) {
    console.error('Erreur détaillée lors de l\'upload Cloudinary:', error)
    throw error
  }
}

// Récupérer tous les plats disponibles (pour le menu public)
export const getAvailableDishes = async () => {
  try {
    const q = query(
      collection(db, 'dishes'),
      where('isAvailable', '==', true),
      orderBy('category'),
      orderBy('name')
    )
    
    const querySnapshot = await getDocs(q)
    const dishes: Dish[] = []
    
    querySnapshot.forEach((doc) => {
      dishes.push({ id: doc.id, ...doc.data() } as Dish)
    })
    
    return dishes
  } catch (error) {
    console.error('Erreur lors de la récupération des plats disponibles:', error)
    throw error
  }
} 