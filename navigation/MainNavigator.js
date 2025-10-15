import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TabNavigator from './TabNavigator';
import KnorrNavigator from './KnorrNavigator';

// Écrans standalone
import ProfileScreen from '../screens/ProfileScreen';
import BarcodeScannerScreen from '../screens/BarcodeScannerScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import FridgeScreen from '../screens/FridgeScreen';
import RecipesScreen from '../screens/RecipesScreen';
import SearchScreen from '../screens/SearchScreen';
import CommentsScreen from '../screens/CommentsScreen';
import GoogleAuthTest from '../screens/GoogleAuthTestSimple';
import NavigationDemoScreen from '../screens/NavigationDemoScreen';
import WebLogoutDebugger from '../components/WebLogoutDebugger';

const Stack = createNativeStackNavigator();

const MainNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Navigation principale avec tabs */}
      <Stack.Screen name="Tabs" component={TabNavigator} />
      
      {/* Écrans modals et standalone */}
      <Stack.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ 
          headerShown: true, 
          title: 'Mon Profil',
          presentation: 'modal'
        }} 
      />
      
      <Stack.Screen 
        name="BarcodeScanner" 
        component={BarcodeScannerScreen}
        options={{
          title: 'Scanner',
          presentation: 'fullScreenModal'
        }}
      />
      
      <Stack.Screen 
        name="ProductDetail" 
        component={ProductDetailScreen} 
        options={{ 
          headerShown: true, 
          title: 'Produit',
          presentation: 'card'
        }} 
      />
      
      <Stack.Screen 
        name="Fridge" 
        component={FridgeScreen}
        options={{
          headerShown: true,
          title: 'Mon Frigo'
        }}
      />
      
      <Stack.Screen 
        name="Recipes" 
        component={RecipesScreen}
        options={{
          headerShown: true,
          title: 'Recettes'
        }}
      />
      
      <Stack.Screen 
        name="Search" 
        component={SearchScreen}
        options={{
          headerShown: true,
          title: 'Rechercher',
          presentation: 'modal'
        }}
      />
      
      <Stack.Screen 
        name="Comments" 
        component={CommentsScreen}
        options={{
          headerShown: true,
          title: 'Commentaires',
          presentation: 'card'
        }}
      />
      
      {/* Navigation Knorr (imbriquée) */}
      <Stack.Screen 
        name="KnorrStack" 
        component={KnorrNavigator}
        options={{
          presentation: 'card'
        }}
      />
      
      {/* 🧪 Test Google Auth */}
      <Stack.Screen 
        name="GoogleAuthTest" 
        component={GoogleAuthTest}
        options={{ 
          headerShown: true, 
          title: 'Test Google Auth',
          presentation: 'modal'
        }}
      />
      
      {/* 🧭 Démo Navigation */}
      <Stack.Screen 
        name="NavigationDemo" 
        component={NavigationDemoScreen}
        options={{ 
          headerShown: true, 
          title: '🗺️ Navigation Démo',
          presentation: 'modal'
        }}
      />

      {/* 🧪 Test Web Logout */}
      <Stack.Screen 
        name="WebLogoutDebugger" 
        component={WebLogoutDebugger}
        options={{
          headerShown: true, 
          title: '🧪 Debug Logout Web',
          presentation: 'modal'
        }}
      />

    </Stack.Navigator>
  );
};

export default MainNavigator;
