import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const KNORR_COLORS = {
  primary: '#006e3e',
  accent: '#F2A900',
  white: '#FFFFFF',
  textLight: '#6b8270',
};

export default function FridgeFilters({ selectedFilter, onFilterChange, counts }) {
  const filters = [
    { key: 'all', label: 'Tous', count: counts.total, color: KNORR_COLORS.primary },
    { key: 'fresh', label: 'Frais', count: counts.fresh, color: '#4CAF50' },
    { key: 'expiringSoon', label: 'À consommer', count: counts.expiringSoon, color: '#FF9800' },
    { key: 'expired', label: 'Périmés', count: counts.expired, color: '#F44336' },
  ];

  return (
    <View style={styles.container}>
      {filters.map((filter) => (
        <TouchableOpacity
          key={filter.key}
          style={[
            styles.filterButton,
            selectedFilter === filter.key && { 
              backgroundColor: filter.color + '20',
              borderColor: filter.color,
            },
          ]}
          onPress={() => onFilterChange(filter.key)}
        >
          <Text
            style={[
              styles.filterText,
              selectedFilter === filter.key && { 
                color: filter.color,
                fontWeight: '700',
              },
            ]}
          >
            {filter.label}
          </Text>
          <View
            style={[
              styles.badge,
              selectedFilter === filter.key && { backgroundColor: filter.color },
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                selectedFilter === filter.key && { color: '#FFF' },
              ]}
            >
              {filter.count}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 15,
    gap: 8,
    backgroundColor: '#f8faf8',
  },
  filterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#E8EDE9',
    gap: 6,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b8270',
  },
  badge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#E8EDE9',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6b8270',
  },
});