import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const UnauthorizedDomainHelper = ({ onClose }) => {
  const openFirebaseConsole = () => {
    Linking.openURL('https://console.firebase.google.com/project/foodapp-4e511/authentication/settings');
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Ionicons name="warning" size={32} color="#ff6b6b" />
          <Text style={styles.title}>Domaine non autorisé</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <Text style={styles.description}>
          Firebase bloque la connexion depuis ce domaine pour des raisons de sécurité.
        </Text>

        <View style={styles.stepsContainer}>
          <Text style={styles.stepsTitle}>🔧 Solution rapide :</Text>
          
          <View style={styles.step}>
            <Text style={styles.stepNumber}>1</Text>
            <Text style={styles.stepText}>Ouvrir Firebase Console</Text>
          </View>
          
          <View style={styles.step}>
            <Text style={styles.stepNumber}>2</Text>
            <Text style={styles.stepText}>Authentication > Settings > Authorized domains</Text>
          </View>
          
          <View style={styles.step}>
            <Text style={styles.stepNumber}>3</Text>
            <Text style={styles.stepText}>Ajouter "localhost" et "127.0.0.1"</Text>
          </View>
          
          <View style={styles.step}>
            <Text style={styles.stepNumber}>4</Text>
            <Text style={styles.stepText}>Sauvegarder et rafraîchir cette page</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.firebaseButton} 
          onPress={openFirebaseConsole}
        >
          <Ionicons name="open" size={20} color="#fff" />
          <Text style={styles.firebaseButtonText}>
            Ouvrir Firebase Console
          </Text>
        </TouchableOpacity>

        <View style={styles.domainsBox}>
          <Text style={styles.domainsTitle}>Domaines à ajouter :</Text>
          <Text style={styles.domain}>localhost</Text>
          <Text style={styles.domain}>127.0.0.1</Text>
        </View>

        <Text style={styles.footer}>
          ℹ️ Cette erreur prouve que l'auth Google cross-platform fonctionne !
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  container: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 16,
    padding: 24,
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginLeft: 12,
  },
  closeButton: {
    padding: 4,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 20,
  },
  stepsContainer: {
    marginBottom: 20,
  },
  stepsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepNumber: {
    backgroundColor: '#4CAF50',
    color: '#fff',
    width: 24,
    height: 24,
    borderRadius: 12,
    textAlign: 'center',
    lineHeight: 24,
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 12,
  },
  stepText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  firebaseButton: {
    backgroundColor: '#ff6b35',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  firebaseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  domainsBox: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    marginBottom: 16,
  },
  domainsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 8,
  },
  domain: {
    fontSize: 16,
    fontFamily: 'monospace',
    backgroundColor: '#e9ecef',
    padding: 8,
    borderRadius: 4,
    marginBottom: 4,
    color: '#495057',
  },
  footer: {
    fontSize: 14,
    color: '#28a745',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default UnauthorizedDomainHelper;
