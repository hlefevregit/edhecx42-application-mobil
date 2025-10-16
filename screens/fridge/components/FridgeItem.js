import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getItemStatus, getStatusColor, getStatusLabel, getCategoryIcon } from '../utils/fridgeHelpers';

const FridgeItem = ({ 
  item, 
  onEdit, 
  onConsume, 
  onExpired, 
  onIncrease, 
  onDecrease 
}) => {
  const status = getItemStatus(item.expiryDate);
  const statusColor = getStatusColor(status);
  const statusLabel = getStatusLabel(status);
  const isExpired = status === 'expired';

  return (
    <View style={[styles.container, { borderLeftColor: statusColor }]}>
      <TouchableOpacity style={styles.content} onPress={onEdit}>
        <Text style={styles.icon}>{getCategoryIcon(item.name)}</Text>
        <View style={styles.info}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.quantity}>Quantité: {item.quantity}</Text>
          <Text style={[styles.status, { color: statusColor }]}>
            {statusLabel}
          </Text>
          {item.expiryDate && (
            <Text style={styles.expiry}>
              Expire le {new Date(item.expiryDate).toLocaleDateString('fr-FR')}
            </Text>
          )}
          {item.zone && (
            <Text style={styles.zone}>📍 {item.zone}</Text>
          )}
        </View>
      </TouchableOpacity>
      
      <View style={styles.actions}>
        <TouchableOpacity style={styles.consumeButton} onPress={onConsume}>
          <Ionicons name="checkmark-circle" size={20} color="#fff" />
          <Text style={styles.actionText}>Consommer</Text>
        </TouchableOpacity>

        {isExpired && (
          <TouchableOpacity style={styles.expiredButton} onPress={onExpired}>
            <Ionicons name="trash" size={20} color="#fff" />
            <Text style={styles.actionText}>Jeter</Text>
          </TouchableOpacity>
        )}

        <View style={styles.quantityControls}>
          <TouchableOpacity style={styles.quantityButton} onPress={onDecrease}>
            <Ionicons name="remove" size={18} color="#fff" />
          </TouchableOpacity>
          
          <Text style={styles.quantityText}>{item.quantity}</Text>
          
          <TouchableOpacity style={styles.quantityButton} onPress={onIncrease}>
            <Ionicons name="add" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    fontSize: 36,
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  quantity: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  status: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 4,
  },
  expiry: {
    fontSize: 13,
    marginTop: 4,
    fontWeight: '600',
  },
  zone: {
    fontSize: 11,
    color: '#7f8c8d',
    marginTop: 2,
  },
  actions: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 8,
  },
  consumeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2ecc71',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 15,
    gap: 5,
  },
  expiredButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e74c3c',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 15,
    gap: 5,
  },
  actionText: {
    color: '#fff',
    fontSize: 11,
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
  quantityText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    minWidth: 30,
    textAlign: 'center',
  },
});

export default FridgeItem;