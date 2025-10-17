import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { generateBasicMockData, generateLargeMockData, generateExpiringMockData } from '../utils/mockData';

const TestModePanel = ({ onTestData }) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) {
    return (
      <TouchableOpacity 
        style={styles.showButton}
        onPress={() => setIsVisible(true)}
      >
        <Text style={styles.showButtonText}>🧪 Afficher les tests</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🧪 Mode Test (ordinateur)</Text>
        <TouchableOpacity onPress={() => setIsVisible(false)}>
          <Text style={styles.hideButton}>✕</Text>
        </TouchableOpacity>
      </View>
      
      <Text style={styles.subtitle}>
        Testez le Smart Fridge sans API Google Vision
      </Text>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <TouchableOpacity
          style={styles.testButton}
          onPress={() => {
            const data = generateBasicMockData();
            onTestData(data);
            Alert.alert('📦 Test Basique', `${data.length} produits générés`);
          }}
        >
          <Text style={styles.testButtonText}>
            📦 Frigo Basique (5 items)
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.testButton}
          onPress={() => {
            const data = generateLargeMockData();
            onTestData(data);
            Alert.alert('🛒 Test Complet', `${data.length} produits générés`);
          }}
        >
          <Text style={styles.testButtonText}>
            🛒 Frigo Plein (10 items)
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.testButton}
          onPress={() => {
            const data = generateExpiringMockData();
            onTestData(data);
            Alert.alert('⚠️ Test Urgence', `${data.length} produits qui expirent bientôt`);
          }}
        >
          <Text style={styles.testButtonText}>
            ⚠️ Items qui expirent
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff3cd',
    padding: 15,
    borderRadius: 8,
    margin: 15,
    borderWidth: 2,
    borderColor: '#ffc107',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#856404',
  },
  hideButton: {
    fontSize: 18,
    color: '#856404',
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 12,
    color: '#856404',
    marginBottom: 10,
  },
  testButton: {
    backgroundColor: '#ffc107',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginRight: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  testButtonText: {
    color: '#856404',
    fontWeight: '600',
    fontSize: 12,
  },
  showButton: {
    backgroundColor: '#ffc107',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    margin: 15,
    alignSelf: 'flex-start',
  },
  showButtonText: {
    color: '#856404',
    fontWeight: '600',
    fontSize: 12,
  },
});

export default TestModePanel;