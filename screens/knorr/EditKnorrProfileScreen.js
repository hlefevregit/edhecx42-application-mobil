import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image, TextInput, ScrollView,
  Platform, Modal, FlatList, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import apiService from '../../services/apiService';

const COLORS = {
  green: '#0E6F3B',
  greenDark: '#0B5C32',
  inputBorder: '#DADADA',
  inputBg: '#FFFFFF',
  label: '#1B1B1B',
  hint: '#9AA0A6',
  btnText: '#FFFFFF',
  peach: '#F6C28B',
};

const COUNTRIES = [
  'France', 'Belgique', 'Suisse', 'Canada', 'États-Unis', 'Royaume-Uni', 'Espagne', 'Italie', 'Allemagne',
];

export default function EditKnorrProfileScreen({ navigation, route }) {
  const userId = route?.params?.userId; // <- plus de Firebase ici
  const [password, setPassword] = useState(''); // <- évite l’erreur de variable
  // Pense à gérer l’absence d’ID:
  useEffect(() => {
    if (!userId) {
      Alert.alert('Erreur', 'Utilisateur introuvable'); 
      navigation.goBack();
    }
  }, [userId]);

  // Supprime les dépendances Firebase pour l’édition: on s’appuie sur l’API
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [dob, setDob] = useState(null);
  const [country, setCountry] = useState('France');
  const [avatarUri, setAvatarUri] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [countryModal, setCountryModal] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    navigation.setOptions?.({ headerShown: false });
    loadProfile();
  }, [navigation]);

  const loadProfile = async () => {
    try {
      const p = await apiService.getUserProfile(userId);
      setName(p.displayName || '');
      setEmail(p.email || '');
      setCountry(p.country || 'France');
      setAvatarUri(p.avatarUrl || '');
      setDob(p.dob ? new Date(p.dob) : null);
    } catch (e) {
      console.warn('Load profile failed', e);
    }
  };

  const pickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission requise', 'Accès à la galerie nécessaire.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.9,
    });
    if (!result.canceled) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const onChangeDate = (_e, selectedDate) => {
    if (Platform.OS !== 'ios') setShowDatePicker(false);
    if (selectedDate) setDob(selectedDate);
  };

  const openDateSelector = () => {
    if (Platform.OS === 'web') {
      // Fallback simple sur Web: invite l’utilisateur à saisir une date
      const val = window.prompt('Enter date (DD/MM/YYYY):', dob ? formattedDob() : '');
      if (!val) return;
      const m = val.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
      if (m) {
        const d = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
        if (!isNaN(d.getTime())) setDob(d);
      } else {
        Alert.alert('Format invalide', 'Utilisez JJ/MM/AAAA');
      }
    } else {
      setShowDatePicker(true);
    }
  };

  const formattedDob = () => {
    if (!dob) return '';
    const d = new Date(dob);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  const save = async () => {
    try {
      setSaving(true);
      await apiService.updateUserProfile(
        userId,
        {
          displayName: name,
          country,
          dob: dob ? new Date(dob).toISOString() : null,
        },
        avatarUri && !avatarUri.startsWith('http') ? avatarUri : undefined // Ré-envoie uniquement si nouvel URI local
      );
      Alert.alert('Succès', 'Modifications enregistrées.');
      navigation.goBack();
    } catch (e) {
      console.error(e);
      Alert.alert('Erreur', "Impossible d'enregistrer les modifications.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBack}>
          <Ionicons name="chevron-back" size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit profile</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Avatar bloc */}
        <View style={styles.avatarWrap}>
          <View style={styles.avatarCircle}>
            <View style={styles.avatarBg}>
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={styles.avatarImg} />
              ) : (
                <Ionicons name="person" size={54} color={COLORS.green} />
              )}
            </View>

            {/* Gear icon (décor) */}
            <View style={styles.gearBadge}>
              <Ionicons name="settings" size={16} color={COLORS.green} />
            </View>

            {/* Change photo badge */}
            <TouchableOpacity style={styles.changeBadge} onPress={pickAvatar}>
              <Ionicons name="refresh" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Name */}
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Your name"
          value={name}
          onChangeText={setName}
          placeholderTextColor={COLORS.hint}
        />

        {/* Email (disabled) */}
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={[styles.input, styles.inputDisabled]}
          value={email}
          editable={false}
          selectTextOnFocus={false}
        />

        {/* Password */}
        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="********************"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholderTextColor={COLORS.hint}
        />

        {/* Date of Birth */}
        <Text style={styles.label}>Date of Birth</Text>
        <TouchableOpacity style={styles.input} onPress={openDateSelector}>
          <Text style={[styles.inputText, !dob && { color: COLORS.hint }]}>
            {dob ? formattedDob() : 'Select date'}
          </Text>
          <Ionicons name="chevron-down" size={18} color={COLORS.hint} style={styles.inputIcon} />
        </TouchableOpacity>

        {showDatePicker && Platform.OS !== 'web' && (
          <DateTimePicker
            value={dob || new Date(2000, 0, 1)}
            mode="date"
            display={Platform.OS === 'ios' ? 'inline' : 'default'}
            onChange={onChangeDate}
            maximumDate={new Date()}
          />
        )}

        {/* Country/Region */}
        <Text style={styles.label}>Country/Region</Text>
        <TouchableOpacity style={styles.input} onPress={() => setCountryModal(true)}>
          <Text style={[styles.inputText, !country && { color: COLORS.hint }]}>
            {country || 'Select'}
          </Text>
          <Ionicons name="chevron-down" size={18} color={COLORS.hint} style={styles.inputIcon} />
        </TouchableOpacity>

        {/* Save */}
        <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.7 }]} onPress={save} disabled={saving}>
          <Text style={styles.saveBtnText}>{saving ? 'Saving...' : 'Save Changes'}</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Country modal */}
      <Modal visible={countryModal} transparent animationType="slide" onRequestClose={() => setCountryModal(false)}>
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setCountryModal(false)} />
        <View style={styles.modalSheet}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Country</Text>
            <TouchableOpacity onPress={() => setCountryModal(false)}>
              <Ionicons name="close" size={22} color="#333" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={COUNTRIES}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.countryItem}
                onPress={() => {
                  setCountry(item);
                  setCountryModal(false);
                }}
              >
                <Text style={styles.countryText}>{item}</Text>
                {country === item && <Ionicons name="checkmark" size={18} color={COLORS.green} />}
              </TouchableOpacity>
            )}
            ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: '#eee' }} />}
          />
        </View>
      </Modal>
    </View>
  );
}

