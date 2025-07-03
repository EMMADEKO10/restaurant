"use client"

import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  orderBy,
  serverTimestamp,
  Timestamp,
  setDoc
} from 'firebase/firestore'
import { db } from './config'
import { Order, OrderItem } from './orders'

// Interface pour les statistiques quotidiennes
export interface DailyStats {
  id?: string
  date: string // Format: YYYY-MM-DD
  year: number
  month: number
  day: number
  totalRevenue: number
  totalOrders: number
  totalItems: number
  productSales: ProductDaySales[]
  topProduct: {
    name: string
    quantity: number
    revenue: number
  }
  createdAt?: any
  updatedAt?: any
}

// Interface pour les statistiques mensuelles
export interface MonthlyStats {
  id?: string
  yearMonth: string // Format: YYYY-MM
  year: number
  month: number
  monthName: string
  totalRevenue: number
  totalOrders: number
  totalItems: number
  averageDailyRevenue: number
  productSales: ProductMonthSales[]
  topProduct: {
    name: string
    quantity: number
    revenue: number
  }
  bestDay: {
    date: string
    revenue: number
  }
  createdAt?: any
  updatedAt?: any
}

// Interface pour les ventes de produits par jour
export interface ProductDaySales {
  name: string
  category: string
  quantity: number
  revenue: number
  averagePrice: number
  orderCount: number // Nombre de commandes contenant ce produit
}

// Interface pour les ventes de produits par mois
export interface ProductMonthSales {
  name: string
  category: string
  quantity: number
  revenue: number
  averagePrice: number
  orderCount: number
  bestDay: {
    date: string
    quantity: number
    revenue: number
  }
}

// Calculer les statistiques pour une date donnée
const calculateDailyStats = (orders: Order[], targetDate: string): DailyStats => {
  const productMap = new Map<string, ProductDaySales>()
  let totalRevenue = 0
  let totalOrders = 0
  let totalItems = 0
  
  // Filtrer les commandes de la date cible
  const dayOrders = orders.filter(order => {
    const orderDate = order.orderTime?.toDate ? order.orderTime.toDate() : 
                      order.orderTime?.seconds ? new Date(order.orderTime.seconds * 1000) : 
                      new Date(order.orderTime)
    
    return orderDate.toDateString() === new Date(targetDate).toDateString() && 
           order.status !== 'cancelled'
  })
  
  dayOrders.forEach(order => {
    totalRevenue += order.total
    totalOrders++
    
    order.items.forEach((item: OrderItem) => {
      totalItems += item.quantity
      
      const existing = productMap.get(item.name)
      if (existing) {
        existing.quantity += item.quantity
        existing.revenue += item.price * item.quantity
        existing.orderCount++
        existing.averagePrice = existing.revenue / existing.quantity
      } else {
        productMap.set(item.name, {
          name: item.name,
          category: item.category,
          quantity: item.quantity,
          revenue: item.price * item.quantity,
          averagePrice: item.price,
          orderCount: 1
        })
      }
    })
  })
  
  const productSales = Array.from(productMap.values()).sort((a, b) => b.quantity - a.quantity)
  const topProduct = productSales.length > 0 ? {
    name: productSales[0].name,
    quantity: productSales[0].quantity,
    revenue: productSales[0].revenue
  } : { name: '', quantity: 0, revenue: 0 }
  
  const date = new Date(targetDate)
  
  return {
    date: targetDate,
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
    totalRevenue,
    totalOrders,
    totalItems,
    productSales,
    topProduct
  }
}

