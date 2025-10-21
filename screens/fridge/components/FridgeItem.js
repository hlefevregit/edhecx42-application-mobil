import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getExpiryStatus, getCategoryIcon } from '../utils/fridgeHelpers';

const KNORR_COLORS = {
  primary: '#006e3e',
  accent: '#F2A900',
  white: '#FFFFFF',
  cardBg: '#FFFFFF',
  shadow: '#006e3e20',
};

export default function FridgeItem({ 
  item, 
  onEdit, 
  onConsume, 
  onExpired, 
  onIncrease, 
  onDecrease 
}) {
  const status = getExpiryStatus(item.expiryDate);
  
  const statusColors = {
    fresh: '#4CAF50',
    expiringSoon: '#FF9800',
    expired: '#F44336',
  };

  const statusEmoji = {
    fresh: '✅',
    expiringSoon: '⚠️',
    expired: '❌',
  };

  return (
    <View style={[styles.card, { borderLeftColor: statusColors[status], borderLeftWidth: 4 }]}>
      {/* Header avec icône et nom */}
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons 
            name={getCategoryIcon(item.category)} 
            size={28} 
            color={KNORR_COLORS.primary} 
          />
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.zone}>📍 {item.zone}</Text>
        </View>
        <TouchableOpacity onPress={onEdit} style={styles.editBtn}>
          <Ionicons name="pencil" size={18} color={KNORR_COLORS.accent} />
        </TouchableOpacity>
      </View>

      {/* Quantité et expiration */}
      <View style={styles.meta}>
        <View style={styles.quantity}>
          <TouchableOpacity onPress={onDecrease} style={styles.qtyBtn}>
            <Ionicons name="remove-circle-outline" size={24} color={KNORR_COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.qtyText}>x{item.quantity}</Text>
          <TouchableOpacity onPress={onIncrease} style={styles.qtyBtn}>
            <Ionicons name="add-circle-outline" size={24} color={KNORR_COLORS.primary} />
          </TouchableOpacity>
        </View>

        {item.expiryDate && (
          <View style={[styles.expiryBadge, { backgroundColor: statusColors[status] + '20' }]}>
            <Text style={[styles.expiryText, { color: statusColors[status] }]}>
              {statusEmoji[status]} {new Date(item.expiryDate).toLocaleDateString('fr-FR')}
            </Text>
          </View>
        )}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity onPress={onConsume} style={styles.actionBtn}>
          <Ionicons name="restaurant-outline" size={20} color={KNORR_COLORS.primary} />
          <Text style={styles.actionText}>Consommer</Text>
        </TouchableOpacity>
        {status === 'expired' && (
          <TouchableOpacity onPress={onExpired} style={[styles.actionBtn, styles.dangerBtn]}>
            <Ionicons name="trash-outline" size={20} color="#F44336" />
            <Text style={[styles.actionText, { color: '#F44336' }]}>Périmé</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: KNORR_COLORS.cardBg,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: KNORR_COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  zone: {
    fontSize: 13,
    color: '#6b8270',
    marginTop: 2,
  },
  editBtn: {
    padding: 8,
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  quantity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  qtyBtn: {
    padding: 4,
  },
  qtyText: {
    fontSize: 18,
    fontWeight: '700',
    color: KNORR_COLORS.primary,
    minWidth: 40,
    textAlign: 'center',
  },
  expiryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  expiryText: {
    fontSize: 12,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F5E9',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  dangerBtn: {
    backgroundColor: '#FFEBEE',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: KNORR_COLORS.primary,
  },
});