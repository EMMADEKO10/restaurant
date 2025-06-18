import { AuthForm } from '@/components/auth/AuthForm';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { Utensils, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function RegisterPage() {
  return (
    <AuthGuard requireAuth={false} redirectTo="/dashboard">
      <div className="min-h-screen bg-gradient-to-br from-restaurant-50 to-business-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Bouton retour */}
          <div className="mb-6">
            <Link 
              href="/"
              className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-restaurant-500 dark:hover:text-restaurant-400 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour à l'accueil
            </Link>
          </div>

          {/* Logo et titre */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-block">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-restaurant-500 rounded-full mb-4 hover:bg-restaurant-600 transition-colors cursor-pointer">
                <Utensils className="h-8 w-8 text-white" />
              </div>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Créer un compte
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Rejoignez notre plateforme de gestion restaurant
            </p>
          </div>

          {/* Formulaire d'authentification */}
          <AuthForm />

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              © 2024 Restaurant Manager. Tous droits réservés.
            </p>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
} 