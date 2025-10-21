import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const COLORS = {
  primary: '#2d5f3e',
  background: '#F5F5F5',
  white: '#FFFFFF',
  text: '#1a1a1a',
  textLight: '#666',
};

export default function ShoppingListScreen({ navigation }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState('');

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    if (!user?.id) return;
    try {
      const stored = await AsyncStorage.getItem(`shoppingList_${user.id}`);
      if (stored) setItems(JSON.parse(stored));
    } catch (error) {
      console.error('Error loading items:', error);
    }
  };

  const saveItems = async (newItems) => {
    if (!user?.id) return;
    try {
      await AsyncStorage.setItem(`shoppingList_${user.id}`, JSON.stringify(newItems));
    } catch (error) {
      console.error('Error saving items:', error);
    }
  };

  const addItem = () => {
    if (!newItem.trim()) return;
    const newItems = [...items, { id: Date.now().toString(), text: newItem, checked: false }];
    setItems(newItems);
    saveItems(newItems);
    setNewItem('');
  };

  const toggleItem = (id) => {
    const newItems = items.map(item =>
      item.id === id ? { ...item, checked: !item.checked } : item
    );
    setItems(newItems);
    saveItems(newItems);
  };

  const deleteItem = (id) => {
    const newItems = items.filter(item => item.id !== id);
    setItems(newItems);
    saveItems(newItems);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>My Shopping List</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Add item..."
          value={newItem}
          onChangeText={setNewItem}
          onSubmitEditing={addItem}
        />
        <TouchableOpacity style={styles.addButton} onPress={addItem}>
          <Ionicons name="add" size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={items}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.itemRow}>
            <TouchableOpacity
              style={styles.checkbox}
              onPress={() => toggleItem(item.id)}
            >
              <Ionicons
                name={item.checked ? 'checkbox' : 'square-outline'}
                size={24}
                color={COLORS.primary}
              />
            </TouchableOpacity>
            <Text style={[styles.itemText, item.checked && styles.itemTextChecked]}>
              {item.text}
            </Text>
            <TouchableOpacity onPress={() => deleteItem(item.id)}>
              <Ionicons name="trash-outline" size={20} color="#e74c3c" />
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No items yet. Add your first item!</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    backgroundColor: COLORS.white,
  },
  title: { fontSize: 20, fontWeight: 'bold', color: COLORS.text },
  inputContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    width: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    marginHorizontal: 20,
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  checkbox: { marginRight: 8 },
  itemText: { flex: 1, fontSize: 16, color: COLORS.text },
  itemTextChecked: { textDecorationLine: 'line-through', color: COLORS.textLight },
  emptyText: { textAlign: 'center', color: COLORS.textLight, marginTop: 40 },
});