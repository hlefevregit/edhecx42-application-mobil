import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import googleAuthService from '../services/googleAuthService.crossplatform';
import { useNavigation } from '../hooks/useNavigation';
import ExpoGoWarning from '../components/ExpoGoWarning'; // Ajout de l'avertissement

const LoginScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showExpoWarning, setShowExpoWarning] = useState(true); // État pour l'avertissement

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // La navigation sera gérée automatiquement par onAuthStateChanged
    } catch (error) {
      console.error('Erreur connexion:', error);
      let errorMessage = 'Erreur de connexion';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'Aucun compte trouvé avec cet email';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Mot de passe incorrect';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Email invalide';
      }
      
      Alert.alert('Erreur', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      const result = await googleAuthService.signInWithGoogle();
      
      if (result.success) {
        // La navigation sera gérée automatiquement par onAuthStateChanged
        console.log('Connexion Google réussie:', result.user.email);
      } else {
        Alert.alert('Erreur', result.error);
      }
    } catch (error) {
      console.error('Erreur Google Login:', error);
      Alert.alert('Erreur', 'Impossible de se connecter avec Google');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* Logo et titre */}
        <View style={styles.header}>
          <Ionicons name="cart" size={80} color="#2ecc71" />
          <Text style={styles.title}>FoodApp</Text>
          <Text style={styles.subtitle}>Gérez votre alimentation simplement</Text>
        </View>

        {/* Avertissement Expo Go */}
        {showExpoWarning && <ExpoGoWarning onDismiss={() => setShowExpoWarning(false)} />}

        {/* Formulaire */}
        <View style={styles.form}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="votre@email.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />

          <Text style={styles.label}>Mot de passe</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="password"
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Connexion...' : 'Se connecter'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkContainer}
            onPress={navigation.goToRegister}
          >
            <Text style={styles.linkText}>
              Pas encore de compte ? <Text style={styles.linkBold}>S'inscrire</Text>
            </Text>
          </TouchableOpacity>

          {/* 🧪 Bouton de test temporaire */}
          {/* <TouchableOpacity
            style={styles.testButton}
            onPress={() => navigation.navigate('GoogleAuthTest')}
          >
            <Text style={styles.testButtonText}>🧪 Tester Google Auth</Text>
          </TouchableOpacity> */}
        </View>

        {/* Options login social */}
        <View style={styles.socialSection}>
          <Text style={styles.orText}>Ou se connecter avec</Text>
          <View style={styles.socialButtons}>
            <TouchableOpacity
              style={[styles.socialButton, googleLoading && styles.buttonDisabled]}
              onPress={handleGoogleLogin}
              disabled={googleLoading}
            >
              {googleLoading ? (
                <ActivityIndicator size="small" color="#DB4437" />
              ) : (
                <Ionicons name="logo-google" size={24} color="#DB4437" />
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.socialButton}
              onPress={() => Alert.alert('Bientôt disponible', 'La connexion Apple sera disponible dans une prochaine version')}
            >
              <Ionicons name="logo-apple" size={24} color="#000" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 50,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#2ecc71',
    marginTop: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
  form: {
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#2ecc71',
    padding: 18,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 30,
  },
  buttonDisabled: {
    backgroundColor: '#95a5a6',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  linkContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  linkText: {
    fontSize: 16,
    color: '#666',
  },
  linkBold: {
    color: '#2ecc71',
    fontWeight: 'bold',
  },
  socialSection: {
    alignItems: 'center',
  },
  orText: {
    fontSize: 14,
    color: '#999',
    marginBottom: 15,
  },
  socialButtons: {
    flexDirection: 'row',
    gap: 15,
  },
  socialButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  testButton: {
    backgroundColor: '#6c757d',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  testButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default LoginScreen;