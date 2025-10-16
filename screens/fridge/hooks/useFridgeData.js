import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';

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
      const docRef = doc(db, 'fridge_items', userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setFridgeItems(docSnap.data().items || []);
      }
    } catch (error) {
      console.error('Erreur chargement frigo:', error);
      Alert.alert('Erreur', 'Impossible de charger le frigo');
    } finally {
      setLoading(false);
    }
  };

  const saveFridgeItems = async (items) => {
    if (!userId) return;
    
    try {
      const docRef = doc(db, 'fridge_items', userId);
      const docSnap = await getDoc(docRef);
      
      const data = {
        items: items,
        lastUpdated: new Date(),
        userId: userId
      };
      
      if (docSnap.exists()) {
        await updateDoc(docRef, data);
      } else {
        await setDoc(docRef, data);
      }
      
      console.log('✅ Frigo sauvegardé');
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      Alert.alert('Erreur', 'Impossible de sauvegarder');
    }
  };

  const addItems = (newItems) => {
    const updatedItems = [...fridgeItems, ...newItems];
    setFridgeItems(updatedItems);
    saveFridgeItems(updatedItems);
  };

  const updateItem = (itemId, updates) => {
    const updatedItems = fridgeItems.map(item =>
      item.id === itemId ? { ...item, ...updates } : item
    );
    setFridgeItems(updatedItems);
    saveFridgeItems(updatedItems);
  };

  const deleteItem = (itemId) => {
    const updatedItems = fridgeItems.filter(item => item.id !== itemId);
    setFridgeItems(updatedItems);
    saveFridgeItems(updatedItems);
  };

  const increaseQuantity = (itemId) => {
    const item = fridgeItems.find(i => i.id === itemId);
    if (item) {
      updateItem(itemId, { quantity: item.quantity + 1 });
    }
  };

  const decreaseQuantity = (itemId) => {
    const item = fridgeItems.find(i => i.id === itemId);
    if (item) {
      if (item.quantity > 1) {
        updateItem(itemId, { quantity: item.quantity - 1 });
      } else {
        deleteItem(itemId);
      }
    }
  };

  return {
    fridgeItems,
    loading,
    loadFridgeItems,
    saveFridgeItems,
    addItems,
    updateItem,
    deleteItem,
    increaseQuantity,
    decreaseQuantity
  };
};