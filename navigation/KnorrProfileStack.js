import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import KnorrProfileScreen from '../screens/knorr/KnorrProfileScreen';
import CreateKnorrPostScreen from '../screens/knorr/CreateKnorrPostScreen';
import KnorrPostDetailScreen from '../screens/knorr/KnorrPostDetailScreen';
import KnorrShopScreen from '../screens/knorr/KnorrShopScreen';

// Placeholders (si tu n’as pas encore ces écrans)
import KnorrEditProfileScreen from '../screens/knorr/EditKnorrProfileScreen';
import KnorrSettingsScreen from '../screens/knorr/KnorrSettingsScreen';

const Stack = createNativeStackNavigator();

export default function KnorrProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="KnorrProfile" component={KnorrProfileScreen} />
      <Stack.Screen name="CreateKnorrPost" component={CreateKnorrPostScreen} />
      <Stack.Screen name="KnorrPostDetail" component={KnorrPostDetailScreen} />
      <Stack.Screen name="KnorrShop" component={KnorrShopScreen} />
      <Stack.Screen name="KnorrEditProfile" component={KnorrEditProfileScreen} />
      <Stack.Screen name="KnorrSettings" component={KnorrSettingsScreen} />
    </Stack.Navigator>
  );
}