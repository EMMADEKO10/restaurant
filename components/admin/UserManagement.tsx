"use client"

import { useState, useEffect } from 'react'
import { getFunctions, httpsCallable } from 'firebase/functions'
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { useAuthWithRoles } from '@/lib/firebase/auth'
import { 
  Users, 
  UserPlus, 
  Shield, 
  UserCheck, 
  UserX, 
  Edit, 
  Trash2,
  Plus,
  Search
} from 'lucide-react'

interface User {
  uid: string
  email: string
  displayName: string
  role: string
  permissions: string[]
  disabled?: boolean
  createdAt: string
}

export default function UserManagement() {
  const { userProfile, hasPermission } = useAuthWithRoles()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: '',
    role: 'server' as 'admin' | 'super_admin' | 'server' | 'client'
  })

  const functions = getFunctions()
  const setUserRole = httpsCallable(functions, 'setUserRole')
  const createUserWithRole = httpsCallable(functions, 'createUserWithRole')
  const getUserInfo = httpsCallable(functions, 'getUserInfo')

  // Charger les utilisateurs
  useEffect(() => {
    if (hasPermission('users:read')) {
      loadUsers()
    }
  }, [hasPermission])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const usersRef = collection(db, 'users')
      const snapshot = await getDocs(usersRef)
      const usersData: User[] = []
      
      for (const doc of snapshot.docs) {
        const userData = doc.data()
        try {
          // Récupérer les informations complètes depuis Firebase Auth
          const result = await getUserInfo({ uid: doc.id })
          const authUser = result.data as any
          
          usersData.push({
            uid: doc.id,
            email: userData.email,
            displayName: userData.displayName,
            role: authUser.customClaims?.role || 'client',
            permissions: authUser.customClaims?.permissions || [],
            disabled: authUser.disabled,
            createdAt: authUser.createdAt
          })
        } catch (error) {
          console.error('Erreur lors de la récupération des infos utilisateur:', error)
          // Utiliser les données Firestore en fallback
          usersData.push({
            uid: doc.id,
            email: userData.email,
            displayName: userData.displayName,
            role: userData.role?.role || 'client',
            permissions: userData.role?.permissions || [],
            createdAt: userData.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
          })
        }
      }
      
      setUsers(usersData)
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      await createUserWithRole(formData)
      
      // Réinitialiser le formulaire
      setFormData({
        email: '',
        password: '',
        displayName: '',
        role: 'server'
      })
      setShowCreateForm(false)
      
      // Recharger les utilisateurs
      await loadUsers()
      
      alert('Utilisateur créé avec succès !')
    } catch (error: any) {
      console.error('Erreur lors de la création:', error)
      alert(`Erreur: ${error.message}`)
    }
  }

  const handleUpdateRole = async (uid: string, newRole: string) => {
    try {
      await setUserRole({ uid, role: newRole })
      
      // Recharger les utilisateurs
      await loadUsers()
      
      alert('Rôle mis à jour avec succès !')
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour du rôle:', error)
      alert(`Erreur: ${error.message}`)
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      case 'admin': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
      case 'server': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
      case 'client': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'super_admin': return 'Super Admin'
      case 'admin': return 'Admin'
      case 'server': return 'Serveur'
      case 'client': return 'Client'
      default: return role
    }
  }

  const filteredUsers = users.filter(user =>
    user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (!hasPermission('users:read')) {
    return (
      <div className="text-center py-12">
        <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Accès refusé</h3>
        <p className="text-gray-600">Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Gestion des utilisateurs
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Gérez les utilisateurs et leurs rôles
          </p>
        </div>
        
        {hasPermission('users:write') && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-restaurant-600 hover:bg-restaurant-700 rounded-lg transition-colors"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Nouvel utilisateur
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Rechercher un utilisateur..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-restaurant-500 focus:border-transparent"
        />
      </div>

      {/* Users List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-restaurant-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Chargement des utilisateurs...</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Utilisateur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Rôle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Permissions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredUsers.map((user) => (
                  <tr key={user.uid} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {user.displayName}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {user.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                        {getRoleLabel(user.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {user.permissions.length} permissions
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {user.permissions.slice(0, 3).join(', ')}
                        {user.permissions.length > 3 && '...'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.disabled ? (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                          <UserX className="h-3 w-3 mr-1" />
                          Désactivé
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                          <UserCheck className="h-3 w-3 mr-1" />
                          Actif
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {hasPermission('users:write') && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setEditingUser(user)}
                            className="text-restaurant-600 hover:text-restaurant-900 dark:text-restaurant-400 dark:hover:text-restaurant-300"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Créer un nouvel utilisateur
            </h3>
            
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nom complet
                </label>
                <input
                  type="text"
                  required
                  value={formData.displayName}
                  onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-restaurant-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-restaurant-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Mot de passe
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-restaurant-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Rôle
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-restaurant-500 focus:border-transparent"
                >
                  <option value="server">Serveur</option>
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-restaurant-600 text-white rounded-lg hover:bg-restaurant-700 transition-colors"
                >
                  Créer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Modifier le rôle de {editingUser.displayName}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nouveau rôle
                </label>
                <select
                  id="newRole"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-restaurant-500 focus:border-transparent"
                >
                  <option value="server">Serveur</option>
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={() => {
                    const newRole = (document.getElementById('newRole') as HTMLSelectElement).value
                    handleUpdateRole(editingUser.uid, newRole)
                    setEditingUser(null)
                  }}
                  className="px-4 py-2 bg-restaurant-600 text-white rounded-lg hover:bg-restaurant-700 transition-colors"
                >
                  Mettre à jour
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 