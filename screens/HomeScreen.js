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
import { useCameraPermissions } from 'expo-camera';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';

const HomeScreen = ({ navigation }) => {
  const [shoppingList, setShoppingList] = useState([]);
  const [newItem, setNewItem] = useState('');
  const [isFlat, setIsFlat] = useState(false);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  
  const userId = auth.currentUser?.uid;
  const isFocused = useIsFocused(); // Détecte si on est sur cet écran

  useEffect(() => {
    loadShoppingList();
  }, []);

  // Détecter orientation UNIQUEMENT si on est sur cet écran
  useEffect(() => {
    let subscription;

    const checkOrientation = async () => {
      if (!isFocused) return; // Ne marche QUE sur cette page

      const isAvailable = await DeviceMotion.isAvailableAsync();
      if (!isAvailable) return;

      subscription = DeviceMotion.addListener(({ rotation }) => {
        // Téléphone perpendiculaire au sol = beta proche de 1.57 (90°)
        const beta = Math.abs(rotation.beta);
        const isDeviceFlat = beta > 1.3 && beta < 1.8; // 75° à 105°
        
        if (isDeviceFlat && !isFlat && isFocused) {
          setIsFlat(true);
          activateScannerAuto();
        } else if (!isDeviceFlat && isFlat) {
          setIsFlat(false);
        }
      });

      DeviceMotion.setUpdateInterval(300);
    };

    if (isFocused) {
      checkOrientation();
    }

    return () => {
      if (subscription) {
        subscription.remove();
      }
      setIsFlat(false);
    };
  }, [isFocused, isFlat]);

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

  // Activation auto du scanner SANS confirmation
  const activateScannerAuto = async () => {
    if (!cameraPermission?.granted) {
      const { granted } = await requestCameraPermission();
      if (!granted) {
        Alert.alert('Permission refusée', 'Accès caméra nécessaire pour scanner');
        setIsFlat(false);
        return;
      }
    }

    // Ouvrir DIRECTEMENT le scanner
    navigation.navigate('BarcodeScanner');
    setIsFlat(false); // Reset pour éviter les réouvertures
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
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Ma Liste de Courses</Text>
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => navigation.navigate('Profile')}
        >
          <Ionicons name="person-circle-outline" size={32} color="#2ecc71" />
        </TouchableOpacity>
      </View>

      {/* Indicateur scan auto VISIBLE */}
      {isFlat && (
        <View style={styles.scanningIndicator}>
          <View style={styles.pulseCircle} />
          <Ionicons name="scan" size={24} color="#fff" />
          <Text style={styles.scanningText}>
            📱 Scan automatique activé...
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
          <View style={styles.emptyContainer}>
            <Ionicons name="cart-outline" size={80} color="#ddd" />
            <Text style={styles.emptyText}>
              Votre liste est vide
            </Text>
            <Text style={styles.emptySubtext}>
              🔄 Tenez le téléphone perpendiculaire pour scanner
            </Text>
          </View>
        }
      />

      {/* Bouton scan manuel */}
      <TouchableOpacity
        style={styles.scanButton}
        onPress={() => navigation.navigate('BarcodeScanner')}
      >
        <Ionicons name="barcode-outline" size={24} color="#fff" />
        <Text style={styles.scanButtonText}>Scanner manuellement</Text>
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
  scanningIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2ecc71',
    padding: 15,
    position: 'relative',
  },
  pulseCircle: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.3)',
    // Animation pulse (nécessite Animated API pour vraie animation)
  },
  scanningText: {
    color: '#fff',
    marginLeft: 10,
    fontWeight: 'bold',
    fontSize: 16,
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
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
    marginTop: 20,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#bbb',
    marginTop: 8,
    textAlign: 'center',
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