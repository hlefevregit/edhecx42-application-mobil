import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AppNavigator from './navigation/AppNavigator';
import notificationService from './services/notificationService';

/**
 * 🍽️ FOOD APP - Point d'entrée principal
 * Navigation organisée avec Auth local (plus de Firebase)
 */

function AppContent() {
  const { user } = useAuth();

  useEffect(() => {
    // 🔔 Initialiser notifications si user connecté
    if (user) {
      notificationService.initialize(user.id);
    } else {
      notificationService.cleanup();
    }
  }, [user]);

  return <AppNavigator />;
}

export default function App() {
  console.log('=== App.js rendering ===');
  
  return (
    <NavigationContainer>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </NavigationContainer>
  );
}