import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  Alert,
  ScrollView,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiService from '../services/apiService';
import { useAuth } from '../contexts/AuthContext';

const COLORS = {
  bg: '#FFFFFF',
  black: '#000000',
  text: '#1F2937',
  subtext: '#6B7280',
  border: '#E5E7EB',
  pill: '#F3F4F6',
  pillActive: '#10B981',
  pillText: '#374151',
  pillTextActive: '#FFFFFF',
  green: '#006e3e',
  greenLight: '#10B981',
  gray: '#9CA3AF',
  blue: '#3B82F6',
};

const ALLERGIES = [
  'Gluten', 'Dairy', 'Egg', 'Soy', 'Peanut', 'Wheat', 'Milk', 'Fish'
];

const DIETS = [
  'None', 'Vegan', 'Paleo', 'Dukan', 'Vegetarian'
];

export default function RegisterScreen({ navigation, route }) {
  const { login } = useAuth();
  const { name, email, password } = route?.params || {};

  const [selectedAllergies, setSelectedAllergies] = useState([]);
  const [selectedDiet, setSelectedDiet] = useState('None');
  const [location, setLocation] = useState(null);
  const [pushNotif, setPushNotif] = useState(true);
  const [promoNotif, setPromoNotif] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggleAllergy = (allergy) => {
    setSelectedAllergies(prev =>
      prev.includes(allergy)
        ? prev.filter(a => a !== allergy)
        : [...prev, allergy]
    );
  };

  const requestLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'We need location access to find nearby stores');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
      Alert.alert('Location found', 'Your favourite store location has been saved!');
    } catch (error) {
      console.error('Location error:', error);
      Alert.alert('Error', 'Could not get your location');
    }
  };

  const handleRegister = async () => {
    if (!email.trim() || !password.trim() || !name.trim()) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return;
    }

    setLoading(true);
    try {
      // ✅ Passer les valeurs séparément
      const response = await apiService.register(
        email.trim(), 
        password, 
        name.trim()
      );
      
      console.log('Register success:', response.user);
      
      // Redirection
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });
    } catch (error) {
      console.error('Register error:', error);
      Alert.alert('Erreur', error.message || 'Impossible de créer le compte');
    } finally {
      setLoading(false);
    }
  };

  const handlePrevious = () => {
    navigation.goBack();
  };

  const Pill = ({ label, selected, onPress }) => (
    <TouchableOpacity
      style={[styles.pill, selected && styles.pillActive]}
      onPress={onPress}
      disabled={loading}
    >
      <Text style={[styles.pillText, selected && styles.pillTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Login')} disabled={loading}>
          <Text style={styles.skipButton}>Skip</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>
          To offer you the best tailored experience we need to know more about you.
        </Text>

        {/* Allergies */}
        <Text style={styles.sectionTitle}>Any ingredient allergies?</Text>
        <View style={styles.pillsGrid}>
          {ALLERGIES.map((allergy) => (
            <Pill
              key={allergy}
              label={allergy}
              selected={selectedAllergies.includes(allergy)}
              onPress={() => toggleAllergy(allergy)}
            />
          ))}
          <TouchableOpacity style={styles.pill} disabled={loading}>
            <Text style={styles.pillText}>(+)</Text>
          </TouchableOpacity>
        </View>

        {/* Diets */}
        <Text style={styles.sectionTitle}>Do you follow any of these diets?</Text>
        <View style={styles.pillsGrid}>
          {DIETS.map((diet) => (
            <Pill
              key={diet}
              label={diet}
              selected={selectedDiet === diet}
              onPress={() => setSelectedDiet(diet)}
            />
          ))}
          <TouchableOpacity style={styles.pill} disabled={loading}>
            <Text style={styles.pillText}>(+)</Text>
          </TouchableOpacity>
        </View>

        {/* Location */}
        <View style={styles.locationSection}>
          <View style={styles.locationHeader}>
            <Text style={styles.sectionTitle}>Locate your favourite store!</Text>
            <Ionicons name="location" size={20} color={COLORS.text} />
          </View>
          <TouchableOpacity
            style={styles.mapContainer}
            onPress={requestLocation}
            disabled={loading}
          >
            {location ? (
              <View style={styles.mapPlaceholder}>
                <Ionicons name="checkmark-circle" size={40} color={COLORS.greenLight} />
                <Text style={styles.mapText}>Location saved!</Text>
              </View>
            ) : (
              <View style={styles.mapPlaceholder}>
                <Ionicons name="map-outline" size={40} color={COLORS.gray} />
                <Text style={styles.mapText}>Tap to set location</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Notifications */}
        <Text style={styles.sectionTitle}>Do you want to turn on notifications?</Text>
        
        <View style={styles.notifRow}>
          <View style={styles.notifLeft}>
            <Ionicons name="notifications-outline" size={22} color={COLORS.text} />
            <Text style={styles.notifLabel}>Push Notifications</Text>
          </View>
          <Switch
            value={pushNotif}
            onValueChange={setPushNotif}
            trackColor={{ false: COLORS.gray, true: COLORS.greenLight }}
            thumbColor={COLORS.bg}
            disabled={loading}
          />
        </View>

        <View style={styles.notifRow}>
          <View style={styles.notifLeft}>
            <Ionicons name="mail-outline" size={22} color={COLORS.text} />
            <Text style={styles.notifLabel}>Promotional Notifications</Text>
          </View>
          <Switch
            value={promoNotif}
            onValueChange={setPromoNotif}
            trackColor={{ false: COLORS.gray, true: COLORS.greenLight }}
            thumbColor={COLORS.bg}
            disabled={loading}
          />
        </View>

        {/* Buttons */}
        <View style={styles.buttonsRow}>
          <TouchableOpacity
            style={[styles.button, styles.previousButton]}
            onPress={handlePrevious}
            disabled={loading}
          >
            <Text style={styles.previousButtonText}>Previous</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.nextButton, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.bg} size="small" />
            ) : (
              <Text style={styles.nextButtonText}>Create Account</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 10,
    alignItems: 'flex-end',
  },
  skipButton: {
    fontSize: 16,
    color: COLORS.blue,
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 28,
    lineHeight: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 24,
    marginBottom: 12,
  },
  pillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  pill: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: COLORS.pill,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  pillActive: {
    backgroundColor: COLORS.greenLight,
    borderColor: COLORS.greenLight,
  },
  pillText: {
    fontSize: 15,
    color: COLORS.pillText,
    fontWeight: '500',
  },
  pillTextActive: {
    color: COLORS.pillTextActive,
    fontWeight: '600',
  },
  locationSection: {
    marginTop: 24,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  mapContainer: {
    height: 160,
    borderRadius: 12,
    backgroundColor: COLORS.pill,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  mapPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  mapText: {
    fontSize: 14,
    color: COLORS.gray,
    fontWeight: '500',
  },
  notifRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  notifLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  notifLabel: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '500',
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 32,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previousButton: {
    backgroundColor: COLORS.pill,
  },
  previousButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  nextButton: {
    backgroundColor: COLORS.green,
    shadowColor: COLORS.green,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.bg,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
});