import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { ActivityIndicator, View } from 'react-native';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AppNavigator from './navigation/AppNavigator';
import notificationService from './services/notificationService';

// ✅ hook pour charger les fonts Expo
import { useFonts } from 'expo-font';
import { Ionicons } from '@expo/vector-icons';

function AppContent() {
  const { user } = useAuth();

  React.useEffect(() => {
    if (user) notificationService.initialize(user.id);
    else notificationService.cleanup();
  }, [user]);

  return <AppNavigator />;
}

export default function App() {
  // ⬇️ charge la font Ionicons avant de rendre l'app
  const [fontsLoaded] = useFonts(Ionicons.font);

  if (!fontsLoaded) {
    // petit loader pendant le chargement de la font
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </NavigationContainer>
  );
}