const AVATAR_SIZE = 110;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  header: {
    height: 80,
    paddingTop: 40,
    paddingHorizontal: 16,
    backgroundColor: COLORS.green,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerBack: { padding: 4 },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '700' },

  avatarWrap: { alignItems: 'center', marginTop: 12, marginBottom: 8 },
  avatarCircle: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    borderWidth: 3,
    borderColor: COLORS.green,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'visible',
  },
  avatarBg: {
    width: AVATAR_SIZE - 6,
    height: AVATAR_SIZE - 6,
    borderRadius: (AVATAR_SIZE - 6) / 2,
    backgroundColor: COLORS.peach,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImg: { width: '100%', height: '100%' },

  gearBadge: {
    position: 'absolute',
    left: -6,
    bottom: -6,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#E9E9E9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  changeBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.green,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },

  label: { marginHorizontal: 16, marginTop: 14, marginBottom: 6, color: COLORS.label, fontWeight: '700' },
  input: {
    marginHorizontal: 16,
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 16,
    color: '#111',
    position: 'relative',
  },
  inputDisabled: { backgroundColor: '#F5F5F5', color: '#9AA0A6' },
  inputText: { fontSize: 16, color: '#111' },
  inputIcon: { position: 'absolute', right: 12, top: 14 },

  saveBtn: {
    marginHorizontal: 16,
    marginTop: 22,
    backgroundColor: COLORS.green,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.greenDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  saveBtnText: { color: COLORS.btnText, fontWeight: '700', fontSize: 16 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.2)' },
  modalSheet: {
    maxHeight: '55%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 20,
  },
  modalHeader: {
    paddingHorizontal: 16, paddingVertical: 12,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderBottomWidth: 1, borderBottomColor: '#eee'
  },
  modalTitle: { fontWeight: '700', fontSize: 16, color: '#333' },
  countryItem: {
    paddingHorizontal: 16, paddingVertical: 14,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'
  },
  countryText: { fontSize: 15, color: '#333' },
});