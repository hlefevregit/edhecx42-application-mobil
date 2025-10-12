import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebaseConfig';
import CreateKnorrPostScreen from './screens/knorr/CreateKnorrPostScreen';
import KnorrProfileScreen from './screens/knorr/KnorrProfileScreen';
import KnorrChallengesScreen from './screens/knorr/KnorrChallengesScreen';

// Écrans existants
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import HomeScreen from './screens/HomeScreen';
import StatsScreen from './screens/StatsScreen';
import CommunityScreen from './screens/CommunityScreen';
import ProfileScreen from './screens/ProfileScreen';
import BarcodeScannerScreen from './screens/BarcodeScannerScreen';
import ProductDetailScreen from './screens/ProductDetailScreen';
import FridgeScreen from './screens/FridgeScreen';
import RecipesScreen from './screens/RecipesScreen';

// 🆕 NOUVEAUX ÉCRANS KNORR
import KnorrFeedScreen from './screens/knorr/KnorrFeedScreen';
import KnorrShopScreen from './screens/knorr/KnorrShopScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Accueil') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Statistiques') {
            iconName = focused ? 'stats-chart' : 'stats-chart-outline';
          } else if (route.name === 'Communauté') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'KnorrFeed') {
            // 🆕 ICÔNE KNORR
            iconName = focused ? 'restaurant' : 'restaurant-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#e63946', // Rouge Knorr
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Accueil" component={HomeScreen} />

      {/* 🆕 FEED KNORR - NOUVEAU TAB PRINCIPAL */}
      <Tab.Screen
        name="KnorrFeed"
        component={KnorrFeedScreen}
        options={{
          tabBarLabel: 'Knorr',
        }}
      />

      <Tab.Screen name="Statistiques" component={StatsScreen} />
      <Tab.Screen name="Communauté" component={CommunityScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <>
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen
              name="Profile"
              component={ProfileScreen}
              options={{ headerShown: true, title: 'Mon Profil' }}
            />
            <Stack.Screen name="BarcodeScanner" component={BarcodeScannerScreen} />
            <Stack.Screen
              name="ProductDetail"
              component={ProductDetailScreen}
              options={{ headerShown: true, title: 'Détails du produit' }}
            />
            <Stack.Screen name="Fridge" component={FridgeScreen} />
            <Stack.Screen
              name="Recipes"
              component={RecipesScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
                name="CreateKnorrPost" 
                component={CreateKnorrPostScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen 
                name="KnorrProfile" 
                component={KnorrProfileScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen 
                name="KnorrChallenges" 
                component={KnorrChallengesScreen}
                options={{ headerShown: false }}
              />
            {/* 🆕 ROUTES KNORR */}
            <Stack.Screen
              name="KnorrShop"
              component={KnorrShopScreen}
              options={{ headerShown: false }}
            />

          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
