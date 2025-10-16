import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, ScrollView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getCategoryIcon } from '../utils/fridgeHelpers';

const DetectionModal = ({ visible, items, onClose, onConfirm, onChange }) => {
  const toggleItemConfirmation = (itemId) => {
    const updatedItems = items.map(item =>
      item.id === itemId ? { ...item, confirmed: !item.confirmed } : item
    );
    onChange(updatedItems);
  };

  const updateQuantity = (itemId, quantity) => {
    const updatedItems = items.map(item =>
      item.id === itemId ? { ...item, quantity: parseInt(quantity) || 1 } : item
    );
    onChange(updatedItems);
  };

  const confirmedCount = items.filter(item => item.confirmed).length;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>✨ {items.length} aliments détectés</Text>
              <Text style={styles.subtitle}>
                Avec suggestions intelligentes (zones, péremption)
              </Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={28} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.list}>
            {items.map((item) => (
              <View key={item.id} style={styles.item}>
                <TouchableOpacity
                  style={styles.checkbox}
                  onPress={() => toggleItemConfirmation(item.id)}
                >
                  <Ionicons
                    name={item.confirmed ? 'checkbox' : 'square-outline'}
                    size={28}
                    color={item.confirmed ? '#2ecc71' : '#999'}
                  />
                </TouchableOpacity>

                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>
                    {getCategoryIcon(item.name)} {item.name}
                  </Text>
                  <Text style={styles.itemCategory}>
                    📦 {item.category || 'Non catégorisé'}
                  </Text>
                  <Text style={styles.itemZone}>
                    📍 {item.zone}
                  </Text>
                  <Text style={styles.itemExpiry}>
                    📅 Expire le : {item.suggestedExpiryDate || 'Non défini'}
                  </Text>
                  <Text style={styles.itemConfidence}>
                    Confiance: {Math.round(item.confidence * 100)}%
                  </Text>
                </View>

                <View style={styles.quantityContainer}>
                  <Text style={styles.quantityLabel}>Qté</Text>
                  <TextInput
                    style={styles.quantityInput}
                    value={item.quantity?.toString() || '1'}
                    onChangeText={(val) => updateQuantity(item.id, val)}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            ))}
          </ScrollView>

          <View style={styles.buttons}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Annuler</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.confirmButton, confirmedCount === 0 && styles.confirmButtonDisabled]}
              onPress={onConfirm}
              disabled={confirmedCount === 0}
            >
              <Ionicons name="checkmark-circle" size={20} color="#fff" />
              <Text style={styles.confirmButtonText}>
                Ajouter ({confirmedCount})
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
  list: {
    marginBottom: 15,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  checkbox: {
    marginRight: 10,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  itemCategory: {
    fontSize: 12,
    color: '#3498db',
    marginTop: 3,
  },
  itemZone: {
    fontSize: 12,
    color: '#9b59b6',
    marginTop: 2,
  },
  itemExpiry: {
    fontSize: 12,
    color: '#e67e22',
    marginTop: 2,
  },
  itemConfidence: {
    fontSize: 11,
    color: '#95a5a6',
    marginTop: 2,
  },
  quantityContainer: {
    alignItems: 'center',
    marginLeft: 10,
  },
  quantityLabel: {
    fontSize: 11,
    color: '#666',
    marginBottom: 4,
  },
  quantityInput: {
    width: 50,
    height: 40,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttons: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  confirmButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#2ecc71',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  confirmButtonDisabled: {
    backgroundColor: '#95a5a6',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default DetectionModal;