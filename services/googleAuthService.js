import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { signInWithCredential, GoogleAuthProvider } from 'firebase/auth';
import { auth, db } from '../firebaseConfig';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import GoogleAuthErrorHandler from './googleAuthErrorHandler';

class GoogleAuthService {
  constructor() {
    this.configure();
  }

  // Configuration Google Sign-In
  configure() {
    try {
      GoogleSignin.configure({
        // WebClientId est OBLIGATOIRE - récupérer depuis Firebase Console > Authentication > Sign-in method > Google
        webClientId: '922969943051-qrkuqeou6jkvjge8jmmb8vd0i01vbolh.apps.googleusercontent.com',
        offlineAccess: true, // Pour obtenir le refresh token
        hostedDomain: '', // Domaine spécifique (optionnel)
        forceCodeForRefreshToken: true, // Force le refresh token
        accountName: '', // Nom du compte (optionnel)
        
        // iOS Client ID (optionnel, améliore les performances sur iOS)
        // iosClientId: 'VOTRE_IOS_CLIENT_ID.apps.googleusercontent.com',
      });
    } catch (error) {
      console.error('Erreur configuration Google Sign-In:', error);
    }
  }

  // Connexion avec Google
  async signInWithGoogle() {
    try {
      // 1. Vérifier si Google Play Services est disponible
      await GoogleSignin.hasPlayServices();
      
      // 2. Obtenir les informations utilisateur de Google
      const userInfo = await GoogleSignin.signIn();
      
      // 3. Créer les credentials Firebase
      const googleCredential = GoogleAuthProvider.credential(userInfo.idToken);
      
      // 4. Connexion à Firebase avec les credentials Google
      const firebaseUserCredential = await signInWithCredential(auth, googleCredential);
      const firebaseUser = firebaseUserCredential.user;
      
      // 5. Créer ou mettre à jour le profil utilisateur
      await this.createOrUpdateUserProfile(firebaseUser, userInfo.user);
      
      return {
        success: true,
        user: firebaseUser,
        googleUser: userInfo.user
      };
      
    } catch (error) {
      GoogleAuthErrorHandler.logError(error, 'signInWithGoogle');
      
      const errorMessage = GoogleAuthErrorHandler.getErrorMessage(error);
      const isRetryable = GoogleAuthErrorHandler.isRetryableError(error);
      const suggestion = GoogleAuthErrorHandler.getSuggestion(error);
      
      return {
        success: false,
        error: errorMessage,
        isRetryable,
        suggestion,
        originalError: error
      };
    }
  }

  // Déconnexion Google
  async signOutGoogle() {
    try {
      await GoogleSignin.signOut();
      await auth.signOut();
      return { success: true };
    } catch (error) {
      console.error('Erreur déconnexion Google:', error);
      return { success: false, error: 'Erreur de déconnexion' };
    }
  }

  // Créer ou mettre à jour le profil utilisateur
  async createOrUpdateUserProfile(firebaseUser, googleUser) {
    try {
      const userRef = doc(db, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userRef);
      
      const userData = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName || googleUser.name,
        photoURL: firebaseUser.photoURL || googleUser.photo,
        provider: 'google',
        lastLoginAt: new Date(),
        isGoogleUser: true,
        googleId: googleUser.id,
      };

      if (userDoc.exists()) {
        // Mettre à jour le profil existant
        await updateDoc(userRef, {
          ...userData,
          updatedAt: new Date()
        });
      } else {
        // Créer un nouveau profil
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

        // Créer aussi le profil Knorr par défaut
        await this.createKnorrProfile(firebaseUser.uid);
      }
      
    } catch (error) {
      console.error('Erreur création profil:', error);
      throw error;
    }
  }

  // Créer le profil Knorr pour les nouveaux utilisateurs Google
  async createKnorrProfile(userId) {
    try {
      const knorrRef = doc(db, 'knorr_user_profiles', userId);
      
      await setDoc(knorrRef, {
        userId,
        knorrLevel: 1,
        knorrXP: 0,
        rewardPoints: 0,
        badges: [],
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
        lastActiveAt: new Date()
      });
      
    } catch (error) {
      console.error('Erreur création profil Knorr:', error);
    }
  }

  // Vérifier si l'utilisateur est connecté
  async isSignedIn() {
    try {
      return await GoogleSignin.isSignedIn();
    } catch (error) {
      return false;
    }
  }

  // Obtenir les infos utilisateur Google actuel
  async getCurrentUser() {
    try {
      return await GoogleSignin.getCurrentUser();
    } catch (error) {
      return null;
    }
  }
}

export default new GoogleAuthService();
