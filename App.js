import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebaseConfig';
import AppNavigator from './navigation/AppNavigator';
import { navigationRef } from './navigation/navigationService';
import notificationService from './services/notificationService';

/**
 * 🍽️ FOOD APP - Point d'entrée principal
 * Navigation organisée et Google Auth intégré
 */

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      
      // 🔔 Initialiser notifications si user connecté
      if (currentUser) {
        notificationService.initialize(currentUser.uid);
      } else {
        notificationService.cleanup();
      }
    });

    return () => unsubscribe();
  }, []);

  // 🔄 Chargement
  if (loading) {
    return null; // Ou un écran de splash
  }

  // 🗺️ Navigation principale avec ref globale
  return <AppNavigator user={user} ref={navigationRef} />;
}