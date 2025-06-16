import { AuthForm } from '@/components/auth/AuthForm';
import { Utensils } from 'lucide-react';

export default function AuthPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-restaurant-50 to-business-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo et titre */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-restaurant-500 rounded-full mb-4">
            <Utensils className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Restaurant Manager
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gérez votre restaurant en toute simplicité
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
  );
} 