// Calculer les statistiques mensuelles
const calculateMonthlyStats = (dailyStats: DailyStats[], year: number, month: number): MonthlyStats => {
  const monthlyData = dailyStats.filter(stats => stats.year === year && stats.month === month)
  
  if (monthlyData.length === 0) {
    const monthNames = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ]
    
    return {
      yearMonth: `${year}-${month.toString().padStart(2, '0')}`,
      year,
      month,
      monthName: monthNames[month - 1],
      totalRevenue: 0,
      totalOrders: 0,
      totalItems: 0,
      averageDailyRevenue: 0,
      productSales: [],
      topProduct: { name: '', quantity: 0, revenue: 0 },
      bestDay: { date: '', revenue: 0 }
    }
  }
  
  const productMap = new Map<string, ProductMonthSales>()
  let totalRevenue = 0
  let totalOrders = 0
  let totalItems = 0
  let bestDay = { date: '', revenue: 0 }
  
  monthlyData.forEach(dayStats => {
    totalRevenue += dayStats.totalRevenue
    totalOrders += dayStats.totalOrders
    totalItems += dayStats.totalItems
    
    // Trouver le meilleur jour
    if (dayStats.totalRevenue > bestDay.revenue) {
      bestDay = { date: dayStats.date, revenue: dayStats.totalRevenue }
    }
    
    // Agréger les produits
    dayStats.productSales.forEach(product => {
      const existing = productMap.get(product.name)
      if (existing) {
        existing.quantity += product.quantity
        existing.revenue += product.revenue
        existing.orderCount += product.orderCount
        existing.averagePrice = existing.revenue / existing.quantity
        
        // Mettre à jour le meilleur jour pour ce produit
        if (product.revenue > existing.bestDay.revenue) {
          existing.bestDay = {
            date: dayStats.date,
            quantity: product.quantity,
            revenue: product.revenue
          }
        }
      } else {
        productMap.set(product.name, {
          name: product.name,
          category: product.category,
          quantity: product.quantity,
          revenue: product.revenue,
          averagePrice: product.averagePrice,
          orderCount: product.orderCount,
          bestDay: {
            date: dayStats.date,
            quantity: product.quantity,
            revenue: product.revenue
          }
        })
      }
    })
  })
  
  const productSales = Array.from(productMap.values()).sort((a, b) => b.quantity - a.quantity)
  const topProduct = productSales.length > 0 ? {
    name: productSales[0].name,
    quantity: productSales[0].quantity,
    revenue: productSales[0].revenue
  } : { name: '', quantity: 0, revenue: 0 }
  
  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ]
  
  return {
    yearMonth: `${year}-${month.toString().padStart(2, '0')}`,
    year,
    month,
    monthName: monthNames[month - 1],
    totalRevenue,
    totalOrders,
    totalItems,
    averageDailyRevenue: totalRevenue / monthlyData.length,
    productSales,
    topProduct,
    bestDay
  }
}

