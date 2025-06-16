"use client"

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useToast } from '@/components/ui/toast-provider';
import { useRouter, usePathname } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, User, Loader2 } from 'lucide-react';

type AuthMode = 'signin' | 'signup' | 'reset';

export function AuthForm() {
  const pathname = usePathname();
  const router = useRouter();
  
  // Détecter le mode selon l'URL
  const getInitialMode = (): AuthMode => {
    if (pathname.includes('/register')) return 'signup';
    if (pathname.includes('/login')) return 'signin';
    return 'signin';
  };

  const [mode, setMode] = useState<AuthMode>(getInitialMode());
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { signIn, signUp, resetPassword } = useAuth();
  const { toast } = useToast();

  // Mettre à jour le mode quand l'URL change
  useEffect(() => {
    setMode(getInitialMode());
  }, [pathname]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let result;

      switch (mode) {
        case 'signin':
          result = await signIn(email, password);
          if (result.success) {
            toast.success('Connexion réussie', 'Bienvenue !');
            router.push('/dashboard');
          } else {
            toast.error('Erreur de connexion', result.error);
          }
          break;

        case 'signup':
          result = await signUp(email, password, displayName);
          if (result.success) {
            toast.success('Compte créé avec succès', 'Vous pouvez maintenant vous connecter');
            router.push('/dashboard');
          } else {
            toast.error('Erreur lors de la création', result.error);
          }
          break;

        case 'reset':
          result = await resetPassword(email);
          if (result.success) {
            toast.success('Email envoyé', 'Vérifiez votre boîte mail pour réinitialiser votre mot de passe');
            setMode('signin');
          } else {
            toast.error('Erreur', result.error);
          }
          break;
      }
    } catch (error) {
      toast.error('Erreur inattendue', 'Veuillez réessayer');
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    switch (mode) {
      case 'signin': return 'Connexion';
      case 'signup': return 'Créer un compte';
      case 'reset': return 'Réinitialiser le mot de passe';
    }
  };

  const getSubmitText = () => {
    switch (mode) {
      case 'signin': return 'Se connecter';
      case 'signup': return 'Créer le compte';
      case 'reset': return 'Envoyer l\'email';
    }
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    if (newMode === 'signin') {
      router.push('/auth/login');
    } else if (newMode === 'signup') {
      router.push('/auth/register');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {getTitle()}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {mode === 'signin' && 'Connectez-vous à votre compte'}
            {mode === 'signup' && 'Créez votre compte restaurant'}
            {mode === 'reset' && 'Entrez votre email pour réinitialiser votre mot de passe'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {mode === 'signup' && (
            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nom complet
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-restaurant-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Votre nom complet"
                  autoComplete="name"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-restaurant-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="votre@email.com"
                autoComplete={mode === 'signin' ? 'email' : 'email'}
                required
              />
            </div>
          </div>

          {mode !== 'reset' && (
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-restaurant-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Votre mot de passe"
                  autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-restaurant-500 hover:bg-restaurant-600 disabled:bg-restaurant-300 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
            ) : null}
            {getSubmitText()}
          </button>
        </form>

        <div className="mt-6 text-center space-y-2">
          {mode === 'signin' && (
            <>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Pas encore de compte ?{' '}
                <button
                  onClick={() => switchMode('signup')}
                  className="text-restaurant-500 hover:text-restaurant-600 font-medium"
                >
                  Créer un compte
                </button>
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Mot de passe oublié ?{' '}
                <button
                  onClick={() => setMode('reset')}
                  className="text-restaurant-500 hover:text-restaurant-600 font-medium"
                >
                  Réinitialiser
                </button>
              </p>
            </>
          )}

          {mode === 'signup' && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Déjà un compte ?{' '}
              <button
                onClick={() => switchMode('signin')}
                className="text-restaurant-500 hover:text-restaurant-600 font-medium"
              >
                Se connecter
              </button>
            </p>
          )}

          {mode === 'reset' && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Retour à la{' '}
              <button
                onClick={() => switchMode('signin')}
                className="text-restaurant-500 hover:text-restaurant-600 font-medium"
              >
                connexion
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
