import { Platform } from 'react-native';

// Import conditionnel pour compatibilité Expo Go
let GoogleSignin;
try {
  GoogleSignin = require('@react-native-google-signin/google-signin').GoogleSignin;
} catch (error) {
  console.log('📱 Module Google Sign-In non disponible avec Expo Go');
}
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
      if (!this.isWeb && GoogleSignin) {
        // Configuration pour React Native (mobile)
        GoogleSignin.configure({
          webClientId: '922969943051-qrkuqeou6jkvjge8jmmb8vd0i01vbolh.apps.googleusercontent.com',
          offlineAccess: true,
          hostedDomain: '',
          forceCodeForRefreshToken: true,
          accountName: '',
        });
      } else if (!this.isWeb && !GoogleSignin) {
        console.log('📱 Mode démo Expo Go - Google Sign-In simulé');
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
    
    if (!GoogleSignin) {
      // Mode démo pour Expo Go
      return this.signInDemo();
    }
    
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

  // Mode démo pour Expo Go
  async signInDemo() {
    try {
      console.log('🎯 Mode démo Expo Go - Connexion simulée');
      // Simuler une connexion réussie
      await new Promise(resolve => setTimeout(resolve, 1500)); // Délai réaliste
      
      const demoUserId = 'demo_user_' + Date.now();
      
      // Créer un profil démo temporaire pour éviter les erreurs
      const demoProfile = {
        uid: demoUserId,
        email: 'demo@foodapp.com',
        displayName: 'Utilisateur Démo',
        photoURL: 'https://via.placeholder.com/150/4CAF50/FFFFFF/?text=Demo',
        provider: 'google',
        isDemo: true,
        isGoogleUser: true,
        platform: 'demo',
        createdAt: new Date(),
        lastLoginAt: new Date(),
        // Données par défaut pour éviter les erreurs dans ProfileScreen
        dietaryRestrictions: [],
        allergies: [],
        favoriteCategories: ['Démo', 'Test'],
        settings: {
          notifications: true,
          theme: 'light',
          language: 'fr'
        }
      };
      
      // Sauvegarder temporairement le profil démo
      try {
        await setDoc(doc(db, 'users', demoUserId), demoProfile);
        
        // Créer aussi un profil Knorr démo
        await setDoc(doc(db, 'knorr_user_profiles', demoUserId), {
          userId: demoUserId,
          knorrLevel: 1,
          knorrXP: 100,
          rewardPoints: 50,
          badges: ['Demo Badge'],
          stats: {
            totalPosts: 0,
            totalViews: 0,
            totalLikes: 0
          },
          createdAt: new Date()
        });
      } catch (firebaseError) {
        console.log('⚠️ Impossible de créer profil démo Firebase (normal en démo)');
      }
      
      const demoUser = {
        success: true,
        user: {
          uid: demoUserId,
          email: 'demo@foodapp.com',
          displayName: 'Utilisateur Démo',
          photoURL: 'https://via.placeholder.com/150/4CAF50/FFFFFF/?text=Demo'
        },
        googleUser: {
          id: 'demo_google_id',
          name: 'Utilisateur Démo',
          email: 'demo@foodapp.com',
          photo: 'https://via.placeholder.com/150/4CAF50/FFFFFF/?text=Demo'
        },
        platform: 'demo',
        isDemo: true
      };
      
      return demoUser;
      
    } catch (error) {
      return {
        success: false,
        error: 'Erreur dans le mode démo',
        isDemo: true
      };
    }
  }

  // Déconnexion adaptée à la plateforme
  async signOutGoogle() {
    try {
      console.log('🔄 Début déconnexion - Platform:', this.isWeb ? 'web' : 'mobile');
      console.log('👤 User avant déconnexion:', auth.currentUser?.email);
      
      if (this.isWeb) {
        // Web : Firebase signOut avec vérification et forçage
        console.log('🌐 Déconnexion Web via Firebase...');
        
        // Étape 1: SignOut Firebase
        await auth.signOut();
        console.log('✅ Firebase signOut appelé');
        
        // Étape 2: Attendre que l'état soit mis à jour
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Étape 3: Vérifier que la déconnexion a bien eu lieu
        let attempts = 0;
        const maxAttempts = 10;
        
        while (auth.currentUser && attempts < maxAttempts) {
          console.log(`⏳ Tentative ${attempts + 1}/${maxAttempts} - User encore connecté, attente...`);
          await new Promise(resolve => setTimeout(resolve, 200));
          attempts++;
        }
        
        const stillLoggedIn = auth.currentUser;
        if (stillLoggedIn) {
          console.log('⚠️ Utilisateur encore connecté après toutes les tentatives');
          // Ne pas échouer, car parfois l'AuthListener met du temps à se déclencher
          console.log('🔄 Continuer quand même, AuthListener gèrera la suite');
        } else {
          console.log('✅ Utilisateur bien déconnecté');
        }
        
        // Étape 4: Nettoyer le cache si possible (Web uniquement)
        if (typeof window !== 'undefined' && window.localStorage) {
          // Nettoyer les tokens Firebase du localStorage
          const keysToRemove = [];
          for (let i = 0; i < window.localStorage.length; i++) {
            const key = window.localStorage.key(i);
            if (key && key.startsWith('firebase:')) {
              keysToRemove.push(key);
            }
          }
          keysToRemove.forEach(key => {
            console.log(`🗑️ Suppression cache: ${key}`);
            window.localStorage.removeItem(key);
          });
        }
        
      } else if (GoogleSignin) {
        // Mobile : Google + Firebase signOut
        console.log('📱 Déconnexion Mobile...');
        await GoogleSignin.signOut();
        console.log('✅ Google SignOut réussi');
        await auth.signOut();
        console.log('✅ Firebase signOut réussi');
        
      } else {
        // Mode démo Expo Go
        console.log('👋 Déconnexion mode démo');
        await auth.signOut();
      }
      
      console.log('👤 User après déconnexion:', auth.currentUser?.email || 'null');
      console.log('✅ Déconnexion complète réussie');
      
      return { 
        success: true,
        platform: this.isWeb ? 'web' : 'mobile',
        message: 'Déconnexion réussie',
        finalUserState: auth.currentUser ? 'still-connected' : 'disconnected'
      };
    } catch (error) {
      console.error('❌ Erreur déconnexion Google:', error);
      console.error('❌ Stack trace:', error.stack);
      return { 
        success: false, 
        error: error.message || 'Erreur de déconnexion',
        originalError: error
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