// Sauvegarder les statistiques quotidiennes
export const saveDailyStats = async (stats: DailyStats) => {
  try {
    const docId = `${stats.year}-${stats.month.toString().padStart(2, '0')}-${stats.day.toString().padStart(2, '0')}`
    
    await setDoc(doc(db, 'dailyStats', docId), {
      ...stats,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    
    console.log(`📊 Statistiques quotidiennes sauvegardées pour le ${stats.date}`)
    return { id: docId, ...stats }
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des statistiques quotidiennes:', error)
    throw error
  }
}

// Sauvegarder les statistiques mensuelles
export const saveMonthlyStats = async (stats: MonthlyStats) => {
  try {
    const docId = stats.yearMonth
    
    await setDoc(doc(db, 'monthlyStats', docId), {
      ...stats,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    
    console.log(`📈 Statistiques mensuelles sauvegardées pour ${stats.monthName} ${stats.year}`)
    return { id: docId, ...stats }
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des statistiques mensuelles:', error)
    throw error
  }
}

// Générer et sauvegarder les statistiques pour une date
export const generateAndSaveDailyStats = async (orders: Order[], date: string) => {
  try {
    const stats = calculateDailyStats(orders, date)
    
    // Ne sauvegarder que si il y a des données
    if (stats.totalOrders > 0) {
      await saveDailyStats(stats)
      console.log(`✅ Statistiques générées pour le ${date}: ${stats.totalOrders} commandes, ${stats.totalRevenue} FC`)
      return stats
    } else {
      console.log(`⚠️ Aucune donnée à sauvegarder pour le ${date}`)
      return null
    }
  } catch (error) {
    console.error(`Erreur lors de la génération des statistiques pour ${date}:`, error)
    throw error
  }
}

// Générer et sauvegarder les statistiques pour un mois
export const generateAndSaveMonthlyStats = async (year: number, month: number) => {
  try {
    // Récupérer toutes les statistiques quotidiennes du mois
    const dailyStatsQuery = query(
      collection(db, 'dailyStats'),
      where('year', '==', year),
      where('month', '==', month),
      orderBy('day')
    )
    
    const dailyStatsSnapshot = await getDocs(dailyStatsQuery)
    const dailyStats: DailyStats[] = dailyStatsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as DailyStats))
    
    const monthlyStats = calculateMonthlyStats(dailyStats, year, month)
    
    if (monthlyStats.totalOrders > 0) {
      await saveMonthlyStats(monthlyStats)
      console.log(`✅ Statistiques mensuelles générées pour ${monthlyStats.monthName} ${year}`)
      return monthlyStats
    } else {
      console.log(`⚠️ Aucune donnée mensuelle à sauvegarder pour ${monthlyStats.monthName} ${year}`)
      return null
    }
  } catch (error) {
    console.error(`Erreur lors de la génération des statistiques mensuelles pour ${year}-${month}:`, error)
    throw error
  }
}

// Traitement automatique des statistiques (à appeler quotidiennement)
export const processHistoricalStats = async (orders: Order[]) => {
  try {
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    
    const yesterdayStr = yesterday.toISOString().split('T')[0]
    
    console.log('🔄 Traitement des statistiques historiques...')
    
    // Générer les statistiques pour hier
    await generateAndSaveDailyStats(orders, yesterdayStr)
    
    // Si c'est le premier jour du mois, générer les statistiques du mois précédent
    if (today.getDate() === 1) {
      const lastMonth = new Date(today)
      lastMonth.setMonth(lastMonth.getMonth() - 1)
      await generateAndSaveMonthlyStats(lastMonth.getFullYear(), lastMonth.getMonth() + 1)
    }
    
    console.log('✅ Traitement des statistiques historiques terminé')
  } catch (error) {
    console.error('❌ Erreur lors du traitement des statistiques historiques:', error)
  }
}

// Récupérer les statistiques quotidiennes
export const getDailyStats = async (year?: number, month?: number): Promise<DailyStats[]> => {
  try {
    let q = query(collection(db, 'dailyStats'), orderBy('date', 'desc'))
    
    if (year && month) {
      q = query(
        collection(db, 'dailyStats'),
        where('year', '==', year),
        where('month', '==', month),
        orderBy('day')
      )
    } else if (year) {
      q = query(
        collection(db, 'dailyStats'),
        where('year', '==', year),
        orderBy('month'),
        orderBy('day')
      )
    }
    
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as DailyStats))
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques quotidiennes:', error)
    throw error
  }
}

// Récupérer les statistiques mensuelles
export const getMonthlyStats = async (year?: number): Promise<MonthlyStats[]> => {
  try {
    let q = query(collection(db, 'monthlyStats'), orderBy('year', 'desc'), orderBy('month', 'desc'))
    
    if (year) {
      q = query(
        collection(db, 'monthlyStats'),
        where('year', '==', year),
        orderBy('month')
      )
    }
    
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as MonthlyStats))
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques mensuelles:', error)
    throw error
  }
}

// Récupérer les statistiques d'une date spécifique
export const getStatsByDate = async (date: string): Promise<DailyStats | null> => {
  try {
    const docRef = doc(db, 'dailyStats', date)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as DailyStats
    }
    return null
  } catch (error) {
    console.error(`Erreur lors de la récupération des statistiques pour ${date}:`, error)
    throw error
  }
}

// Récupérer les statistiques d'un mois spécifique
export const getStatsByMonth = async (yearMonth: string): Promise<MonthlyStats | null> => {
  try {
    const docRef = doc(db, 'monthlyStats', yearMonth)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as MonthlyStats
    }
    return null
  } catch (error) {
    console.error(`Erreur lors de la récupération des statistiques pour ${yearMonth}:`, error)
    throw error
  }
} 