import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';

const FridgeFilters = ({ selectedFilter, onFilterChange, counts }) => {
  const filters = [
    { id: 'all', label: `Tout (${counts.all})`, bgColor: null },
    { id: 'expired', label: `🗑️ Périmés (${counts.expired})`, bgColor: counts.expired > 0 ? '#ffe5e5' : null },
    { id: 'urgent', label: `⚠️ Urgent (${counts.urgent})`, bgColor: counts.urgent > 0 ? '#ffe8d5' : null },
    { id: 'soon', label: `⏰ Bientôt (${counts.soon})`, bgColor: counts.soon > 0 ? '#fff3cd' : null },
    { id: 'fresh', label: `✅ Frais (${counts.fresh})`, bgColor: null },
  ];

  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.container}
    >
      {filters.map(filter => (
        <TouchableOpacity
          key={filter.id}
          style={[
            styles.button,
            selectedFilter === filter.id && styles.buttonActive,
            filter.bgColor && { backgroundColor: filter.bgColor }
          ]}
          onPress={() => onFilterChange(filter.id)}
        >
          <Text style={[
            styles.buttonText,
            selectedFilter === filter.id && styles.buttonTextActive
          ]}>
            {filter.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    maxHeight: 50,
    marginHorizontal: 15,
    marginBottom: 10,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  buttonActive: {
    backgroundColor: '#3498db',
    borderColor: '#2980b9',
  },
  buttonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  buttonTextActive: {
    color: '#fff',
  },
});

export default FridgeFilters;