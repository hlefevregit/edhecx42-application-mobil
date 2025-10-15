import { Platform } from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { 
  signInWithCredential, 
  GoogleAuthProvider, 
  signInWithPopup,
  getAuth
} from 'firebase/auth';
import { auth, db } from '../firebaseConfig';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import GoogleAuthErrorHandler from './googleAuthErrorHandler';

class GoogleAuthServiceCrossPlatform {
  constructor() {
    this.isWeb = Platform.OS === 'web';
    this.configure();
  }

  // Configuration adaptée à la plateforme
  configure() {
    try {
      if (!this.isWeb) {
        // Configuration pour React Native (mobile)
        GoogleSignin.configure({
          webClientId: '922969943051-qrkuqeou6jkvjge8jmmb8vd0i01vbolh.apps.googleusercontent.com',
          offlineAccess: true,
          hostedDomain: '',
          forceCodeForRefreshToken: true,
          accountName: '',
        });
      } else {
        // Pour le web, on utilisera signInWithPopup directement
        console.log('🌐 Mode Web: Utilisation de Firebase Auth Web native');
      }
    } catch (error) {
      console.error('Erreur configuration Google Sign-In:', error);
    }
  }

  // Connexion avec Google - Cross-platform
  async signInWithGoogle() {
    try {
      if (this.isWeb) {
        return await this.signInWithGoogleWeb();
      } else {
        return await this.signInWithGoogleMobile();
      }
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

  // Connexion Google pour le web (Firebase Auth Web)
  async signInWithGoogleWeb() {
    console.log('🌐 Connexion Google Web avec Firebase Auth...');
    
    // Créer le provider Google
    const provider = new GoogleAuthProvider();
    provider.addScope('email');
    provider.addScope('profile');
    
    // Connexion avec popup
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    
    const firebaseUser = result.user;
    const googleUser = {
      id: firebaseUser.uid,
      name: firebaseUser.displayName,
      email: firebaseUser.email,
      photo: firebaseUser.photoURL
    };
    
    // Créer ou mettre à jour le profil
    await this.createOrUpdateUserProfile(firebaseUser, googleUser);
    
    return {
      success: true,
      user: firebaseUser,
      googleUser: googleUser,
      platform: 'web'
    };
  }

  // Connexion Google pour mobile (React Native)
  async signInWithGoogleMobile() {
    console.log('📱 Connexion Google Mobile avec React Native...');
    
    // Vérifier Google Play Services
    await GoogleSignin.hasPlayServices();
    
    // Obtenir les infos utilisateur
    const userInfo = await GoogleSignin.signIn();
    
    // Créer les credentials Firebase
    const googleCredential = GoogleAuthProvider.credential(userInfo.idToken);
    
    // Connexion à Firebase
    const firebaseUserCredential = await signInWithCredential(auth, googleCredential);
    const firebaseUser = firebaseUserCredential.user;
    
    // Créer ou mettre à jour le profil
    await this.createOrUpdateUserProfile(firebaseUser, userInfo.user);
    
    return {
      success: true,
      user: firebaseUser,
      googleUser: userInfo.user,
      platform: 'mobile'
    };
  }

  // Déconnexion adaptée à la plateforme
  async signOutGoogle() {
    try {
      if (this.isWeb) {
        // Web : juste Firebase signOut
        await auth.signOut();
      } else {
        // Mobile : Google + Firebase signOut
        await GoogleSignin.signOut();
        await auth.signOut();
      }
      
      return { 
        success: true,
        platform: this.isWeb ? 'web' : 'mobile'
      };
    } catch (error) {
      console.error('Erreur déconnexion Google:', error);
      return { 
        success: false, 
        error: 'Erreur de déconnexion' 
      };
    }
  }

  // Vérifier si connecté (adaptée à la plateforme)
  async isSignedIn() {
    try {
      if (this.isWeb) {
        return auth.currentUser !== null;
      } else {
        return await GoogleSignin.isSignedIn();
      }
    } catch (error) {
      return false;
    }
  }

  // Obtenir utilisateur courant (adaptée à la plateforme)
  async getCurrentUser() {
    try {
      if (this.isWeb) {
        const user = auth.currentUser;
        return user ? {
          user: {
            email: user.email,
            name: user.displayName,
            photo: user.photoURL
          }
        } : null;
      } else {
        return await GoogleSignin.getCurrentUser();
      }
    } catch (error) {
      return null;
    }
  }

  // Créer ou mettre à jour le profil utilisateur (identique pour toutes les plateformes)
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
        platform: this.isWeb ? 'web' : 'mobile'
      };

      if (userDoc.exists()) {
        await updateDoc(userRef, {
          ...userData,
          updatedAt: new Date()
        });
      } else {
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
      }
      
    } catch (error) {
      console.error('Erreur création profil:', error);
      throw error;
    }
  }

  // Créer le profil Knorr (identique pour toutes les plateformes)
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
        lastActiveAt: new Date(),
        platform: this.isWeb ? 'web' : 'mobile'
      });
      
    } catch (error) {
      console.error('Erreur création profil Knorr:', error);
    }
  }
}

export default new GoogleAuthServiceCrossPlatform();
