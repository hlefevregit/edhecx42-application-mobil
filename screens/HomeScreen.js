import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert
} from 'react-native';
import { DeviceMotion } from 'expo-sensors';
import { Camera } from 'expo-camera';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import { Ionicons } from '@expo/vector-icons';

const HomeScreen = ({ navigation }) => {
  const [shoppingList, setShoppingList] = useState([]);
  const [newItem, setNewItem] = useState('');
  const [isFlat, setIsFlat] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [hasPermission, setHasPermission] = useState(null);
  
  const userId = auth.currentUser?.uid;

  // Charger la liste de courses
  useEffect(() => {
    loadShoppingList();
  }, []);

  // Détecter l'orientation du téléphone
  useEffect(() => {
    let subscription;

    const checkOrientation = async () => {
      const isAvailable = await DeviceMotion.isAvailableAsync();
      if (!isAvailable) return;

      subscription = DeviceMotion.addListener(({ rotation }) => {
        // Détecter si le téléphone est à plat (perpendiculaire au sol)
        // rotation.beta proche de 0 = téléphone à plat
        const beta = rotation.beta;
        const isDeviceFlat = Math.abs(beta) < 0.3; // Seuil ajustable
        
        if (isDeviceFlat && !isFlat) {
          setIsFlat(true);
          activateScanner();
        } else if (!isDeviceFlat && isFlat) {
          setIsFlat(false);
          setShowScanner(false);
        }
      });

      DeviceMotion.setUpdateInterval(500); // Mise à jour toutes les 500ms
    };

    checkOrientation();

    return () => {
      subscription?.remove();
    };
  }, [isFlat]);

  const loadShoppingList = async () => {
    if (!userId) return;
    
    try {
      const docRef = doc(db, 'shopping_lists', userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setShoppingList(docSnap.data().items || []);
      }
    } catch (error) {
      console.error('Erreur chargement liste:', error);
    }
  };

  const saveShoppingList = async (updatedList) => {
    if (!userId) return;
    
    try {
      const docRef = doc(db, 'shopping_lists', userId);
      await updateDoc(docRef, {
        items: updatedList,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Erreur sauvegarde liste:', error);
    }
  };

  const addItem = () => {
    if (!newItem.trim()) return;
    
    const newList = [
      ...shoppingList,
      {
        id: Date.now().toString(),
        name: newItem,
        quantity: 1,
        checked: false,
        addedAt: new Date()
      }
    ];
    
    setShoppingList(newList);
    saveShoppingList(newList);
    setNewItem('');
  };

  const toggleItem = (id) => {
    const newList = shoppingList.map(item =>
      item.id === id ? { ...item, checked: !item.checked } : item
    );
    setShoppingList(newList);
    saveShoppingList(newList);
  };

  const deleteItem = (id) => {
    const newList = shoppingList.filter(item => item.id !== id);
    setShoppingList(newList);
    saveShoppingList(newList);
  };

  const activateScanner = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === 'granted');
    
    if (status === 'granted') {
      setShowScanner(true);
      Alert.alert(
        'Mode Scan Activé',
        'Votre téléphone est à plat. Le scanner est maintenant actif !',
        [
          {
            text: 'Scanner',
            onPress: () => navigation.navigate('BarcodeScanner')
          },
          {
            text: 'Annuler',
            style: 'cancel'
          }
        ]
      );
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.listItem}>
      <TouchableOpacity
        style={styles.checkbox}
        onPress={() => toggleItem(item.id)}
      >
        <Ionicons
          name={item.checked ? 'checkbox' : 'square-outline'}
          size={24}
          color={item.checked ? '#2ecc71' : '#999'}
        />
      </TouchableOpacity>
      
      <Text style={[
        styles.itemText,
        item.checked && styles.itemTextChecked
      ]}>
        {item.name}
      </Text>
      
      <TouchableOpacity onPress={() => deleteItem(item.id)}>
        <Ionicons name="trash-outline" size={22} color="#e74c3c" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header avec profil */}
      <View style={styles.header}>
        <Text style={styles.title}>Ma Liste de Courses</Text>
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => navigation.navigate('Profile')}
        >
          <Ionicons name="person-circle-outline" size={32} color="#2ecc71" />
        </TouchableOpacity>
      </View>

      {/* Indicateur d'orientation */}
      {isFlat && (
        <View style={styles.flatIndicator}>
          <Ionicons name="scan-outline" size={20} color="#fff" />
          <Text style={styles.flatIndicatorText}>
            Mode scan activé - Téléphone à plat détecté
          </Text>
        </View>
      )}

      {/* Ajouter un article */}
      <View style={styles.addSection}>
        <TextInput
          style={styles.input}
          placeholder="Ajouter un article..."
          value={newItem}
          onChangeText={setNewItem}
          onSubmitEditing={addItem}
        />
        <TouchableOpacity style={styles.addButton} onPress={addItem}>
          <Ionicons name="add-circle" size={32} color="#2ecc71" />
        </TouchableOpacity>
      </View>

      {/* Liste */}
      <FlatList
        data={shoppingList}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            Votre liste est vide. Ajoutez des articles !
          </Text>
        }
      />

      {/* Bouton scan manuel */}
      <TouchableOpacity
        style={styles.scanButton}
        onPress={() => navigation.navigate('BarcodeScanner')}
      >
        <Ionicons name="barcode-outline" size={24} color="#fff" />
        <Text style={styles.scanButtonText}>Scanner un produit</Text>
      </TouchableOpacity>
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  profileButton: {
    padding: 5,
  },
  flatIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2ecc71',
    padding: 12,
    justifyContent: 'center',
  },
  flatIndicatorText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: '600',
  },
  addSection: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginRight: 10,
  },
  addButton: {
    padding: 5,
  },
  list: {
    padding: 15,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
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
  checkbox: {
    marginRight: 12,
  },
  itemText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  itemTextChecked: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 16,
    marginTop: 40,
  },
  scanButton: {
    flexDirection: 'row',
    backgroundColor: '#3498db',
    margin: 15,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default HomeScreen;