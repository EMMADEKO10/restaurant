import { useState, useEffect } from 'react'
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile
} from 'firebase/auth'
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from './config'

export interface UserRole {
  role: 'admin' | 'super_admin' | 'server' | 'client'
  permissions: string[]
}

export interface UserProfile {
  uid: string
  email: string
  displayName: string
  role: UserRole
  createdAt: any
  updatedAt: any
}

// Créer un nouvel utilisateur avec un rôle
export const createUserWithRole = async (
  email: string, 
  password: string, 
  displayName: string, 
  role: UserRole['role']
) => {
  try {
    const auth = getAuth()
    
    // Créer l'utilisateur dans Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user
    
    // Mettre à jour le profil avec le nom d'affichage
    await updateProfile(user, { displayName })
    
    // Créer le profil utilisateur dans Firestore
    const userProfile: Omit<UserProfile, 'uid'> = {
      email,
      displayName,
      role: {
        role,
        permissions: getPermissionsForRole(role)
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    await setDoc(doc(db, 'users', user.uid), userProfile)
    
    return user
  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur:', error)
    throw error
  }
}

// Obtenir les permissions pour un rôle
const getPermissionsForRole = (role: UserRole['role']): string[] => {
  switch (role) {
    case 'super_admin':
      return [
        'users:read', 'users:write', 'users:delete',
        'dishes:read', 'dishes:write', 'dishes:delete',
        'orders:read', 'orders:write', 'orders:delete',
        'analytics:read', 'settings:write'
      ]
    case 'admin':
      return [
        'users:read', 'users:write',
        'dishes:read', 'dishes:write', 'dishes:delete',
        'orders:read', 'orders:write', 'orders:delete',
        'analytics:read'
      ]
    case 'server':
      return [
        'orders:read', 'orders:write',
        'dishes:read'
      ]
    case 'client':
      return [
        'dishes:read'
      ]
    default:
      return []
  }
}

// Vérifier si l'utilisateur a une permission spécifique
export const hasPermission = (user: FirebaseUser | null, permission: string): boolean => {
  if (!user) return false
  
  // Vérifier les custom claims (rôle dans le token)
  const customClaims = (user as any).customClaims
  if (customClaims && customClaims.permissions) {
    return customClaims.permissions.includes(permission)
  }
  
  return false
}

// Vérifier le rôle de l'utilisateur
export const hasRole = (user: FirebaseUser | null, role: UserRole['role']): boolean => {
  if (!user) return false
  
  const customClaims = (user as any).customClaims
  if (customClaims && customClaims.role) {
    return customClaims.role === role
  }
  
  return false
}

// Obtenir le profil utilisateur depuis Firestore
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid))
    if (userDoc.exists()) {
      return { uid, ...userDoc.data() } as UserProfile
    }
    return null
  } catch (error) {
    console.error('Erreur lors de la récupération du profil utilisateur:', error)
    return null
  }
}

// Mettre à jour le rôle d'un utilisateur (fonction admin)
export const updateUserRole = async (uid: string, newRole: UserRole['role']) => {
  try {
    const userRef = doc(db, 'users', uid)
    await updateDoc(userRef, {
      role: {
        role: newRole,
        permissions: getPermissionsForRole(newRole)
      },
      updatedAt: new Date()
    })
    
    // Note: Les Custom Claims doivent être mis à jour côté serveur (Cloud Functions)
    // Cette fonction met seulement à jour Firestore
    console.log('Rôle mis à jour dans Firestore. Les Custom Claims doivent être mis à jour côté serveur.')
  } catch (error) {
    console.error('Erreur lors de la mise à jour du rôle:', error)
    throw error
  }
}

// Fonctions d'authentification de base
export const signInUser = async (email: string, password: string) => {
  try {
    const auth = getAuth()
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    return userCredential.user
  } catch (error) {
    console.error('Erreur lors de la connexion:', error)
    throw error
  }
}

export const signOutUser = async () => {
  try {
    const auth = getAuth()
    await signOut(auth)
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error)
    throw error
  }
}

// Hook personnalisé pour l'authentification avec rôles
export const useAuthWithRoles = () => {
  const [user, setUser] = useState<FirebaseUser | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const auth = getAuth()
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)
      
      if (user) {
        // Récupérer le profil utilisateur depuis Firestore
        const profile = await getUserProfile(user.uid)
        setUserProfile(profile)
      } else {
        setUserProfile(null)
      }
      
      setLoading(false)
    })

    return unsubscribe
  }, [])

  return {
    user,
    userProfile,
    loading,
    hasPermission: (permission: string) => hasPermission(user, permission),
    hasRole: (role: UserRole['role']) => hasRole(user, role)
  }
}

export const signUp = async (email: string, password: string, displayName?: string) => {
  try {
    const auth = getAuth()
    
    // Créer l'utilisateur dans Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user
    
    if (displayName) {
      await updateProfile(user, { displayName })
    }
    
    // Créer un document utilisateur dans Firestore avec le rôle par défaut
    await setDoc(doc(db, 'users', user.uid), {
      email: user.email,
      displayName: displayName || user.email?.split('@')[0] || '',
      role: {
        role: 'client',
        permissions: getPermissionsForRole('client')
      },
      createdAt: new Date(),
      updatedAt: new Date()
    })
    
    return { success: true, user }
  } catch (error: any) {
    console.error('Erreur lors de la création du compte:', error)
    return { success: false, error: error.message || 'Erreur inconnue' }
  }
} 