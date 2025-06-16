"use client"

import { useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useToast } from '@/components/ui/toast-provider';
import { useRouter } from 'next/navigation';
import { Chrome } from 'lucide-react';

interface GoogleSignInButtonProps {
  mode?: 'signin' | 'signup';
  className?: string;
}

export function GoogleSignInButton({ mode = 'signin', className = '' }: GoogleSignInButtonProps) {
  const [loading, setLoading] = useState(false);
  const { signInWithGoogle } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const handleGoogleSignIn = async () => {
    setLoading(true);
    
    try {
      const result = await signInWithGoogle(false); // Utilise popup pour desktop 
      if (result.success) {
        if (result.pending) {
          // Redirection en cours
          toast.info('Redirection vers Google...', 'Veuillez patienter');
        } else {
          // Connexion réussie
          toast.success(
            mode === 'signin' ? 'Connexion Google réussie' : 'Compte créé avec Google',
            `Bienvenue ${result.user?.displayName || result.user?.email}!`
          );
          router.push('/dashboard');
        }
      } else {
        toast.error('Erreur de connexion Google', result.error);
      }
    } catch (error) {
      toast.error('Erreur inattendue', 'Veuillez réessayer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleGoogleSignIn}
      disabled={loading}
      className={`
        w-full flex items-center justify-center gap-3 px-4 py-3 
        border border-gray-300 dark:border-gray-600 
        bg-white dark:bg-gray-800 
        text-gray-700 dark:text-gray-300 
        rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 
        transition-colors duration-200 
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
    >
      {loading ? (
        <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
      ) : (
        <Chrome className="h-5 w-5 text-blue-600" />
      )}
      <span className="font-medium">
        {loading 
          ? 'Connexion...' 
          : mode === 'signin' 
            ? 'Continuer avec Google' 
            : 'Créer un compte avec Google'
        }
      </span>
    </button>
  );
}
