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
  getRedirectResult,
  getAuth
} from 'firebase/auth';
import { auth } from '../firebase';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';

// Types pour les rôles
type UserRoleType = 'admin' | 'super_admin' | 'server' | 'client';

// Fonction pour obtenir les permissions selon le rôle
const getPermissionsForRole = (role: UserRoleType): string[] => {
  switch (role) {
    case 'super_admin':
      return [
        'users:read', 'users:write', 'users:delete',
        'dishes:read', 'dishes:write', 'dishes:delete',
        'orders:read', 'orders:write', 'orders:delete',
        'analytics:read', 'settings:write'
      ];
    case 'admin':
      return [
        'users:read', 'users:write',
        'dishes:read', 'dishes:write', 'dishes:delete',
        'orders:read', 'orders:write', 'orders:delete',
        'analytics:read'
      ];
    case 'server':
      return [
        'orders:read', 'orders:write',
        'dishes:read'
      ];
    case 'client':
      return [
        'dishes:read'
      ];
    default:
      return [];
  }
};

// Fonction pour traduire les erreurs Firebase
const getErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/invalid-credential':
      return 'Email ou mot de passe incorrect';
    case 'auth/user-not-found':
      return 'Aucun compte trouvé avec cet email';
    case 'auth/wrong-password':
      return 'Mot de passe incorrect';
    case 'auth/email-already-in-use':
      return 'Un compte existe déjà avec cet email';
    case 'auth/weak-password':
      return 'Le mot de passe doit contenir au moins 6 caractères';
    case 'auth/invalid-email':
      return 'Adresse email invalide';
    case 'auth/too-many-requests':
      return 'Trop de tentatives. Réessayez plus tard';
    case 'auth/network-request-failed':
      return 'Erreur de connexion réseau';
    case 'auth/configuration-not-found':
      return 'Configuration Firebase non trouvée';
    default:
      return 'Une erreur inattendue s\'est produite';
  }
};

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const db = getFirestore();
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            // Vérifier si role est un objet avec une propriété role ou directement une chaîne
            if (userData.role && typeof userData.role === 'object' && userData.role.role) {
              setRole(userData.role.role);
            } else if (typeof userData.role === 'string') {
              setRole(userData.role);
            } else {
              setRole('client'); // Valeur par défaut si le format est incorrect
            }
          } else {
            // Si le document n'existe pas, le créer avec un rôle par défaut
            console.log("Création d'un document utilisateur par défaut");
            await setDoc(doc(db, "users", firebaseUser.uid), {
              email: firebaseUser.email,
              displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || '',
              role: {
                role: 'client',
                permissions: getPermissionsForRole('client')
              },
              createdAt: new Date(),
              updatedAt: new Date()
            });
            setRole('client');
          }
        } catch (error) {
          console.error("Erreur lors de la récupération du rôle:", error);
          setRole(null);
        }
      } else {
        setRole(null);
      }
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

    return () => unsubscribe();
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
      const errorMessage = getErrorMessage(error.code);
      return { success: false, error: errorMessage };
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
      
      // Créer un document utilisateur dans Firestore avec le rôle par défaut
      const db = getFirestore();
      await setDoc(doc(db, 'users', result.user.uid), {
        email: result.user.email,
        displayName: displayName || result.user.email?.split('@')[0] || '',
        role: {
          role: 'client',
          permissions: getPermissionsForRole('client')
        },
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log('Document utilisateur créé avec succès dans Firestore');
      
      return { success: true, user: result.user };
    } catch (error: any) {
      console.error('Erreur de création de compte:', error);
      console.error('Code d\'erreur:', error.code);
      console.error('Message d\'erreur:', error.message);
      console.error('Erreur complète:', error);
      const errorMessage = getErrorMessage(error.code);
      return { success: false, error: errorMessage };
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
        
        // Vérifier si un document utilisateur existe déjà
        const db = getFirestore();
        const userDoc = await getDoc(doc(db, "users", result.user.uid));
        
        if (!userDoc.exists()) {
          // Créer un document utilisateur pour l'authentification Google
          await setDoc(doc(db, 'users', result.user.uid), {
            email: result.user.email,
            displayName: result.user.displayName || result.user.email?.split('@')[0] || '',
            role: {
              role: 'client',
              permissions: getPermissionsForRole('client')
            },
            createdAt: new Date(),
            updatedAt: new Date(),
            authProvider: 'google'
          });
          console.log('Document utilisateur Google créé avec succès dans Firestore');
        }
        
        return { success: true, user: result.user };
      }
    } catch (error: any) {
      console.error('Erreur de connexion Google:', error);
      console.error('Code d\'erreur:', error.code);
      console.error('Message d\'erreur:', error.message);
      const errorMessage = getErrorMessage(error.code);
      return { success: false, error: errorMessage };
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
      const errorMessage = getErrorMessage(error.code);
      return { success: false, error: errorMessage };
    }
  };

  return {
    user,
    role,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    logout,
    resetPassword,
  };
}
