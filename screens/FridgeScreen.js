import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { getAuth } from 'firebase/auth';
import { useFridgeData } from './fridge/hooks/useFridgeData';
import { useFridgeFilters } from './fridge/hooks/useFridgeFilters';
import FridgeFilters from './fridge/components/FridgeFilters';
import FridgeItem from './fridge/components/FridgeItem';
import TestModePanel from './fridge/components/TestModePanel';
import EditItemModal from './fridge/components/EditItemModal';
import DetectionModal from './fridge/components/DetectionModal';
import { getStatusCounts } from './fridge/utils/fridgeHelpers';

const FridgeScreen = ({ navigation, route }) => {
  const authInstance = getAuth();
  const userId = authInstance.currentUser?.uid;

  // Hooks
  const {
    fridgeItems,
    loading,
    addItems,
    updateItem,
    deleteItem,
    increaseQuantity,
    decreaseQuantity
  } = useFridgeData(userId);

  const { filteredItems, selectedFilter, setSelectedFilter } = useFridgeFilters(fridgeItems);

  // États locaux
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [showDetectionModal, setShowDetectionModal] = useState(false);
  const [detectedItems, setDetectedItems] = useState([]);

  // Actions
  const handleEdit = (item) => {
    setEditingItem({
      ...item,
      expiryDateStr: item.expiryDate 
        ? new Date(item.expiryDate).toISOString().split('T')[0]
        : ''
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = () => {
    updateItem(editingItem.id, {
      quantity: editingItem.quantity,
      expiryDate: editingItem.expiryDateStr ? new Date(editingItem.expiryDateStr) : null,
      zone: editingItem.zone
    });
    setShowEditModal(false);
    Alert.alert('✅ Modifié !');
  };

  const handleConsume = (item) => {
    if (item.quantity > 1) {
      decreaseQuantity(item.id);
      Alert.alert('✅ Consommé', `Il reste ${item.quantity - 1} ${item.name}`);
    } else {
      Alert.alert(
        '✅ Consommé',
        `Voulez-vous retirer ${item.name} du frigo ?`,
        [
          { text: 'Non, garder', style: 'cancel' },
          { text: 'Oui, retirer', onPress: () => deleteItem(item.id) }
        ]
      );
    }
  };

  const handleExpired = (itemId) => {
    Alert.alert(
      '🗑️ Marquer comme périmé',
      'Voulez-vous supprimer cet aliment périmé du frigo ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            deleteItem(itemId);
            Alert.alert('✅ Supprimé', 'L\'aliment périmé a été retiré du frigo');
          }
        }
      ]
    );
  };

  const handleTestData = (mockItems) => {
    setDetectedItems(mockItems);
    setShowDetectionModal(true);
  };

  const handleConfirmDetection = () => {
    const newItems = detectedItems
      .filter(item => item.confirmed)
      .map(item => ({
        id: Date.now().toString() + Math.random(),
        name: item.name,
        quantity: item.quantity,
        addedAt: new Date(),
        expiryDate: item.suggestedExpiryDate ? new Date(item.suggestedExpiryDate) : null,
        zone: item.zone,
        category: item.category
      }));

    addItems(newItems);
    setShowDetectionModal(false);
    Alert.alert('Succès !', `${newItems.length} aliments ajoutés`);
  };

  const counts = getStatusCounts(fridgeItems);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🧊 Mon Frigo Intelligent</Text>
        <Text style={styles.subtitle}>{fridgeItems.length} articles</Text>
      </View>

      <FridgeFilters
        selectedFilter={selectedFilter}
        onFilterChange={setSelectedFilter}
        counts={counts}
      />


      <FlatList
        data={filteredItems}
        renderItem={({ item }) => (
          <FridgeItem
          item={item}
          onEdit={() => handleEdit(item)}
          onConsume={() => handleConsume(item)}
          onExpired={() => handleExpired(item.id)}
          onIncrease={() => increaseQuantity(item.id)}
          onDecrease={() => decreaseQuantity(item.id)}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {selectedFilter === 'all' 
                ? '🧊 Votre frigo est vide'
                : `Aucun aliment "${selectedFilter}"`
              }
            </Text>
          </View>
        }
      />

      <EditItemModal
        visible={showEditModal}
        item={editingItem}
        onClose={() => setShowEditModal(false)}
        onSave={handleSaveEdit}
        onChange={setEditingItem}
      />

      <DetectionModal
        visible={showDetectionModal}
        items={detectedItems}
        onClose={() => setShowDetectionModal(false)}
        onConfirm={handleConfirmDetection}
        onChange={setDetectedItems}
      />
      <TestModePanel onTestData={handleTestData} />
    </SafeAreaView>
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
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  list: {
    padding: 15,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
});

export default FridgeScreen;