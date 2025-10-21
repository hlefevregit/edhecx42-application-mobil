import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

const COLORS = {
  primary: '#006e3e',
  primaryLight: '#339966',
  background: '#f8faf8',
  white: '#FFFFFF',
  text: '#1a1a1a',
  textLight: '#666',
  widgetBg: '#FFFFFF',
};

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const userName = user?.displayName || 'Utilisateur';

  const navigateRoot = (name, params) => {
    navigation.getParent()?.navigate(name, params);
  };

  const widgets = [
    { id: 'reviews', title: 'My Reviews', icon: 'star', action: () => navigation.navigate('Community') },
    { id: 'list',    title: 'My List',    icon: 'clipboard', action: () => navigateRoot('ShoppingList') },
    { id: 'fridge',  title: 'My Fridge',  icon: 'business',  action: () => navigateRoot('Fridge') },
    { id: 'recipes', title: 'My Recipes', icon: 'restaurant', action: () => navigateRoot('Recipes') },
    { id: 'scanner', title: 'QR Scanner', icon: 'qr-code',    action: () => navigateRoot('BarcodeScanner') },
    { id: 'store',   title: 'Store Map',  icon: 'map',        action: () => navigateRoot('StoreMap') },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuButton} onPress={() => {}}>
          <Ionicons name="menu" size={28} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Widgets</Text>
        <TouchableOpacity style={styles.notificationButton} onPress={() => {}}>
          <Ionicons name="notifications" size={28} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.greetingContainer}>
        <Text style={styles.greeting}>Bonjour, {userName} 👋</Text>
        <Text style={styles.subtitle}>Que souhaitez-vous faire aujourd'hui ?</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.widgetsContainer} showsVerticalScrollIndicator={false}>
        {widgets.map((w) => (
          <TouchableOpacity key={w.id} style={styles.widgetCard} onPress={w.action} activeOpacity={0.7}>
            <View style={[styles.iconContainer, { backgroundColor: COLORS.primaryLight }]}>
              <Ionicons name={w.icon} size={48} color={COLORS.white} />
            </View>
            <Text style={styles.widgetTitle}>{w.title}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: COLORS.primary, paddingHorizontal: 20, paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20, borderBottomLeftRadius: 20, borderBottomRightRadius: 20,
  },
  menuButton: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: COLORS.white },
  notificationButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'flex-end' },
  greetingContainer: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 16 },
  greeting: { fontSize: 24, fontWeight: 'bold', color: COLORS.text, marginBottom: 4 },
  subtitle: { fontSize: 14, color: COLORS.textLight },
  scrollView: { flex: 1 },
  widgetsContainer: { paddingHorizontal: 20, paddingBottom: 20, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  widgetCard: {
    width: '48%', backgroundColor: COLORS.widgetBg, borderRadius: 20, padding: 20, marginBottom: 16,
    alignItems: 'center', justifyContent: 'center', minHeight: 160, shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
  },
  iconContainer: { width: 80, height: 80, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  widgetTitle: { fontSize: 16, fontWeight: '600', color: COLORS.text, textAlign: 'center' },
});