import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Switch,
  Alert,
  Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../contexts/AuthContext';

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

export default function KnorrSettingsScreen({ navigation }) {
  const { user, logout } = useAuth();
  
  // États pour les switches
  const [notifications, setNotifications] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(true);
  const [recipeSuggestions, setRecipeSuggestions] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const handleLogout = () => {
    // Alert.alert(
    //   '🌿 Déconnexion',
    //   'Êtes-vous sûr de vouloir vous déconnecter ?',
    //   [
    //     {
    //       text: 'Annuler',
    //       style: 'cancel'
    //     },
    //     {
    //       text: 'Déconnexion',
    //       style: 'destructive',
          
            try {
              logout();
              // Redirection gérée par la navigation
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de se déconnecter. Réessayez.');
            }
        }
    //   ]
    // );
  

  const handleDeleteAccount = () => {
    Alert.alert(
      '⚠️ Supprimer le compte',
      'Cette action est irréversible. Toutes vos données seront supprimées.',
      [
        {
          text: 'Annuler',
          style: 'cancel'
        },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Info', 'Fonctionnalité à implémenter');
          }
        }
      ]
    );
  };

  const SettingSection = ({ title, children }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );

  const SettingRow = ({ icon, label, value, onPress, showArrow = true, iconColor = KNORR_COLORS.green }) => (
    <TouchableOpacity 
      style={styles.settingRow} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.settingLeft}>
        <View style={[styles.settingIcon, { backgroundColor: iconColor + '20' }]}>
          <Ionicons name={icon} size={22} color={iconColor} />
        </View>
        <Text style={styles.settingLabel}>{label}</Text>
      </View>
      
      <View style={styles.settingRight}>
        {value && <Text style={styles.settingValue}>{value}</Text>}
        {showArrow && <Ionicons name="chevron-forward" size={20} color={KNORR_COLORS.textLight} />}
      </View>
    </TouchableOpacity>
  );

  const SettingToggle = ({ icon, label, value, onValueChange, iconColor = KNORR_COLORS.green }) => (
    <View style={styles.settingRow}>
      <View style={styles.settingLeft}>
        <View style={[styles.settingIcon, { backgroundColor: iconColor + '20' }]}>
          <Ionicons name={icon} size={22} color={iconColor} />
        </View>
        <Text style={styles.settingLabel}>{label}</Text>
      </View>
      
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#E0E0E0', true: KNORR_COLORS.greenLight }}
        thumbColor={value ? KNORR_COLORS.green : '#f4f3f4'}
        ios_backgroundColor="#E0E0E0"
      />
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[KNORR_COLORS.green, KNORR_COLORS.greenDark]}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={26} color={KNORR_COLORS.white} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Paramètres</Text>
          <Text style={styles.headerSubtitle}>SINCE 1838</Text>
        </View>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profil utilisateur */}
        <View style={styles.profileCard}>
          <LinearGradient
            colors={[KNORR_COLORS.cream, '#FFF4CC']}
            style={styles.profileGradient}
          >
            <View style={styles.profileAvatar}>
              <Text style={styles.profileAvatarText}>
                {user?.displayName?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user?.displayName || 'Utilisateur'}</Text>
              <Text style={styles.profileEmail}>{user?.email || 'email@example.com'}</Text>
            </View>
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => Alert.alert('Info', 'Édition du profil à implémenter')}
            >
              <Ionicons name="create" size={20} color={KNORR_COLORS.green} />
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* Compte */}
        <SettingSection title="👤 Mon compte">
          <SettingRow 
            icon="person" 
            label="Informations personnelles"
            onPress={() => Alert.alert('Info', 'Profil à implémenter')}
          />
          <SettingRow 
            icon="restaurant" 
            label="Préférences alimentaires"
            value={user?.diet || 'Non défini'}
            onPress={() => Alert.alert('Info', 'Préférences à implémenter')}
          />
          <SettingRow 
            icon="medical" 
            label="Allergies & restrictions"
            onPress={() => Alert.alert('Info', 'Allergies à implémenter')}
          />
          <SettingRow 
            icon="shield-checkmark" 
            label="Sécurité & Confidentialité"
            onPress={() => Alert.alert('Info', 'Sécurité à implémenter')}
          />
        </SettingSection>

        {/* Notifications */}
        <SettingSection title="🔔 Notifications">
          <SettingToggle
            icon="notifications"
            label="Notifications push"
            value={notifications}
            onValueChange={setNotifications}
          />
          <SettingToggle
            icon="mail"
            label="Emails newsletters"
            value={emailUpdates}
            onValueChange={setEmailUpdates}
            iconColor="#3498DB"
          />
          <SettingToggle
            icon="bulb"
            label="Suggestions de recettes"
            value={recipeSuggestions}
            onValueChange={setRecipeSuggestions}
            iconColor="#FFD93D"
          />
        </SettingSection>

        {/* Préférences */}
        <SettingSection title="⚙️ Préférences">
          <SettingRow 
            icon="language" 
            label="Langue"
            value="Français"
            onPress={() => Alert.alert('Info', 'Choix de langue à implémenter')}
          />
          <SettingRow 
            icon="globe" 
            label="Région"
            value="France"
            onPress={() => Alert.alert('Info', 'Région à implémenter')}
          />
          <SettingToggle
            icon="moon"
            label="Mode sombre"
            value={darkMode}
            onValueChange={setDarkMode}
            iconColor="#9B59B6"
          />
        </SettingSection>

        {/* Communauté Knorr */}
        <SettingSection title="🌱 Communauté">
          <SettingRow 
            icon="trophy" 
            label="Mes récompenses"
            onPress={() => Alert.alert('Info', 'Récompenses à implémenter')}
            iconColor="#FFD93D"
          />
          <SettingRow 
            icon="people" 
            label="Mes abonnements"
            onPress={() => Alert.alert('Info', 'Abonnements à implémenter')}
            iconColor="#27AE60"
          />
          <SettingRow 
            icon="bookmark" 
            label="Recettes sauvegardées"
            onPress={() => Alert.alert('Info', 'Recettes sauvegardées à implémenter')}
            iconColor="#E74C3C"
          />
        </SettingSection>

        {/* Support */}
        <SettingSection title="📞 Support & Aide">
          <SettingRow 
            icon="help-circle" 
            label="Centre d'aide"
            onPress={() => Alert.alert('Info', 'Centre d\'aide à implémenter')}
            iconColor="#3498DB"
          />
          <SettingRow 
            icon="chatbubbles" 
            label="Contacter le support"
            onPress={() => Alert.alert('Info', 'Support à implémenter')}
            iconColor="#16A085"
          />
          <SettingRow 
            icon="star" 
            label="Noter l'application"
            onPress={() => Alert.alert('Info', 'Notation à implémenter')}
            iconColor="#FFD93D"
          />
          <SettingRow 
            icon="document-text" 
            label="Conditions d'utilisation"
            onPress={() => Alert.alert('Info', 'CGU à implémenter')}
            iconColor="#95A5A6"
          />
          <SettingRow 
            icon="lock-closed" 
            label="Politique de confidentialité"
            onPress={() => Alert.alert('Info', 'Politique à implémenter')}
            iconColor="#95A5A6"
          />
        </SettingSection>

        {/* À propos */}
        <SettingSection title="ℹ️ À propos">
          <SettingRow 
            icon="information-circle" 
            label="Version de l'app"
            value="1.0.0"
            showArrow={false}
            iconColor="#95A5A6"
          />
          <SettingRow 
            icon="code-slash" 
            label="Licences open source"
            onPress={() => Alert.alert('Info', 'Licences à implémenter')}
            iconColor="#95A5A6"
          />
        </SettingSection>

        {/* Actions dangereuses */}
        <View style={styles.dangerSection}>
          <TouchableOpacity 
            style={styles.logoutButton} 
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <Ionicons name="log-out" size={22} color={KNORR_COLORS.white} />
            <Text style={styles.logoutButtonText}>Se déconnecter</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.deleteButton} 
            onPress={handleDeleteAccount}
            activeOpacity={0.8}
          >
            <Ionicons name="trash" size={20} color="#E74C3C" />
            <Text style={styles.deleteButtonText}>Supprimer mon compte</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: KNORR_COLORS.background 
  },
  
  // Header
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: KNORR_COLORS.white,
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 9,
    color: KNORR_COLORS.yellow,
    fontWeight: '600',
    letterSpacing: 3,
    marginTop: -2,
  },

  scrollView: {
    flex: 1,
  },

  // Profile Card
  profileCard: {
    margin: 20,
    marginBottom: 10,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  profileGradient: {
    flexDirection: 'row',
    padding: 20,
    alignItems: 'center',
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: KNORR_COLORS.green,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileAvatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: KNORR_COLORS.white,
  },
  profileInfo: {
    flex: 1,
    marginLeft: 15,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
    color: KNORR_COLORS.text,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: KNORR_COLORS.textLight,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: KNORR_COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },

  // Sections
  section: {
    marginHorizontal: 20,
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: KNORR_COLORS.text,
    marginBottom: 12,
  },

  // Setting Row
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: KNORR_COLORS.white,
    padding: 16,
    marginBottom: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: KNORR_COLORS.text,
    flex: 1,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingValue: {
    fontSize: 14,
    color: KNORR_COLORS.textLight,
    marginRight: 8,
  },

  // Danger Section
  dangerSection: {
    marginHorizontal: 20,
    marginTop: 10,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: KNORR_COLORS.green,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: KNORR_COLORS.white,
    marginLeft: 10,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: KNORR_COLORS.white,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E74C3C',
  },
  deleteButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#E74C3C',
    marginLeft: 10,
  },
});