"use client"

import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
  requiredRoles?: string[];
}

export function AuthGuard({ 
  children, 
  requireAuth = true, 
  redirectTo = '/auth',
  requiredRoles = [] 
}: AuthGuardProps) {
  const { user, loading, role } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      // Si l'authentification est requise mais l'utilisateur n'est pas connecté
      if (requireAuth && !user) {
        router.push(redirectTo);
        return;
      }
      
      // Si l'utilisateur est connecté
      if (user) {
        // Si cette page ne nécessite pas d'authentification (comme la page de login)
        if (!requireAuth) {
          // Rediriger en fonction du rôle
          if (role === 'admin' || role === 'super_admin') {
            router.push('/admin-dashboard');
          } else if (role === 'server') {
            router.push('/server-dashboard');
          } else {
            // Utilisateur normal (client)
            router.push('/');
          }
          return;
        }
        
        // Si des rôles spécifiques sont requis et que l'utilisateur n'a pas le bon rôle
        if (requiredRoles.length > 0 && role && !requiredRoles.includes(role)) {
          // Rediriger en fonction du rôle
          if (role === 'admin' || role === 'super_admin') {
            router.push('/admin-dashboard');
          } else if (role === 'server') {
            router.push('/server-dashboard');
          } else {
            // Utilisateur normal (client)
            router.push('/');
          }
          return;
        }
      }
    }
  }, [user, loading, requireAuth, redirectTo, router, role, requiredRoles]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-restaurant-500" />
          <p className="text-gray-600 dark:text-gray-400">Chargement...</p>
        </div>
      </div>
    );
  }

  // Si on demande une authentification et qu'il n'y a pas d'utilisateur
  if (requireAuth && !user) {
    return null; // Le useEffect va rediriger
  }

  // Si on ne demande pas d'authentification et qu'il y a un utilisateur
  if (!requireAuth && user) {
    return null; // Le useEffect va rediriger
  }

  // Si des rôles spécifiques sont requis et que l'utilisateur n'a pas le bon rôle
  if (requiredRoles.length > 0 && role && !requiredRoles.includes(role)) {
    return null; // Le useEffect va rediriger
  }

  return <>{children}</>;
} 