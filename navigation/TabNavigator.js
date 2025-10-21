import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import HomeScreen from '../screens/HomeScreen';          // Widgets
import KnorrFeedScreen from '../screens/knorr/KnorrFeedScreen'; // ← Social Feed
import CreateKnorrPostScreen from '../screens/knorr/CreateKnorrPostScreen';
import KnorrProfileStack from './KnorrProfileStack';
import CustomTabBar from '../components/CustomTabBar';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tab.Screen name="Widgets" component={HomeScreen} options={{ title: 'Widgets' }} />
      <Tab.Screen name="Feed" component={KnorrFeedScreen} options={{ title: 'Social' }} />
      <Tab.Screen name="Create" component={CreateKnorrPostScreen} options={{ title: 'Create' }} />
      <Tab.Screen name="Profile" component={KnorrProfileStack} options={{ title: 'Account' }} />
    </Tab.Navigator>
  );
}
