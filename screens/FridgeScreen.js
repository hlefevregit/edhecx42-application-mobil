import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { useFridgeData } from './fridge/hooks/useFridgeData';
import { useFridgeFilters } from './fridge/hooks/useFridgeFilters';
import FridgeFilters from './fridge/components/FridgeFilters';
import FridgeItem from './fridge/components/FridgeItem';
import TestModePanel from './fridge/components/TestModePanel';
import EditItemModal from './fridge/components/EditItemModal';
import DetectionModal from './fridge/components/DetectionModal';
import { getStatusCounts } from './fridge/utils/fridgeHelpers';

const KNORR_COLORS = {
  primary: '#006e3e',      // Vert Knorr
  primaryDark: '#00542b',
  accent: '#F2A900',       // Or/Jaune Knorr
  background: '#f8faf8',
  white: '#FFFFFF',
  text: '#1a1a1a',
  textLight: '#6b8270',
  cardBg: '#ffffff',
  shadow: '#006e3e20',
};

export default function FridgeScreen({ navigation, route }) {
  const { user } = useAuth();
  const userId = user?.id;

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

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [showDetectionModal, setShowDetectionModal] = useState(false);
  const [detectedItems, setDetectedItems] = useState([]);

  const addSample = () => {
    const sample = {
      id: Date.now().toString(),
      name: 'Tomato',
      quantity: 2,
      addedAt: new Date(),
      expiryDate: null,
      zone: 'fridge',
      category: 'vegetables',
    };
    addItems([sample]);
  };

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

  const handleBack = () => {
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.getParent()?.navigate('Tabs', { screen: 'Widgets' });
  };

  return (
    <View style={styles.container}>
      {/* Header avec gradient Knorr */}
      <LinearGradient
        colors={[KNORR_COLORS.primary, KNORR_COLORS.primaryDark]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={KNORR_COLORS.white} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerSubtitle}>SINCE 1838</Text>
          <Text style={styles.headerTitle}>My Fridge</Text>
        </View>

        <TouchableOpacity onPress={addSample} style={styles.addButton}>
          <Ionicons name="add-circle" size={28} color={KNORR_COLORS.accent} />
        </TouchableOpacity>
      </LinearGradient>

      {/* Stats rapides */}
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <View style={[styles.statDot, { backgroundColor: '#4CAF50' }]} />
          <Text style={styles.statText}>{counts.fresh} frais</Text>
        </View>
        <View style={styles.statItem}>
          <View style={[styles.statDot, { backgroundColor: '#FF9800' }]} />
          <Text style={styles.statText}>{counts.expiringSoon} à consommer</Text>
        </View>
        <View style={styles.statItem}>
          <View style={[styles.statDot, { backgroundColor: '#F44336' }]} />
          <Text style={styles.statText}>{counts.expired} périmés</Text>
        </View>
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
            <Ionicons name="leaf-outline" size={64} color={KNORR_COLORS.primary} />
            <Text style={styles.emptyText}>
              {selectedFilter === 'all' 
                ? '🧊 Votre frigo est vide'
                : `Aucun aliment "${selectedFilter}"`
              }
            </Text>
            <Text style={styles.emptySubtext}>
              Ajoutez vos premiers ingrédients Knorr !
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: KNORR_COLORS.background,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerSubtitle: {
    fontSize: 10,
    fontWeight: '600',
    color: KNORR_COLORS.accent,
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: KNORR_COLORS.white,
    fontStyle: 'italic',
  },
  addButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  statsBar: {
    flexDirection: 'row',
    backgroundColor: KNORR_COLORS.white,
    paddingVertical: 12,
    paddingHorizontal: 20,
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    borderBottomColor: '#E8EDE9',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statText: {
    fontSize: 12,
    color: KNORR_COLORS.textLight,
    fontWeight: '500',
  },
  list: {
    padding: 15,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: KNORR_COLORS.text,
    textAlign: 'center',
    marginTop: 20,
  },
  emptySubtext: {
    fontSize: 14,
    color: KNORR_COLORS.textLight,
    textAlign: 'center',
    marginTop: 8,
  },
});