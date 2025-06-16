import { auth } from './firebase';
import { signInAnonymously } from 'firebase/auth';

export async function testFirebaseConnection() {
  try {
    console.log('🧪 Test de connexion Firebase...');
    
    // Test d'authentification anonyme (plus simple)
    const result = await signInAnonymously(auth);
    console.log('✅ Test réussi - Utilisateur anonyme créé:', result.user.uid);
    
    // Déconnexion immédiate
    await auth.signOut();
    console.log('✅ Test terminé avec succès');
    
    return { success: true };
  } catch (error: any) {
    console.error('❌ Test échoué:', error);
    console.error('Code d\'erreur:', error.code);
    console.error('Message:', error.message);
    return { success: false, error: error.message };
  }
} 