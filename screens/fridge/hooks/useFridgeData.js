import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import apiService from '../../../services/apiService';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useFridgeData = (userId) => {
  const [fridgeItems, setFridgeItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      loadFridgeItems();
    }
  }, [userId]);

  const loadFridgeItems = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      const items = await apiService.getFridgeItems(userId, token);
      setFridgeItems(items);
    } catch (error) {
      console.error('Erreur chargement frigo:', error);
      Alert.alert('Erreur', 'Impossible de charger le frigo');
    } finally {
      setLoading(false);
    }
  };

  const addItems = async (newItems) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      await apiService.addFridgeItems(userId, newItems, token);
      await loadFridgeItems();
    } catch (error) {
      console.error('Erreur ajout items:', error);
      Alert.alert('Erreur', 'Impossible d\'ajouter les items');
    }
  };

  const updateItem = async (itemId, updates) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      await apiService.updateFridgeItem(itemId, updates, token);
      await loadFridgeItems();
    } catch (error) {
      console.error('Erreur mise à jour:', error);
      Alert.alert('Erreur', 'Impossible de modifier l\'item');
    }
  };

  const deleteItem = async (itemId) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      await apiService.deleteFridgeItem(itemId, token);
      await loadFridgeItems();
    } catch (error) {
      console.error('Erreur suppression:', error);
      Alert.alert('Erreur', 'Impossible de supprimer l\'item');
    }
  };

  const increaseQuantity = async (itemId) => {
    const item = fridgeItems.find(i => i.id === itemId);
    if (item) {
      await updateItem(itemId, { quantity: item.quantity + 1 });
    }
  };

  const decreaseQuantity = async (itemId) => {
    const item = fridgeItems.find(i => i.id === itemId);
    if (item) {
      if (item.quantity > 1) {
        await updateItem(itemId, { quantity: item.quantity - 1 });
      } else {
        await deleteItem(itemId);
      }
    }
  };

  return {
    fridgeItems,
    loading,
    loadFridgeItems,
    addItems,
    updateItem,
    deleteItem,
    increaseQuantity,
    decreaseQuantity
  };
};