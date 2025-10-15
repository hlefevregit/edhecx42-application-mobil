import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { signInWithCredential, GoogleAuthProvider } from 'firebase/auth';
import { auth, db } from '../firebaseConfig';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import GoogleAuthErrorHandler from './googleAuthErrorHandler';

/**
 * 🧪 VERSION DE DÉMONSTRATION DU SERVICE GOOGLE AUTH
 * 
 * Cette version simule le comportement de l'authentification Google
 * pour démontrer le flux sans avoir besoin de configurer Firebase.
 * 
 * ⚠️ À REMPLACER par le vrai service une fois Firebase configuré !
 */
class GoogleAuthServiceDemo {
  constructor() {
    console.log('🧪 DEMO MODE: GoogleAuthService en mode démonstration');
  }

  // Simulation de la configuration
  configure() {
    console.log('🧪 DEMO: Configuration Google Sign-In simulée');
    // En mode démo, pas de vraie configuration
  }

  // Simulation de la connexion Google
  async signInWithGoogle() {
    console.log('🧪 DEMO: Simulation connexion Google...');
    
    // Simuler un délai de connexion
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simuler un utilisateur Google
    const mockGoogleUser = {
      user: {
        id: 'demo_google_123',
        name: 'Utilisateur Demo',
        email: 'demo@gmail.com',
        photo: 'https://via.placeholder.com/100'
      },
      idToken: 'demo_id_token_123'
    };

    // Simuler un utilisateur Firebase
    const mockFirebaseUser = {
      uid: 'demo_firebase_uid',
      email: 'demo@gmail.com',
      displayName: 'Utilisateur Demo',
      photoURL: 'https://via.placeholder.com/100'
    };

    try {
      // Simuler la création du profil
      await this.createOrUpdateUserProfile(mockFirebaseUser, mockGoogleUser.user);
      
      console.log('🧪 DEMO: Connexion Google simulée avec succès');
      
      return {
        success: true,
        user: mockFirebaseUser,
        googleUser: mockGoogleUser.user,
        isDemo: true
      };
      
    } catch (error) {
      console.error('🧪 DEMO: Erreur simulation:', error);
      return {
        success: false,
        error: 'Erreur de simulation',
        isDemo: true
      };
    }
  }

  // Simulation de la déconnexion
  async signOutGoogle() {
    console.log('🧪 DEMO: Simulation déconnexion Google...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return { 
      success: true,
      isDemo: true 
    };
  }

  // Simulation du statut de connexion
  async isSignedIn() {
    return Math.random() > 0.5; // Random pour la démo
  }

  // Simulation de l'utilisateur courant
  async getCurrentUser() {
    return {
      user: {
        email: 'demo@gmail.com',
        name: 'Utilisateur Demo'
      },
      isDemo: true
    };
  }

  // Vraie méthode de création de profil (fonctionne même en démo)
  async createOrUpdateUserProfile(firebaseUser, googleUser) {
    try {
      console.log('🧪 DEMO: Création profil utilisateur...');
      
      // Cette partie fonctionne vraiment avec Firestore
      const userRef = doc(db, 'users', firebaseUser.uid);
      
      const userData = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName || googleUser.name,
        photoURL: firebaseUser.photoURL || googleUser.photo,
        provider: 'google-demo',
        lastLoginAt: new Date(),
        isGoogleUser: true,
        googleId: googleUser.id,
        isDemoUser: true
      };

      await setDoc(userRef, {
        ...userData,
        createdAt: new Date(),
        dietaryRestrictions: [],
        allergies: [],
        favoriteCategories: [],
        settings: {
          notifications: true,
          theme: 'light',
          language: 'fr'
        }
      });

      await this.createKnorrProfile(firebaseUser.uid);
      
      console.log('🧪 DEMO: Profil créé avec succès');
      
    } catch (error) {
      console.error('🧪 DEMO: Erreur création profil:', error);
      throw error;
    }
  }

  // Vraie méthode de création du profil Knorr
  async createKnorrProfile(userId) {
    try {
      console.log('🧪 DEMO: Création profil Knorr...');
      
      const knorrRef = doc(db, 'knorr_user_profiles', userId);
      
      await setDoc(knorrRef, {
        userId,
        knorrLevel: 1,
        knorrXP: 100, // Bonus démo
        rewardPoints: 50, // Bonus démo
        badges: ['demo_user'], // Badge spécial démo
        stats: {
          totalPosts: 0,
          totalViews: 0,
          totalLikes: 0,
          totalComments: 0,
          totalShares: 0,
          challengesCompleted: 0
        },
        followers: [],
        following: [],
        contentPreferences: {
          favoriteKnorrProducts: [],
          likedPosts: [],
          savedPosts: [],
          viewedPosts: []
        },
        createdAt: new Date(),
        lastActiveAt: new Date(),
        isDemoProfile: true
      });
      
      console.log('🧪 DEMO: Profil Knorr créé avec bonus démo !');
      
    } catch (error) {
      console.error('🧪 DEMO: Erreur création profil Knorr:', error);
    }
  }
}

export default new GoogleAuthServiceDemo();
