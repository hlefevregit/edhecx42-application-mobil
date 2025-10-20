import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Écrans Knorr
import KnorrFeedScreen from '../screens/knorr/KnorrFeedScreen';
import KnorrShopScreen from '../screens/knorr/KnorrShopScreen';
import CreateKnorrPostScreen from '../screens/knorr/CreateKnorrPostScreen';
import KnorrProfileScreen from '../screens/knorr/KnorrProfileScreen';
import KnorrChallengesScreen from '../screens/knorr/KnorrChallengesScreen';
import KnorrPostDetailScreen from '../screens/knorr/KnorrPostDetailScreen';
import KnorrSettingsScreen from '../screens/knorr/KnorrSettingsScreen';
import EditKnorrProfileScreen from '../screens/knorr/EditKnorrProfileScreen';

const Stack = createNativeStackNavigator();

const KnorrNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="KnorrFeed" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="KnorrFeed" component={KnorrFeedScreen} />
      <Stack.Screen name="KnorrShop" component={KnorrShopScreen} />
      <Stack.Screen name="CreateKnorrPost" component={CreateKnorrPostScreen} />
      <Stack.Screen name="KnorrProfile" component={KnorrProfileScreen} />
      <Stack.Screen name="KnorrPostDetail" component={KnorrPostDetailScreen} />
      <Stack.Screen name="Settings" component={KnorrSettingsScreen} />
      <Stack.Screen name="EditProfile" component={EditKnorrProfileScreen} />
    </Stack.Navigator>
  );
};

export default KnorrNavigator;
