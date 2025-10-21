import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Navigators
import TabNavigator from './TabNavigator';

// Standalone screens
import FridgeScreen from '../screens/FridgeScreen';
import RecipesScreen from '../screens/RecipesScreen';
import BarcodeScannerScreen from '../screens/BarcodeScannerScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import ShoppingListScreen from '../screens/ShoppingListScreen';
import StoreMapScreen from '../screens/StoreMapScreen';
import CommentsScreen from '../screens/CommentsScreen';
import SearchScreen from '../screens/SearchScreen';

const Stack = createNativeStackNavigator();

export default function MainNavigator() {
  return (
    <Stack.Navigator initialRouteName="Tabs" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={TabNavigator} />
      <Stack.Screen name="Fridge" component={FridgeScreen} />
      <Stack.Screen name="Recipes" component={RecipesScreen} />
      <Stack.Screen name="BarcodeScanner" component={BarcodeScannerScreen} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
      <Stack.Screen name="ShoppingList" component={ShoppingListScreen} />
      <Stack.Screen name="StoreMap" component={StoreMapScreen} />
      <Stack.Screen name="Comments" component={CommentsScreen} />
      <Stack.Screen name="Search" component={SearchScreen} />
    </Stack.Navigator>
  );
}
