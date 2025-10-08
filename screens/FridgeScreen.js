import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  Image,
  Modal,
  ScrollView
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

const FridgeScreenV2 = ({ navigation }) => {
  const [fridgeItems, setFridgeItems] = useState([]);
  const [showCamera, setShowCamera] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [detectedItems, setDetectedItems] = useState([]);
  const [filter, setFilter] = useState('all'); // all, expiring, expired
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();

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

  // Reconnaissance IA avec Google Vision API (ou Clarifai Food Model)
  const analyzeImage = async (imageUri) => {
    try {
      // Simulation de reconnaissance IA
      // En production, utilisez Google Vision API ou Clarifai

      // Pour le MVP V2, on simule la détection
      const mockDetection = [
        { name: 'Yaourt', confidence: 0.95, quantity: 4 },
        { name: 'Lait', confidence: 0.89, quantity: 1 },
        { name: 'Fromage', confidence: 0.87, quantity: 2 },
        { name: 'Tomates', confidence: 0.92, quantity: 6 },
        { name: 'Carottes', confidence: 0.88, quantity: 8 }
      ];

      // TODO: Vraie implémentation avec Google Vision API
      /*
      const response = await axios.post(
        'https://vision.googleapis.com/v1/images:annotate',
        {
          requests: [{
            image: { content: base64Image },
            features: [{ type: 'LABEL_DETECTION', maxResults: 10 }]
          }]
        },
        { headers: { 'Authorization': `Bearer ${GOOGLE_API_KEY}` }}
      );
      */

      return mockDetection;
    } catch (error) {
      console.error('Erreur analyse image:', error);
      return [];
    }
  };

  const takePhotoWithCamera = async () => {
    if (!cameraPermission?.granted) {
      const { granted } = await requestCameraPermission();
      if (!granted) {
        Alert.alert('Permission refusée', 'Accès caméra nécessaire');
        return;
      }
    }
    setShowCamera(true);
  };

  const pickImageFromGallery = async () => {
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
    setShowCamera(false);
    Alert.alert('Analyse en cours...', 'Reconnaissance des aliments');

    const detected = await analyzeImage(imageUri);
    setDetectedItems(detected.map((item, index) => ({
      ...item,
      id: Date.now() + index,
      confirmed: true,
      expiryDate: null,
      zone: 'Frigo principal'
    })));

    setShowConfirm(true);
  };

  const confirmDetection = () => {
    const newItems = detectedItems
      .filter(item => item.confirmed)
      .map(item => ({
        id: item.id.toString(),
        name: item.name,
        quantity: item.quantity,
        addedAt: new Date(),
        expiryDate: item.expiryDate,
        zone: item.zone,
        imageUrl: null
      }));

    const updatedItems = [...fridgeItems, ...newItems];
    setFridgeItems(updatedItems);
    saveFridgeItems(updatedItems);
    setShowConfirm(false);

    Alert.alert(
      'Succès !',
      `${newItems.length} aliments ajoutés au frigo`
    );
  };

  const toggleItemConfirmation = (id) => {
    setDetectedItems(detectedItems.map(item =>
      item.id === id ? { ...item, confirmed: !item.confirmed } : item
    ));
  };

  const updateItemQuantity = (id, quantity) => {
    setDetectedItems(detectedItems.map(item =>
      item.id === id ? { ...item, quantity: parseInt(quantity) || 1 } : item
    ));
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
    const daysUntilExpiry = Math.floor(
      (new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24)
    );
    return daysUntilExpiry <= 3 && daysUntilExpiry >= 0;
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
    const lowerName = name.toLowerCase();
    if (lowerName.includes('lait') || lowerName.includes('yaourt') || lowerName.includes('fromage')) return '🥛';
    if (lowerName.includes('viande') || lowerName.includes('poulet')) return '🍖';
    if (lowerName.includes('poisson')) return '🐟';
    if (lowerName.includes('fruit') || lowerName.includes('pomme') || lowerName.includes('banane')) return '🍎';
    if (lowerName.includes('légume') || lowerName.includes('carotte') || lowerName.includes('tomate')) return '🥕';
    if (lowerName.includes('oeuf')) return '🥚';
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
        <View style={styles.itemContent}>
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
            {item.zone && (
              <Text style={styles.itemZone}>📍 {item.zone}</Text>
            )}
          </View>
        </View>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => deleteItem(item.id)}
        >
          <Ionicons name="trash-outline" size={20} color="#e74c3c" />
        </TouchableOpacity>
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

      {/* Stats rapides */}
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

      {/* Boutons scan */}
      <View style={styles.scanButtons}>
        <TouchableOpacity
          style={styles.scanButton}
          onPress={takePhotoWithCamera}
        >
          <Ionicons name="camera" size={24} color="#fff" />
          <Text style={styles.scanButtonText}>Prendre photo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.scanButton, styles.galleryButton]}
          onPress={pickImageFromGallery}
        >
          <Ionicons name="images" size={24} color="#fff" />
          <Text style={styles.scanButtonText}>Galerie</Text>
        </TouchableOpacity>
      </View>

      {/* Liste des aliments */}
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

      {/* Modal confirmation détection */}
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
            <Text style={styles.modalSubtitle}>
              Vérifiez et ajustez avant d'ajouter
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
                    onChangeText={(val) => updateItemQuantity(item.id, val)}
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
  scanButtons: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    gap: 10,
    marginBottom: 15,
  },
  scanButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#9b59b6',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  galleryButton: {
    backgroundColor: '#3498db',
  },
  scanButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  list: {
    padding: 15,
  },
  fridgeItem: {
    flexDirection: 'row',
    alignItems: 'center',
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
  itemZone: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  deleteButton: {
    padding: 8,
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 5,
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
  cancelButton: {
    backgroundColor: '#95a5a6',
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

export default FridgeScreenV2;
