import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  Animated,
  Platform
} from 'react-native';
import { DeviceMotion } from 'expo-sensors';
import { useCameraPermissions } from 'expo-camera';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import QuickAccessMenu from '../components/QuickAccessMenu';
import { useNavigation } from '../hooks/useNavigation';

const HomeScreen = () => {
  const navigation = useNavigation();
  const [shoppingList, setShoppingList] = useState([]);
  const [newItem, setNewItem] = useState('');
  const [isFlat, setIsFlat] = useState(false);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [pulseAnim] = useState(new Animated.Value(1));
  
  const userId = auth.currentUser?.uid;
  const userName = auth.currentUser?.displayName || 'Utilisateur';
  const isFocused = useIsFocused();

  useEffect(() => {
    loadShoppingList();
  }, []);

  // Animation pulse pour l'indicateur scan
  useEffect(() => {
    if (isFlat) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [isFlat]);

  // ✅ Détection d'orientation simplifiée (optionnelle)
  useEffect(() => {
    let subscription;

    const setupMotionDetection = () => {
      if (Platform.OS === 'web') {
        // Pas de détection de mouvement sur web
        return;
      }

      // Sur mobile, détecter si le téléphone est à plat
      subscription = DeviceMotion.addListener((data) => {
        const { rotation } = data;
        if (rotation) {
          const isPhoneFlat = Math.abs(rotation.beta) < 0.2;
          setIsFlat(isPhoneFlat);
        }
      });

      DeviceMotion.setUpdateInterval(1000);
    };

    if (isFocused) {
      setupMotionDetection();
    }

    return () => {
      if (subscription) {
        subscription.remove();
      }
      setIsFlat(false);
    };
  }, [isFocused]);

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

  const activateScannerAuto = async () => {
    if (!cameraPermission?.granted) {
      const { granted } = await requestCameraPermission();
      if (!granted) {
        Alert.alert('Permission refusée', 'Accès caméra nécessaire pour scanner');
        setIsFlat(false);
        return;
      }
    }

    navigation.goToBarcodeScanner();
    setIsFlat(false);
  };

  const getProgress = () => {
    if (shoppingList.length === 0) return 0;
    const checked = shoppingList.filter(item => item.checked).length;
    return (checked / shoppingList.length) * 100;
  };

  const renderItem = ({ item }) => (
    <Animated.View 
      style={[
        styles.listItem,
        item.checked && styles.listItemChecked
      ]}
    >
      <TouchableOpacity
        style={styles.checkbox}
        onPress={() => toggleItem(item.id)}
      >
        <View style={[
          styles.checkboxBox,
          item.checked && styles.checkboxBoxChecked
        ]}>
          {item.checked && (
            <Ionicons name="checkmark" size={18} color="#fff" />
          )}
        </View>
      </TouchableOpacity>
      
      <View style={styles.itemContent}>
        <Text style={[
          styles.itemText,
          item.checked && styles.itemTextChecked
        ]}>
          {item.name}
        </Text>
        <Text style={styles.itemQuantity}>Qté: {item.quantity}</Text>
      </View>
      
      <TouchableOpacity 
        style={styles.deleteButton}
        onPress={() => deleteItem(item.id)}
      >
        <Ionicons name="trash-outline" size={22} color="#e74c3c" />
      </TouchableOpacity>
    </Animated.View>
  );

  const progress = getProgress();

  return (
    <View style={styles.container}>
      {/* Header avec Gradient */}
      <LinearGradient
        colors={['#2ecc71', '#27ae60']}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Bonjour,</Text>
            <Text style={styles.userName}>{userName} 👋</Text>
          </View>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={navigation.goToProfile}
          >
            <Ionicons name="person-circle" size={40} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Stats rapides */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Ionicons name="cart" size={24} color="#fff" />
            <Text style={styles.statNumber}>{shoppingList.length}</Text>
            <Text style={styles.statLabel}>Articles</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="checkmark-circle" size={24} color="#fff" />
            <Text style={styles.statNumber}>
              {shoppingList.filter(i => i.checked).length}
            </Text>
            <Text style={styles.statLabel}>Cochés</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="trending-up" size={24} color="#fff" />
            <Text style={styles.statNumber}>{Math.round(progress)}%</Text>
            <Text style={styles.statLabel}>Progrès</Text>
          </View>
        </View>

        {/* Progress bar */}
        {shoppingList.length > 0 && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
          </View>
        )}
      </LinearGradient>

      {/* Indicateur scan auto */}
      {isFlat && (
        <Animated.View 
          style={[
            styles.scanningIndicator,
            { transform: [{ scale: pulseAnim }] }
          ]}
        >
          <Ionicons name="scan" size={24} color="#fff" />
          <Text style={styles.scanningText}>Scan activé...</Text>
        </Animated.View>
      )}

      {/* Aide scan */}
      {!isFlat && shoppingList.length === 0 && (
        <View style={styles.helpCard}>
          <Ionicons name="information-circle" size={32} color="#3498db" />
          <Text style={styles.helpText}>
            💡 Tenez le téléphone à plat pour scanner un produit automatiquement !
          </Text>
        </View>
      )}

      {/* Ajouter un article */}
      <View style={styles.addSection}>
        <View style={styles.inputContainer}>
          <Ionicons name="add-circle-outline" size={24} color="#2ecc71" />
          <TextInput
            style={styles.input}
            placeholder="Ajouter un article..."
            placeholderTextColor="#999"
            value={newItem}
            onChangeText={setNewItem}
            onSubmitEditing={addItem}
          />
        </View>
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={addItem}
          disabled={!newItem.trim()}
        >
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Liste */}
      <FlatList
        data={shoppingList}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="cart-outline" size={100} color="#ddd" />
            <Text style={styles.emptyText}>Votre liste est vide</Text>
            <Text style={styles.emptySubtext}>
              Ajoutez des articles ou scannez des produits
            </Text>
          </View>
        }
      />

      {/* Boutons action rapide */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.quickAction}
          onPress={navigation.goToBarcodeScanner}
        >
          <LinearGradient
            colors={['#3498db', '#2980b9']}
            style={styles.quickActionGradient}
          >
            <Ionicons name="barcode" size={24} color="#fff" />
            <Text style={styles.quickActionText}>Scanner</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickAction}
          onPress={navigation.goToFridge}
        >
          <LinearGradient
            colors={['#9b59b6', '#8e44ad']}
            style={styles.quickActionGradient}
          >
            <Ionicons name="snow" size={24} color="#fff" />
            <Text style={styles.quickActionText}>Mon Frigo</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
      
      {/* Menu d'accès rapide pour navigation */}
      <QuickAccessMenu />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 4,
  },
  profileButton: {
    padding: 5,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 15,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
  },
  progressContainer: {
    marginTop: 5,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fff',
  },
  scanningIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2ecc71',
    padding: 15,
    marginHorizontal: 20,
    marginTop: -15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  scanningText: {
    color: '#fff',
    marginLeft: 10,
    fontWeight: 'bold',
    fontSize: 16,
  },
  helpCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f4fd',
    margin: 20,
    padding: 15,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3498db',
  },
  helpText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: '#3498db',
    lineHeight: 20,
  },
  addSection: {
    flexDirection: 'row',
    padding: 20,
    paddingTop: 15,
    alignItems: 'center',
    gap: 10,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  input: {
    flex: 1,
    padding: 15,
    fontSize: 16,
    marginLeft: 10,
  },
  addButton: {
    backgroundColor: '#2ecc71',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 180,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  listItemChecked: {
    opacity: 0.6,
  },
  checkbox: {
    marginRight: 15,
  },
  checkboxBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#2ecc71',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxBoxChecked: {
    backgroundColor: '#2ecc71',
  },
  itemContent: {
    flex: 1,
  },
  itemText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  itemTextChecked: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  itemQuantity: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  deleteButton: {
    padding: 5,
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
  },
  quickActions: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    gap: 12,
  },
  quickAction: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  quickActionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  quickActionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default HomeScreen;