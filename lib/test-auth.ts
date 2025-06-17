import { auth } from './firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

export async function testAuthMethods() {
  console.log('🧪 Test des méthodes d\'authentification...');
  
  try {
    // Test 1: Vérifier que Firebase est initialisé
    console.log('1️⃣ Vérification de l\'initialisation Firebase...');
    if (auth) {
      console.log('✅ Firebase Auth initialisé correctement');
    } else {
      console.log('❌ Firebase Auth non initialisé');
      return { success: false, error: 'Firebase Auth non initialisé' };
    }
    
    // Test 2: Authentification email/mot de passe (test avec un compte inexistant)
    console.log('2️⃣ Test authentification email/mot de passe...');
    try {
      const emailResult = await signInWithEmailAndPassword(auth, 'test@example.com', 'password123');
      console.log('✅ Authentification email réussie:', emailResult.user.email);
      await auth.signOut();
    } catch (emailError: any) {
      if (emailError.code === 'auth/user-not-found' || emailError.code === 'auth/invalid-credential') {
        console.log('ℹ️ Authentification email échouée (normal - compte inexistant):', emailError.code);
        console.log('✅ Le système d\'authentification fonctionne correctement');
      } else {
        console.log('❌ Erreur d\'authentification inattendue:', emailError.code);
        return { success: false, error: emailError.message };
      }
    }
    
    console.log('✅ Tests terminés avec succès');
    return { success: true };
    
  } catch (error: any) {
    console.error('❌ Test échoué:', error);
    console.error('Code d\'erreur:', error.code);
    console.error('Message:', error.message);
    return { success: false, error: error.message };
  }
}

// Fonction pour vérifier la configuration
export function checkAuthConfiguration() {
  console.log('🔍 Vérification de la configuration d\'authentification...');
  
  const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  };
  
  console.log('Configuration Firebase:', {
    apiKey: config.apiKey ? '✅ Présent' : '❌ Manquant',
    authDomain: config.authDomain ? '✅ Présent' : '❌ Manquant',
    projectId: config.projectId ? '✅ Présent' : '❌ Manquant',
  });
  
  return config;
}

// Fonction pour tester la création de compte
export async function testCreateAccount(email: string, password: string, displayName?: string) {
  console.log('🧪 Test de création de compte...');
  
  try {
    const { createUserWithEmailAndPassword, updateProfile } = await import('firebase/auth');
    
    console.log('1️⃣ Création du compte...');
    const result = await createUserWithEmailAndPassword(auth, email, password);
    console.log('✅ Compte créé avec succès:', result.user.email);
    
    if (displayName) {
      console.log('2️⃣ Mise à jour du profil...');
      await updateProfile(result.user, { displayName });
      console.log('✅ Profil mis à jour avec succès');
    }
    
    console.log('3️⃣ Déconnexion...');
    await auth.signOut();
    console.log('✅ Déconnexion réussie');
    
    return { success: true, user: result.user };
    
  } catch (error: any) {
    console.error('❌ Erreur de création de compte:', error);
    console.error('Code d\'erreur:', error.code);
    console.error('Message:', error.message);
    return { success: false, error: error.message };
  }
} 