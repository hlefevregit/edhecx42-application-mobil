import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const EditItemModal = ({ visible, item, onClose, onSave, onChange }) => {
  if (!item) return null;

  const zones = [
    'Frigo principal',
    'Étagère haute',
    'Étagère basse (zone froide)',
    'Bac à légumes',
    'Porte du frigo',
    'Congélateur',
  ];

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
            <Text style={styles.title}>✏️ Modifier {item.name}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={28} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.form}>
            {/* Quantité */}
            <View style={styles.field}>
              <Text style={styles.label}>Quantité</Text>
              <View style={styles.quantityControl}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => onChange({ ...item, quantity: Math.max(1, item.quantity - 1) })}
                >
                  <Ionicons name="remove" size={24} color="#fff" />
                </TouchableOpacity>
                
                <TextInput
                  style={styles.quantityInput}
                  value={item.quantity.toString()}
                  onChangeText={(val) => onChange({ ...item, quantity: parseInt(val) || 1 })}
                  keyboardType="numeric"
                />
                
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => onChange({ ...item, quantity: item.quantity + 1 })}
                >
                  <Ionicons name="add" size={24} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Date d'expiration */}
            <View style={styles.field}>
              <Text style={styles.label}>Date d'expiration</Text>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                value={item.expiryDateStr}
                onChangeText={(val) => onChange({ ...item, expiryDateStr: val })}
              />
              <Text style={styles.hint}>Format: AAAA-MM-JJ (ex: 2024-12-31)</Text>
            </View>

            {/* Zone de stockage */}
            <View style={styles.field}>
              <Text style={styles.label}>Zone de stockage</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {zones.map((zone) => (
                  <TouchableOpacity
                    key={zone}
                    style={[
                      styles.zoneButton,
                      item.zone === zone && styles.zoneButtonActive
                    ]}
                    onPress={() => onChange({ ...item, zone })}
                  >
                    <Text style={[
                      styles.zoneButtonText,
                      item.zone === zone && styles.zoneButtonTextActive
                    ]}>
                      {zone}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </ScrollView>

          <View style={styles.buttons}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Annuler</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.saveButton} onPress={onSave}>
              <Ionicons name="checkmark" size={20} color="#fff" />
              <Text style={styles.saveButtonText}>Sauvegarder</Text>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  form: {
    marginBottom: 20,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  hint: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  quantityButton: {
    backgroundColor: '#3498db',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityInput: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  zoneButton: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  zoneButtonActive: {
    backgroundColor: '#3498db',
    borderColor: '#2980b9',
  },
  zoneButtonText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
  },
  zoneButtonTextActive: {
    color: '#fff',
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
  saveButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#006e3e',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default EditItemModal;