"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { useToast } from '@/components/ui/toast-provider';
import { User, LogOut, Settings, ChevronDown, Utensils, Users, Shield, ShieldAlert } from 'lucide-react';

export function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, role, logout } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      toast.success('Déconnexion réussie', 'À bientôt !');
    } else {
      toast.error('Erreur de déconnexion', result.error);
    }
    setIsOpen(false);
  };

  const handleNavigation = (path: string) => {
    router.push(path);
    setIsOpen(false);
  };

  // Vérifier si l'utilisateur est admin
  const isAdmin = role === 'admin' || role === 'super_admin';

  if (!user) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-white dark:bg-gray-800 rounded-lg px-3 py-2 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        <div className="w-8 h-8 bg-restaurant-500 rounded-full flex items-center justify-center">
          <User className="h-4 w-4 text-white" />
        </div>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {user.displayName || user.email}
        </span>
        <ChevronDown className="h-4 w-4 text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          <div className="py-1">
            <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
              <p className="font-medium">{user.displayName || 'Utilisateur'}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
              {role && (
                <div className="flex items-center mt-1 bg-gray-100 dark:bg-gray-700 rounded px-2 py-0.5 w-fit">
                  <Shield className="h-3 w-3 mr-1 text-restaurant-500" />
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    {role}
                  </span>
                </div>
              )}
            </div>
            
            {isAdmin && (
              <button
                onClick={() => handleNavigation('/admin-dashboard')}
                className="w-full flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <ShieldAlert className="h-4 w-4 mr-2" />
                Dashboard Admin
              </button>
            )}
            
            <button
              onClick={() => handleNavigation('/server-dashboard')}
              className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Users className="h-4 w-4 mr-2" />
              Dashboard Serveur
            </button>
            
            <button
              onClick={() => {
                // TODO: Naviguer vers les paramètres
                setIsOpen(false);
              }}
              className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Settings className="h-4 w-4 mr-2" />
              Paramètres
            </button>
            
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Se déconnecter
            </button>
          </div>
        </div>
      )}

      {/* Overlay pour fermer le menu */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
} 