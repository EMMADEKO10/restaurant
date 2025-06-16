import { useState, useEffect } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult
} from 'firebase/auth';
import { auth } from '../firebase';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    // Vérifier le résultat de la redirection Google
    getRedirectResult(auth).then((result) => {
      if (result) {
        console.log('Connexion Google réussie:', result.user.email);
      }
    }).catch((error) => {
      console.error('Erreur lors de la redirection Google:', error);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Tentative de connexion avec:', email);
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log('Connexion réussie:', result.user.email);
      return { success: true, user: result.user };
    } catch (error: any) {
      console.error('Erreur de connexion:', error);
      console.error('Code d\'erreur:', error.code);
      console.error('Message d\'erreur:', error.message);
      return { success: false, error: error.message };
    }
  };

  const signUp = async (email: string, password: string, displayName?: string) => {
    try {
      console.log('Tentative de création de compte avec:', email);
      console.log('Nom d\'affichage:', displayName);
      const result = await createUserWithEmailAndPassword(auth, email, password);
      console.log('Compte créé avec succès:', result.user.email);
      
      if (displayName) {
        console.log('Mise à jour du profil avec le nom:', displayName);
        await updateProfile(result.user, { displayName });
        console.log('Profil mis à jour avec succès');
      }
      
      return { success: true, user: result.user };
    } catch (error: any) {
      console.error('Erreur de création de compte:', error);
      console.error('Code d\'erreur:', error.code);
      console.error('Message d\'erreur:', error.message);
      console.error('Erreur complète:', error);
      return { success: false, error: error.message };
    }
  };

  const signInWithGoogle = async (useRedirect = false) => {
    try {
      console.log('Tentative de connexion Google...');
      const provider = new GoogleAuthProvider();
      
      // Ajouter des scopes supplémentaires si nécessaire
      provider.addScope('email');
      provider.addScope('profile');
      
      let result;
      if (useRedirect) {
        // Utilise la redirection (recommandé pour mobile)
        await signInWithRedirect(auth, provider);
        return { success: true, pending: true };
      } else {
        // Utilise la popup (recommandé pour desktop)
        result = await signInWithPopup(auth, provider);
        console.log('Connexion Google réussie:', result.user.email);
        return { success: true, user: result.user };
      }
    } catch (error: any) {
      console.error('Erreur de connexion Google:', error);
      console.error('Code d\'erreur:', error.code);
      console.error('Message d\'erreur:', error.message);
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  return {
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    logout,
    resetPassword,
  };
}
