import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import apiService from '../services/apiService';

WebBrowser.maybeCompleteAuthSession();

const COLORS = {
  gradientStart: '#E8F5F0',
  gradientMid: '#B8D9CE',
  gradientEnd: '#006e3e',
  black: '#000000',
  white: '#FFFFFF',
  textGray: '#6B7280',
  google: '#4285F4',
  facebook: '#1877F2',
  apple: '#000000',
};

const GOOGLE_CLIENT_ID = '930883947615-3ful7pfe6k38qbdqfph7ja2lp76spahf.apps.googleusercontent.com';

export default function LoginScreen({ navigation }) {
  const [loading, setLoading] = useState(false);

  // Configuration Google OAuth
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: GOOGLE_CLIENT_ID,
    iosClientId: GOOGLE_CLIENT_ID, // Utilise le même ou un spécifique iOS
    androidClientId: GOOGLE_CLIENT_ID, // Utilise le même ou un spécifique Android
    webClientId: GOOGLE_CLIENT_ID,
  });

  useEffect(() => {
    if (response?.type === 'success') {
      handleGoogleResponse(response.authentication.idToken);
    }
  }, [response]);

  const handleGoogleResponse = async (idToken) => {
    try {
      setLoading(true);
      
      // Envoyer le token à ton backend
      const result = await apiService.googleLogin(idToken);
      
      // Sauvegarder le token JWT et les infos user
      await AsyncStorage.setItem('authToken', result.token);
      await AsyncStorage.setItem('userId', result.user.id);
      await AsyncStorage.setItem('userEmail', result.user.email);
      
      console.log('Google login success:', result.user);
      
      // L'AppNavigator va détecter le token et naviguer automatiquement
      // Ou tu peux forcer: navigation.navigate('Main')
      
    } catch (error) {
      console.error('Google login error:', error);
      Alert.alert('Error', 'Google sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignup = () => {
    navigation.navigate('EmailSignup');
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      await promptAsync();
    } catch (error) {
      console.error('Google prompt error:', error);
      Alert.alert('Error', 'Could not open Google sign-in');
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookSignIn = async () => {
    Alert.alert('Coming Soon', 'Facebook sign-in will be available soon');
  };

  const handleAppleSignIn = async () => {
    Alert.alert('Coming Soon', 'Apple sign-in will be available soon');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Gradient Background */}
      <LinearGradient
        colors={[COLORS.gradientStart, COLORS.gradientMid, COLORS.gradientEnd]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Content */}
      <View style={styles.content}>
        {/* Logo Section */}
        <View style={styles.logoSection}>
          <Text style={styles.logoText}>🍽️</Text>
          <Text style={styles.appName}>FoodApp</Text>
        </View>

        {/* Buttons Section */}
        <View style={styles.buttonsSection}>
          {/* Email Signup Button */}
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handleEmailSignup}
            disabled={loading}
          >
            <Text style={styles.primaryButtonText}>Sign up with email</Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or use social sign up</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Google Button */}
          <TouchableOpacity
            style={[styles.button, styles.socialButton, loading && styles.buttonDisabled]}
            onPress={handleGoogleSignIn}
            disabled={loading || !request}
          >
            <View style={styles.socialButtonContent}>
              <Ionicons name="logo-google" size={20} color={COLORS.google} />
              <Text style={styles.socialButtonText}>Continue with Google</Text>
            </View>
          </TouchableOpacity>

          {/* Facebook Button */}
          <TouchableOpacity
            style={[styles.button, styles.socialButton]}
            onPress={handleFacebookSignIn}
            disabled={loading}
          >
            <View style={styles.socialButtonContent}>
              <Ionicons name="logo-facebook" size={20} color={COLORS.facebook} />
              <Text style={styles.socialButtonText}>Continue with Facebook</Text>
            </View>
          </TouchableOpacity>

          {/* Apple Button */}
          <TouchableOpacity
            style={[styles.button, styles.socialButton]}
            onPress={handleAppleSignIn}
            disabled={loading}
          >
            <View style={styles.socialButtonContent}>
              <Ionicons name="logo-apple" size={20} color={COLORS.apple} />
              <Text style={styles.socialButtonText}>Continue with Apple</Text>
            </View>
          </TouchableOpacity>

          {/* Login Link */}
          <TouchableOpacity
            style={styles.loginLink}
            onPress={() => navigation.navigate('EmailLogin')}
          >
            <Text style={styles.loginLinkText}>
              Already have an account? <Text style={styles.loginLinkBold}>Log in</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 60 : 40,
  },
  logoSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 80,
    marginBottom: 16,
  },
  appName: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.white,
  },
  buttonsSection: {
    gap: 12,
  },
  button: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  primaryButton: {
    backgroundColor: COLORS.black,
  },
  primaryButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  socialButton: {
    backgroundColor: COLORS.white,
  },
  socialButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.black,
  },
  loginLink: {
    marginTop: 16,
    alignItems: 'center',
  },
  loginLinkText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  loginLinkBold: {
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});