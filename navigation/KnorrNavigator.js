import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Écrans Knorr
import KnorrFeedScreen from '../screens/knorr/KnorrFeedScreen';
import KnorrShopScreen from '../screens/knorr/KnorrShopScreen';
import CreateKnorrPostScreen from '../screens/knorr/CreateKnorrPostScreen';
import KnorrProfileScreen from '../screens/knorr/KnorrProfileScreen';
import KnorrChallengesScreen from '../screens/knorr/KnorrChallengesScreen';
import KnorrPostDetailScreen from '../screens/knorr/KnorrPostDetailScreen';

const Stack = createNativeStackNavigator();

const KnorrNavigator = () => {
  return (
    <Stack.Navigator 
      initialRouteName="KnorrFeed"
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#e63946', // Rouge Knorr
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="KnorrFeed" 
        component={KnorrFeedScreen}
        options={{
          title: '🍽️ Knorr Social',
          headerShown: false, // Le feed gère son propre header
        }}
      />
      
      <Stack.Screen 
        name="KnorrShop" 
        component={KnorrShopScreen}
        options={{
          title: '🛒 Boutique Knorr',
        }}
      />
      
      <Stack.Screen 
        name="CreateKnorrPost" 
        component={CreateKnorrPostScreen}
        options={{
          title: '✏️ Nouveau Post',
          presentation: 'modal',
        }}
      />
      
      <Stack.Screen 
        name="KnorrProfile" 
        component={KnorrProfileScreen}
        options={{
          title: '👤 Profil Knorr',
        }}
      />
      
      <Stack.Screen 
        name="KnorrPostDetail" 
        component={KnorrPostDetailScreen}
        options={{
          title: '📄 Détail du Post',
          headerShown: false, // Le screen gère son propre header
        }}
      />
      
      <Stack.Screen 
        name="KnorrChallenges" 
        component={KnorrChallengesScreen}
        options={{
          title: '🏆 Défis Knorr',
        }}
      />
    </Stack.Navigator>
  );
};

export default KnorrNavigator;
