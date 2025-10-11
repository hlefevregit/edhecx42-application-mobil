import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  Modal,
  ScrollView,
  ActionSheetIOS,
  Platform
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import visionService from '../services/visionService';

const FridgeScreen = ({ navigation }) => {
  const [fridgeItems, setFridgeItems] = useState([]);
  const [showPhotoMenu, setShowPhotoMenu] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [detectedItems, setDetectedItems] = useState([]);
  const [filter, setFilter] = useState('all');
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
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
        items: items,
        lastUpdated: new Date()
      });
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
    }
  };

  // MENU PHOTO CLAIR
  const openPhotoMenu = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Annuler', '📷 Prendre une photo', '🖼️ Galerie'],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            takePhotoWithCamera();
          } else if (buttonIndex === 2) {
            pickImageFromGallery();
          }
        }
      );
    } else {
      setShowPhotoMenu(true);
    }
  };

  const takePhotoWithCamera = async () => {
    setShowPhotoMenu(false);
    
    if (!cameraPermission?.granted) {
      const { granted } = await requestCameraPermission();
      if (!granted) {
        Alert.alert('Permission refusée', 'Accès caméra nécessaire');
        return;
      }
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      // CONFIRMATION avant analyse
      Alert.alert(
        '📸 Photo prise',
        'Analyser cette photo pour détecter les aliments ?',
        [
          { text: 'Annuler', style: 'cancel' },
          { text: '✅ Analyser', onPress: () => processImage(result.assets[0].uri) }
        ]
      );
    }
  };

  const pickImageFromGallery = async () => {
    setShowPhotoMenu(false);
    
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission refusée', 'Accès galerie nécessaire');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      processImage(result.assets[0].uri);
    }
  };

  const processImage = async (imageUri) => {
    Alert.alert('🤖 Analyse en cours...', 'Reconnaissance des aliments');
    
    try {
      const detected = await visionService.analyzeImage(imageUri);
      
      if (detected.length === 0) {
        Alert.alert(
          'Aucun aliment détecté',
          'Essayez une photo plus claire',
          [{ text: 'OK' }]
        );
        return;
      }

      setDetectedItems(detected.map((item, index) => ({
        ...item,
        id: Date.now() + index,
        confirmed: true,
        expiryDate: '',
        zone: 'Frigo principal'
      })));
      
      setShowConfirm(true);
      
      const isRealAI = visionService.isConfigured();
      Alert.alert(
        isRealAI ? '✨ Détection réussie !' : '🎭 Mode Démo',
        `${detected.length} aliments détectés${!isRealAI ? ' (simulation)' : ''}`
      );
    } catch (error) {
      console.error('Erreur:', error);
      Alert.alert('Erreur', 'Impossible d\'analyser l\'image');
    }
  };

  const toggleItemConfirmation = (id) => {
    setDetectedItems(detectedItems.map(item =>
      item.id === id ? { ...item, confirmed: !item.confirmed } : item
    ));
  };

  const updateDetectedQuantity = (id, quantity) => {
    setDetectedItems(detectedItems.map(item =>
      item.id === id ? { ...item, quantity: parseInt(quantity) || 1 } : item
    ));
  };

  const confirmDetection = () => {
    const newItems = detectedItems
      .filter(item => item.confirmed)
      .map(item => ({
        id: Date.now().toString() + Math.random(),
        name: item.name,
        quantity: item.quantity,
        addedAt: new Date(),
        expiryDate: null,
        zone: item.zone,
      }));

    const updatedItems = [...fridgeItems, ...newItems];
    setFridgeItems(updatedItems);
    saveFridgeItems(updatedItems);
    setShowConfirm(false);
    
    Alert.alert('Succès !', `${newItems.length} aliments ajoutés`);
  };

  // MODIFIER UN ALIMENT (DLC + Quantité)
  const openEditModal = (item) => {
    setEditingItem({
      ...item,
      expiryDateStr: item.expiryDate 
        ? new Date(item.expiryDate).toISOString().split('T')[0]
        : ''
    });
    setShowEditModal(true);
  };

  const saveEdit = () => {
    const updatedItems = fridgeItems.map(item => {
      if (item.id === editingItem.id) {
        return {
          ...item,
          quantity: editingItem.quantity,
          expiryDate: editingItem.expiryDateStr 
            ? new Date(editingItem.expiryDateStr)
            : null,
          zone: editingItem.zone
        };
      }
      return item;
    });

    setFridgeItems(updatedItems);
    saveFridgeItems(updatedItems);
    setShowEditModal(false);
    Alert.alert('✅ Modifié !');
  };

  // RÉDUIRE QUANTITÉ OU SUPPRIMER
  const decreaseQuantity = (id) => {
    const item = fridgeItems.find(i => i.id === id);
    if (item.quantity > 1) {
      const updatedItems = fridgeItems.map(i =>
        i.id === id ? { ...i, quantity: i.quantity - 1 } : i
      );
      setFridgeItems(updatedItems);
      saveFridgeItems(updatedItems);
    } else {
      deleteItem(id);
    }
  };

  const increaseQuantity = (id) => {
    const updatedItems = fridgeItems.map(i =>
      i.id === id ? { ...i, quantity: i.quantity + 1 } : i
    );
    setFridgeItems(updatedItems);
    saveFridgeItems(updatedItems);
  };

  const deleteItem = (id) => {
    Alert.alert(
      'Supprimer',
      'Retirer cet aliment du frigo ?',
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

  const isExpiringSoon = (expiryDate) => {
    if (!expiryDate) return false;
    const days = Math.floor((new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
    return days <= 3 && days >= 0;
  };

  const isExpired = (expiryDate) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  const getFilteredItems = () => {
    switch (filter) {
      case 'expiring':
        return fridgeItems.filter(item => isExpiringSoon(item.expiryDate));
      case 'expired':
        return fridgeItems.filter(item => isExpired(item.expiryDate));
      default:
        return fridgeItems;
    }
  };

  const getCategoryIcon = (name) => {
    const lower = name.toLowerCase();
    if (lower.includes('lait') || lower.includes('yaourt') || lower.includes('fromage')) return '🥛';
    if (lower.includes('viande') || lower.includes('poulet')) return '🍖';
    if (lower.includes('poisson')) return '🐟';
    if (lower.includes('fruit') || lower.includes('pomme') || lower.includes('banane')) return '🍎';
    if (lower.includes('légume') || lower.includes('carotte') || lower.includes('tomate')) return '🥕';
    if (lower.includes('oeuf') || lower.includes('œuf')) return '🥚';
    return '🍽️';
  };

  const getExpiryColor = (expiryDate) => {
    if (isExpired(expiryDate)) return '#e74c3c';
    if (isExpiringSoon(expiryDate)) return '#f39c12';
    return '#2ecc71';
  };

  const renderItem = ({ item }) => {
    const isExpiringSoonItem = isExpiringSoon(item.expiryDate);
    const isExpiredItem = isExpired(item.expiryDate);

    return (
      <View style={[
        styles.fridgeItem,
        isExpiredItem && styles.expiredItem,
        isExpiringSoonItem && styles.expiringItem
      ]}>
        <TouchableOpacity 
          style={styles.itemContent}
          onPress={() => openEditModal(item)}
        >
          <Text style={styles.itemIcon}>{getCategoryIcon(item.name)}</Text>
          <View style={styles.itemInfo}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemQuantity}>Quantité: {item.quantity}</Text>
            {item.expiryDate && (
              <Text style={[styles.itemExpiry, { color: getExpiryColor(item.expiryDate) }]}>
                {isExpiredItem ? '⚠️ Périmé' : 
                 isExpiringSoonItem ? '⚠️ Expire bientôt' :
                 `Expire le ${new Date(item.expiryDate).toLocaleDateString('fr-FR')}`}
              </Text>
            )}
          </View>
        </TouchableOpacity>
        
        <View style={styles.quantityControls}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => decreaseQuantity(item.id)}
          >
            <Ionicons name="remove" size={18} color="#fff" />
          </TouchableOpacity>
          
          <Text style={styles.quantity}>{item.quantity}</Text>
          
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => increaseQuantity(item.id)}
          >
            <Ionicons name="add" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const expiringCount = fridgeItems.filter(item => isExpiringSoon(item.expiryDate)).length;
  const expiredCount = fridgeItems.filter(item => isExpired(item.expiryDate)).length;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Mon Frigo Intelligent</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{fridgeItems.length}</Text>
          <Text style={styles.statLabel}>aliments</Text>
        </View>
        {expiringCount > 0 && (
          <View style={[styles.statCard, styles.warningCard]}>
            <Text style={styles.statNumber}>{expiringCount}</Text>
            <Text style={styles.statLabel}>⚠️ à consommer</Text>
          </View>
        )}
        {expiredCount > 0 && (
          <View style={[styles.statCard, styles.dangerCard]}>
            <Text style={styles.statNumber}>{expiredCount}</Text>
            <Text style={styles.statLabel}>❌ périmés</Text>
          </View>
        )}
      </View>

      {/* Filtres */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'all' && styles.filterActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
            Tous
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'expiring' && styles.filterActive]}
          onPress={() => setFilter('expiring')}
        >
          <Text style={[styles.filterText, filter === 'expiring' && styles.filterTextActive]}>
            À consommer
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'expired' && styles.filterActive]}
          onPress={() => setFilter('expired')}
        >
          <Text style={[styles.filterText, filter === 'expired' && styles.filterTextActive]}>
            Périmés
          </Text>
        </TouchableOpacity>
      </View>

      {/* BOUTON PHOTO CLAIR */}
      <TouchableOpacity
        style={styles.scanButton}
        onPress={openPhotoMenu}
      >
        <Ionicons name="camera" size={24} color="#fff" />
        <Text style={styles.scanButtonText}>📸 Scanner mon frigo</Text>
      </TouchableOpacity>

      {/* Liste */}
      <FlatList
        data={getFilteredItems()}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="snow-outline" size={80} color="#ddd" />
            <Text style={styles.emptyText}>
              {filter === 'all' ? 'Votre frigo est vide' :
               filter === 'expiring' ? 'Aucun aliment à consommer rapidement' :
               'Aucun aliment périmé'}
            </Text>
          </View>
        }
      />

      {/* Menu Photo (Android) */}
      <Modal
        visible={showPhotoMenu}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.menuOverlay}>
          <View style={styles.menuContent}>
            <TouchableOpacity
              style={styles.menuButton}
              onPress={takePhotoWithCamera}
            >
              <Ionicons name="camera" size={32} color="#3498db" />
              <Text style={styles.menuButtonText}>📷 Prendre une photo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuButton}
              onPress={pickImageFromGallery}
            >
              <Ionicons name="images" size={32} color="#9b59b6" />
              <Text style={styles.menuButtonText}>🖼️ Galerie</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuButton, styles.cancelButton]}
              onPress={() => setShowPhotoMenu(false)}
            >
              <Text style={styles.cancelButtonText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal Confirmation Détection */}
      <Modal
        visible={showConfirm}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              ✨ {detectedItems.length} aliments détectés
            </Text>

            <ScrollView style={styles.detectedList}>
              {detectedItems.map((item) => (
                <View key={item.id} style={styles.detectedItem}>
                  <TouchableOpacity
                    style={styles.checkbox}
                    onPress={() => toggleItemConfirmation(item.id)}
                  >
                    <Ionicons
                      name={item.confirmed ? 'checkbox' : 'square-outline'}
                      size={24}
                      color={item.confirmed ? '#2ecc71' : '#999'}
                    />
                  </TouchableOpacity>

                  <View style={styles.detectedInfo}>
                    <Text style={styles.detectedName}>
                      {getCategoryIcon(item.name)} {item.name}
                    </Text>
                    <Text style={styles.detectedConfidence}>
                      Confiance: {Math.round(item.confidence * 100)}%
                    </Text>
                  </View>

                  <TextInput
                    style={styles.quantityInput}
                    value={item.quantity.toString()}
                    onChangeText={(val) => updateDetectedQuantity(item.id, val)}
                    keyboardType="numeric"
                  />
                </View>
              ))}
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowConfirm(false)}
              >
                <Text style={styles.modalButtonText}>Annuler</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={confirmDetection}
              >
                <Text style={styles.modalButtonText}>
                  Ajouter ({detectedItems.filter(i => i.confirmed).length})
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Édition (DLC + Quantité) */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Modifier {editingItem?.name}</Text>

            <Text style={styles.label}>Quantité</Text>
            <TextInput
              style={styles.input}
              value={editingItem?.quantity.toString()}
              onChangeText={(val) => setEditingItem({
                ...editingItem,
                quantity: parseInt(val) || 1
              })}
              keyboardType="numeric"
            />

            <Text style={styles.label}>Date de péremption</Text>
            <TextInput
              style={styles.input}
              placeholder="AAAA-MM-JJ (ex: 2025-12-31)"
              value={editingItem?.expiryDateStr}
              onChangeText={(val) => setEditingItem({
                ...editingItem,
                expiryDateStr: val
              })}
            />

            <Text style={styles.label}>Zone du frigo</Text>
            <TextInput
              style={styles.input}
              value={editingItem?.zone}
              onChangeText={(val) => setEditingItem({
                ...editingItem,
                zone: val
              })}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowEditModal(false)}
              >
                <Text style={styles.modalButtonText}>Annuler</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={saveEdit}
              >
                <Text style={styles.modalButtonText}>Sauvegarder</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  statsRow: {
    flexDirection: 'row',
    padding: 15,
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  warningCard: {
    backgroundColor: '#fff3cd',
  },
  dangerCard: {
    backgroundColor: '#f8d7da',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    gap: 10,
    marginBottom: 15,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  filterActive: {
    backgroundColor: '#2ecc71',
    borderColor: '#2ecc71',
  },
  filterText: {
    fontSize: 14,
    color: '#666',
  },
  filterTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  scanButton: {
    flexDirection: 'row',
    backgroundColor: '#9b59b6',
    marginHorizontal: 15,
    marginBottom: 15,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  scanButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  list: {
    padding: 15,
  },
  fridgeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  expiringItem: {
    borderLeftWidth: 4,
    borderLeftColor: '#f39c12',
  },
  expiredItem: {
    borderLeftWidth: 4,
    borderLeftColor: '#e74c3c',
    opacity: 0.7,
  },
  itemContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemIcon: {
    fontSize: 36,
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  itemQuantity: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  itemExpiry: {
    fontSize: 13,
    marginTop: 4,
    fontWeight: '600',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  quantityButton: {
    backgroundColor: '#3498db',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantity: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    minWidth: 30,
    textAlign: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 20,
    textAlign: 'center',
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  menuContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    marginBottom: 15,
  },
  menuButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 15,
  },
  cancelButton: {
    backgroundColor: '#e0e0e0',
  },
  cancelButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  detectedList: {
    maxHeight: 400,
  },
  detectedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  checkbox: {
    marginRight: 12,
  },
  detectedInfo: {
    flex: 1,
  },
  detectedName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  detectedConfidence: {
    fontSize: 12,
    color: '#2ecc71',
    marginTop: 2,
  },
  quantityInput: {
    width: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 8,
    textAlign: 'center',
    fontSize: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmButton: {
    backgroundColor: '#2ecc71',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default FridgeScreen;