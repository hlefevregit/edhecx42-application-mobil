import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '../hooks/useNavigation';

/**
 * 🧭 EXEMPLE D'UTILISATION DE LA NAVIGATION
 * Démo des différentes façons de naviguer dans l'app
 */
const NavigationExample = () => {
  const navigation = useNavigation();

  const navigationButtons = [
    {
      title: '👤 Mon Profil',
      onPress: navigation.goToProfile,
      color: '#007AFF',
    },
    {
      title: '📱 Scanner',
      onPress: navigation.goToBarcodeScanner,
      color: '#34C759',
    },
    {
      title: '🔍 Rechercher',
      onPress: () => navigation.goToSearch('knorr'),
      color: '#FF9500',
    },
    {
      title: '🛒 Boutique Knorr',
      onPress: navigation.goToKnorrShop,
      color: '#e63946',
    },
    {
      title: '✏️ Créer un Post',
      onPress: navigation.goToCreateKnorrPost,
      color: '#FF2D92',
    },
    {
      title: '🏆 Défis Knorr',
      onPress: navigation.goToKnorrChallenges,
      color: '#AF52DE',
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🗺️ Navigation Démo</Text>
      
      <Text style={styles.subtitle}>
        Route actuelle: {navigation.getCurrentRouteName()}
      </Text>
      
      <View style={styles.buttonsContainer}>
        {navigationButtons.map((button, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.button, { backgroundColor: button.color }]}
            onPress={button.onPress}
          >
            <Text style={styles.buttonText}>{button.title}</Text>
            <Ionicons name="chevron-forward" size={20} color="#fff" />
          </TouchableOpacity>
        ))}
      </View>
      
      <TouchableOpacity
        style={styles.backButton}
        onPress={navigation.goBack}
      >
        <Ionicons name="arrow-back" size={20} color="#666" />
        <Text style={styles.backButtonText}>Retour</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    color: '#666',
    fontStyle: 'italic',
  },
  buttonsContainer: {
    flex: 1,
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#e9ecef',
    borderRadius: 8,
    marginTop: 16,
  },
  backButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#666',
  },
});

export default NavigationExample;
