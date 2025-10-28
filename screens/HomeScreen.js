import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';

// Palette Knorr
const KNORR_COLORS = {
  green: '#00753A',
  greenDark: '#005A2D',
  greenLight: '#27AE60',
  yellow: '#FFD93D',
  white: '#FFFFFF',
  background: '#F5F7FA',
  text: '#1a1a1a',
  textLight: '#666',
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
      {/* Header Knorr */}
      <LinearGradient
        colors={[KNORR_COLORS.green, KNORR_COLORS.greenDark]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.menuButton} onPress={() => {}}>
            <Ionicons name="menu" size={28} color={KNORR_COLORS.white} />
          </TouchableOpacity>
          
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Knorr</Text>
            <Text style={styles.headerSubtitle}>SINCE 1838</Text>
          </View>
          
          <TouchableOpacity style={styles.notificationButton} onPress={() => {}}>
            <Ionicons name="notifications" size={28} color={KNORR_COLORS.white} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.greetingContainer}>
        <Text style={styles.greeting}>Bonjour, {userName} 👋</Text>
        <Text style={styles.subtitle}>Que souhaitez-vous faire aujourd'hui ?</Text>
      </View>

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.widgetsContainer} 
        showsVerticalScrollIndicator={false}
      >
        {widgets.map((w) => (
          <TouchableOpacity 
            key={w.id} 
            style={styles.widgetCard} 
            onPress={w.action} 
            activeOpacity={0.7}
          >
            <View style={styles.iconContainer}>
              <Ionicons name={w.icon} size={48} color={KNORR_COLORS.white} />
            </View>
            <Text style={styles.widgetTitle}>{w.title}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: KNORR_COLORS.background 
  },
  
  // Header Knorr
  header: {
    paddingHorizontal: 20, 
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20, 
    borderBottomLeftRadius: 20, 
    borderBottomRightRadius: 20,
  },
  headerContent: {
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
  },
  menuButton: { 
    width: 40, 
    height: 40, 
    justifyContent: 'center' 
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitle: { 
    fontSize: 26, 
    fontWeight: '700', 
    color: KNORR_COLORS.white,
    letterSpacing: 1,
  },
  headerSubtitle: {
    fontSize: 9,
    color: KNORR_COLORS.yellow,
    fontWeight: '600',
    letterSpacing: 3,
    marginTop: -2,
  },
  notificationButton: { 
    width: 40, 
    height: 40, 
    justifyContent: 'center', 
    alignItems: 'flex-end' 
  },
  
  // Greeting
  greetingContainer: { 
    paddingHorizontal: 20, 
    paddingTop: 24, 
    paddingBottom: 16 
  },
  greeting: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: KNORR_COLORS.text, 
    marginBottom: 4 
  },
  subtitle: { 
    fontSize: 14, 
    color: KNORR_COLORS.textLight 
  },
  
  // Widgets (2 par ligne)
  scrollView: { 
    flex: 1 
  },
  widgetsContainer: { 
    paddingHorizontal: 20, 
    paddingBottom: 20, 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'space-between' 
  },
  widgetCard: {
    width: '48%', 
    backgroundColor: KNORR_COLORS.white, 
    borderRadius: 20, 
    padding: 20, 
    marginBottom: 16,
    alignItems: 'center', 
    justifyContent: 'center', 
    minHeight: 160, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 4, 
    elevation: 3,
  },
  iconContainer: { 
    width: 80, 
    height: 80, 
    borderRadius: 16, 
    backgroundColor: KNORR_COLORS.green,  // Vert Knorr
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 12 
  },
  widgetTitle: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: KNORR_COLORS.text, 
    textAlign: 'center' 
  },
});