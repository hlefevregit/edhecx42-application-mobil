import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import GoogleSignInButton from './GoogleSignInButton';
import ExpoGoWarning from './ExpoGoWarning';
import googleAuthService from '../services/googleAuthService.crossplatform';

const QuickGoogleTest = () => {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [showWarning, setShowWarning] = useState(true);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const result = await googleAuthService.signInWithGoogle();
      
      if (result.success) {
        setUser(result.user);
        Alert.alert(
          result.isDemo ? '🎯 Mode Démo' : '✅ Connexion Réussie',
          result.isDemo 
            ? 'Connexion simulée avec succès ! En mode production, cela se connecterait à votre compte Google réel.'
            : `Bienvenue ${result.user.displayName || result.user.email}!`
        );
      } else {
        Alert.alert('❌ Erreur', result.error || 'Erreur de connexion');
      }
    } catch (error) {
      Alert.alert('❌ Erreur', 'Une erreur inattendue s\'est produite');
      console.error('Erreur Google Sign-In:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await googleAuthService.signOutGoogle();
      setUser(null);
      Alert.alert('👋 Déconnexion', 'Vous avez été déconnecté avec succès');
    } catch (error) {
      Alert.alert('❌ Erreur', 'Erreur lors de la déconnexion');
    }
  };

  return (
    <ScrollView style={styles.container}>
      {showWarning && (
        <ExpoGoWarning onDismiss={() => setShowWarning(false)} />
      )}

      <View style={styles.content}>
        <Text style={styles.title}>🧪 Test Google Authentication</Text>
        <Text style={styles.subtitle}>
          Testez l'authentification Google dans votre application
        </Text>

        {!user ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Se connecter</Text>
            <GoogleSignInButton
              onPress={handleGoogleSignIn}
              loading={loading}
              text="🔑 Tester Google Sign-In"
            />
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Utilisateur connecté</Text>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user.displayName || 'Utilisateur'}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>
              <Text style={styles.userId}>ID: {user.uid}</Text>
            </View>
            
            <GoogleSignInButton
              onPress={handleSignOut}
              text="🚪 Se déconnecter"
              style={styles.signOutButton}
            />
          </View>
        )}

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>ℹ️ Informations</Text>
          <Text style={styles.infoText}>
            • En mode Expo Go : Authentification simulée{'\n'}
            • En mode Development Build : Authentification réelle{'\n'}
            • Les données de test ne sont pas persistantes
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
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
    color: '#666',
    marginBottom: 30,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  userInfo: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  userId: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'monospace',
  },
  signOutButton: {
    backgroundColor: '#6c757d',
  },
  infoSection: {
    backgroundColor: '#e3f2fd',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1976d2',
  },
  infoText: {
    fontSize: 14,
    color: '#1976d2',
    lineHeight: 20,
  },
});

export default QuickGoogleTest;