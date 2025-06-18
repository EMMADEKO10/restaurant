import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore'
import { db } from './config'

export interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
  category: string
}

export interface Table {
  id: string
  number: number
  capacity: number
  location: 'window' | 'indoor' | 'outdoor'
}

export interface Order {
  id?: string
  orderNumber: string
  items: OrderItem[]
  total: number
  table: Table
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled'
  orderTime: any
  estimatedReadyTime?: any
  notes?: string
  createdAt?: any
  updatedAt?: any
}

// Générer un numéro de commande unique
const generateOrderNumber = (): string => {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substr(2, 5)
  return `CMD-${timestamp}-${random}`.toUpperCase()
}

// Créer une nouvelle commande
export const createOrder = async (orderData: Omit<Order, 'id' | 'orderNumber' | 'orderTime' | 'createdAt' | 'updatedAt'>) => {
  try {
    const orderWithMetadata = {
      ...orderData,
      orderNumber: generateOrderNumber(),
      orderTime: serverTimestamp(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }
    
    const docRef = await addDoc(collection(db, 'orders'), orderWithMetadata)
    return { id: docRef.id, ...orderWithMetadata }
  } catch (error) {
    console.error('Erreur lors de la création de la commande:', error)
    throw error
  }
}

// Récupérer une commande par ID
export const getOrderById = async (orderId: string): Promise<Order | null> => {
  try {
    const orderDoc = await getDoc(doc(db, 'orders', orderId))
    if (orderDoc.exists()) {
      return { id: orderDoc.id, ...orderDoc.data() } as Order
    }
    return null
  } catch (error) {
    console.error('Erreur lors de la récupération de la commande:', error)
    throw error
  }
}

// Récupérer toutes les commandes (pour l'admin et les serveurs)
export const getAllOrders = async () => {
  try {
    const q = query(
      collection(db, 'orders'),
      orderBy('createdAt', 'desc')
    )
    
    const querySnapshot = await getDocs(q)
    const orders: Order[] = []
    
    querySnapshot.forEach((doc) => {
      orders.push({ id: doc.id, ...doc.data() } as Order)
    })
    
    return orders
  } catch (error) {
    console.error('Erreur lors de la récupération de toutes les commandes:', error)
    throw error
  }
}

// Récupérer les commandes par statut
export const getOrdersByStatus = async (status: Order['status']) => {
  try {
    const q = query(
      collection(db, 'orders'),
      where('status', '==', status),
      orderBy('createdAt', 'desc')
    )
    
    const querySnapshot = await getDocs(q)
    const orders: Order[] = []
    
    querySnapshot.forEach((doc) => {
      orders.push({ id: doc.id, ...doc.data() } as Order)
    })
    
    return orders
  } catch (error) {
    console.error('Erreur lors de la récupération des commandes par statut:', error)
    throw error
  }
}

// Mettre à jour le statut d'une commande
export const updateOrderStatus = async (orderId: string, status: Order['status'], estimatedReadyTime?: Date) => {
  try {
    const orderRef = doc(db, 'orders', orderId)
    const updateData: any = {
      status,
      updatedAt: serverTimestamp()
    }
    
    if (estimatedReadyTime) {
      updateData.estimatedReadyTime = estimatedReadyTime
    }
    
    await updateDoc(orderRef, updateData)
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut de la commande:', error)
    throw error
  }
}

// Mettre à jour une commande
export const updateOrder = async (orderId: string, orderData: Partial<Order>) => {
  try {
    const orderRef = doc(db, 'orders', orderId)
    await updateDoc(orderRef, {
      ...orderData,
      updatedAt: serverTimestamp()
    })
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la commande:', error)
    throw error
  }
}

// Supprimer une commande
export const deleteOrder = async (orderId: string) => {
  try {
    await deleteDoc(doc(db, 'orders', orderId))
  } catch (error) {
    console.error('Erreur lors de la suppression de la commande:', error)
    throw error
  }
} 