import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  Image
} from 'react-native';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import { Ionicons } from '@expo/vector-icons';

const FridgeScreen = ({ navigation }) => {
  const [fridgeItems, setFridgeItems] = useState([]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState('1');
  const userId = auth.currentUser?.uid;

  useEffect(() => {
    loadFridgeItems();
  }, []);

  const loadFridgeItems = async () => {
    if (!userId) return;
    
    try {
      const docRef = doc(db, 'fridge_items', userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setFridgeItems(docSnap.data().items || []);
      }
    } catch (error) {
      console.error('Erreur chargement frigo:', error);
    }
  };

  const saveFridgeItems = async (items) => {
    if (!userId) return;
    
    try {
      const docRef = doc(db, 'fridge_items', userId);
      await updateDoc(docRef, {
        items: items
      });
    } catch (error) {
      console.error('Erreur sauvegarde frigo:', error);
    }
  };

  const addItem = () => {
    if (!newItemName.trim()) return;
    
    const newItem = {
      id: Date.now().toString(),
      name: newItemName,
      quantity: parseInt(newItemQuantity) || 1,
      addedAt: new Date(),
      imageUrl: null
    };
    
    const updatedItems = [...fridgeItems, newItem];
    setFridgeItems(updatedItems);
    saveFridgeItems(updatedItems);
    setNewItemName('');
    setNewItemQuantity('1');
  };

  const deleteItem = (id) => {
    Alert.alert(
      'Supprimer',
      'Voulez-vous retirer cet aliment du frigo ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            const updatedItems = fridgeItems.filter(item => item.id !== id);
            setFridgeItems(updatedItems);
            saveFridgeItems(updatedItems);
          }
        }
      ]
    );
  };

  const updateQuantity = (id, delta) => {
    const updatedItems = fridgeItems.map(item => {
      if (item.id === id) {
        const newQuantity = Math.max(0, item.quantity + delta);
        if (newQuantity === 0) {
          return null; // Sera filtré
        }
        return { ...item, quantity: newQuantity };
      }
      return item;
    }).filter(Boolean);
    
    setFridgeItems(updatedItems);
    saveFridgeItems(updatedItems);
  };

  const getCategoryIcon = (name) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('lait') || lowerName.includes('yaourt') || lowerName.includes('fromage')) {
      return '🥛';
    }
    if (lowerName.includes('viande') || lowerName.includes('poulet') || lowerName.includes('boeuf')) {
      return '🍖';
    }
    if (lowerName.includes('poisson')) {
      return '🐟';
    }
    if (lowerName.includes('fruit') || lowerName.includes('pomme') || lowerName.includes('banane')) {
      return '🍎';
    }
    if (lowerName.includes('légume') || lowerName.includes('carotte') || lowerName.includes('tomate')) {
      return '🥕';
    }
    if (lowerName.includes('oeuf')) {
      return '🥚';
    }
    return '🍽️';
  };

  const renderItem = ({ item }) => (
    <View style={styles.fridgeItem}>
      <View style={styles.itemContent}>
        <Text style={styles.itemIcon}>{getCategoryIcon(item.name)}</Text>
        <View style={styles.itemInfo}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemDate}>
            Ajouté le {new Date(item.addedAt).toLocaleDateString('fr-FR')}
          </Text>
        </View>
      </View>
      
      <View style={styles.quantityControls}>
        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => updateQuantity(item.id, -1)}
        >
          <Ionicons name="remove" size={20} color="#fff" />
        </TouchableOpacity>
        
        <Text style={styles.quantity}>{item.quantity}</Text>
        
        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => updateQuantity(item.id, 1)}
        >
          <Ionicons name="add" size={20} color="#fff" />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => deleteItem(item.id)}
        >
          <Ionicons name="trash-outline" size={20} color="#e74c3c" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Mon Frigo</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Illustration frigo */}
      <View style={styles.fridgeIllustration}>
        <Ionicons name="snow" size={60} color="#3498db" />
        <Text style={styles.fridgeTitle}>
          {fridgeItems.length} {fridgeItems.length <= 1 ? 'aliment' : 'aliments'}
        </Text>
      </View>

      {/* Bouton scan photo (V2 - pour le moment désactivé) */}
      <TouchableOpacity
        style={styles.scanPhotoButton}
        onPress={() => Alert.alert('Bientôt disponible', 'La reconnaissance photo sera disponible dans la version 2.0')}
      >
        <Ionicons name="camera-outline" size={24} color="#fff" />
        <Text style={styles.scanPhotoText}>
          Scanner mon frigo (V2)
        </Text>
      </TouchableOpacity>

      {/* Ajouter manuellement */}
      <View style={styles.addSection}>
        <Text style={styles.addTitle}>Ajouter manuellement</Text>
        <View style={styles.addForm}>
          <TextInput
            style={[styles.input, { flex: 2 }]}
            placeholder="Nom de l'aliment"
            value={newItemName}
            onChangeText={setNewItemName}
          />
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="Qté"
            value={newItemQuantity}
            onChangeText={setNewItemQuantity}
            keyboardType="numeric"
          />
          <TouchableOpacity style={styles.addButton} onPress={addItem}>
            <Ionicons name="add-circle" size={32} color="#2ecc71" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Liste des aliments */}
      <FlatList
        data={fridgeItems}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="snow-outline" size={80} color="#ddd" />
            <Text style={styles.emptyText}>
              Votre frigo est vide
            </Text>
            <Text style={styles.emptySubtext}>
              Ajoutez des aliments manuellement ou scannez un produit
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  fridgeIllustration: {
    backgroundColor: '#e8f4fd',
    padding: 30,
    alignItems: 'center',
    margin: 15,
    borderRadius: 12,
  },
  fridgeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3498db',
    marginTop: 10,
  },
  scanPhotoButton: {
    flexDirection: 'row',
    backgroundColor: '#9b59b6',
    margin: 15,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.6,
  },
  scanPhotoText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  addSection: {
    backgroundColor: '#fff',
    padding: 15,
    marginHorizontal: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  addTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  addForm: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
  },
  addButton: {
    padding: 5,
  },
  list: {
    padding: 15,
  },
  fridgeItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  itemIcon: {
    fontSize: 40,
    marginRight: 15,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  itemDate: {
    fontSize: 13,
    color: '#999',
    marginTop: 4,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  quantityButton: {
    backgroundColor: '#3498db',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  quantity: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    minWidth: 30,
    textAlign: 'center',
  },
  deleteButton: {
    padding: 8,
    marginLeft: 10,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#999',
    marginTop: 20,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#bbb',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});

export default FridgeScreen;