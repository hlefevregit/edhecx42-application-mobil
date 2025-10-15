import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Switch,
  Platform
} from 'react-native';
import { signOut } from 'firebase/auth';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import googleAuthService from '../services/googleAuthService.crossplatform';
import { useNavigation } from '../hooks/useNavigation';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const ProfileScreen = ({ navigation: reactNavigation }) => {
  const navigation = useNavigation(); // Utiliser notre hook de navigation
  const [userProfile, setUserProfile] = useState(null);
  const [knorrProfile, setKnorrProfile] = useState(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const userId = auth.currentUser?.uid;

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    if (!userId) return;
    
    try {
      const docRef = doc(db, 'users', userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setUserProfile(docSnap.data());
      }

      // Charger profil Knorr
      const knorrDoc = await getDoc(doc(db, 'knorr_user_profiles', userId));
      if (knorrDoc.exists()) {
        setKnorrProfile(knorrDoc.data());
      }
    } catch (error) {
      console.error('Erreur chargement profil:', error);
    }
  };

  const handleLogout = async () => {
      try {
          await signOut(auth);
          addLog('✅ Firebase signOut réussi');
        } catch (error) {
          addLog(`❌ Erreur Firebase signOut: ${error.message}`);
        }
        try {
          const result = await googleAuthService.signOutGoogle();
          addLog(`📋 Résultat service: ${JSON.stringify(result)}`);
        } catch (error) {
          addLog(`❌ Erreur service: ${error.message}`);
        }
    // Alert.alert(
    //   'Déconnexion',
    //   'Voulez-vous vraiment vous déconnecter ?',
    //   [
    //     { text: 'Annuler', style: 'cancel' },
    //     {
    //       text: 'Déconnexion',
    //       style: 'destructive',
    //       onPress: async () => {
    //         console.log('🔓 === DÉBUT DÉCONNEXION ===');
    //         console.log('👤 User avant déconnexion:', auth.currentUser?.email);
    //         console.log('📊 Type de profil:', userProfile?.provider || 'email');
    //         console.log('🌐 Platform OS:', Platform.OS);
            
    //         try {
    //           // Utiliser le service Google Auth pour une déconnexion complète
    //           console.log('🔄 Appel du service Google Auth crossplatform...');
    //           const result = await googleAuthService.signOutGoogle();
              
    //           console.log('📋 Résultat complet signOutGoogle:', JSON.stringify(result, null, 2));
              
    //           if (result.success) {
    //             console.log('✅ Service signale déconnexion réussie');
    //             console.log('👤 User après service:', auth.currentUser?.email || 'null');
                
    //             // Attendre un peu pour que Firebase mette à jour l'état
    //             setTimeout(() => {
    //               console.log('👤 User après timeout:', auth.currentUser?.email || 'null');
    //             }, 500);
                
    //             // La navigation sera gérée automatiquement par l'AuthListener dans App.js
    //           } else {
    //             console.log('⚠️ Service retourne success: false, erreur:', result.error);
    //             throw new Error(result.error || 'Échec de la déconnexion du service Google');
    //           }
    //         } catch (error) {
    //           console.error('❌ Erreur déconnexion service:', error.message);
    //           console.error('❌ Stack trace:', error.stack);
              
    //           // Fallback : déconnexion Firebase directe si le service Google échoue
    //           try {
    //             console.log('🔄 === FALLBACK FIREBASE ===');
    //             await signOut(auth);
    //             console.log('✅ Déconnexion Firebase fallback réussie');
    //             console.log('👤 User après fallback:', auth.currentUser?.email || 'null');
    //           } catch (fallbackError) {
    //             console.error('❌ Erreur déconnexion fallback:', fallbackError);
    //             Alert.alert('Erreur', 'Impossible de se déconnecter. Veuillez redémarrer l\'application.');
    //           }
    //         }
            
    //         console.log('🔓 === FIN DÉCONNEXION ===');
    //       }
    //     }
    //   ]
    // );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Supprimer le compte',
      'Cette action est irréversible. Toutes vos données seront supprimées définitivement.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'users', userId));
              await deleteDoc(doc(db, 'shopping_lists', userId));
              await deleteDoc(doc(db, 'fridge_items', userId));
              await deleteDoc(doc(db, 'stats', userId));
              await deleteDoc(doc(db, 'knorr_user_profiles', userId));
              
              await auth.currentUser.delete();
              
              Alert.alert('Compte supprimé', 'Votre compte a été supprimé avec succès');
            } catch (error) {
              console.error('Erreur suppression:', error);
              Alert.alert('Erreur', 'Impossible de supprimer le compte. Vous devez peut-être vous reconnecter.');
            }
          }
        }
      ]
    );
  };

  const handleExportData = () => {
    Alert.alert(
      'Export des données',
      'Un export de vos données vous sera envoyé par email (fonctionnalité V2)',
      [{ text: 'OK' }]
    );
  };

  if (!userProfile) {
    return (
      <View style={styles.container}>
        <Text>Chargement...</Text>
      </View>
    );
  }

  const getLevelColor = (level) => {
    if (level >= 20) return '#e74c3c';
    if (level >= 10) return '#9b59b6';
    if (level >= 5) return '#3498db';
    return '#2ecc71';
  };

  const userLevel = knorrProfile?.knorrLevel || 1;

  // Fonction helper pour gérer les différents types de profils
  const getProfileValue = (path, defaultValue = 'Non renseigné') => {
    if (userProfile.profile && userProfile.profile[path]) {
      return userProfile.profile[path];
    }
    if (userProfile[path]) {
      return userProfile[path];
    }
    return defaultValue;
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header avec Gradient */}
      <LinearGradient
        colors={[getLevelColor(userLevel), getLevelColor(userLevel) + 'dd']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          {/* Avatar */}
          <View style={[styles.avatar, { borderColor: '#fff' }]}>
            <Text style={styles.avatarText}>
              {userProfile.displayName?.charAt(0).toUpperCase()}
            </Text>
            {knorrProfile && (
              <View style={styles.levelBadge}>
                <Text style={styles.levelText}>{userLevel}</Text>
              </View>
            )}
          </View>

          {/* Info */}
          <Text style={styles.name}>{userProfile.displayName}</Text>
          <Text style={styles.email}>{userProfile.email}</Text>

          {/* Knorr Stats */}
          {knorrProfile && (
            <View style={styles.knorrStats}>
              <View style={styles.knorrStat}>
                <Ionicons name="star" size={20} color="#f39c12" />
                <Text style={styles.knorrStatText}>{knorrProfile.knorrXP || 0} XP</Text>
              </View>
              <View style={styles.knorrStat}>
                <Ionicons name="gift" size={20} color="#fff" />
                <Text style={styles.knorrStatText}>{knorrProfile.rewardPoints || 0} pts</Text>
              </View>
            </View>
          )}

          {/* Bouton voir profil Knorr */}
          <TouchableOpacity
            style={styles.knorrProfileButton}
            onPress={() => navigation.goToKnorrProfile(userId)}
          >
            <Ionicons name="restaurant" size={20} color="#e63946" />
            <Text style={styles.knorrProfileButtonText}>Voir mon profil Knorr</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.quickActionCard}
          onPress={() => reactNavigation.navigate('Fridge')}
        >
          <LinearGradient
            colors={['#9b59b6', '#8e44ad']}
            style={styles.quickActionGradient}
          >
            <Ionicons name="snow" size={32} color="#fff" />
            <Text style={styles.quickActionTitle}>Mon Frigo</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionCard}
          onPress={() => navigation.goToKnorrShop()}
        >
          <LinearGradient
            colors={['#e63946', '#c1121f']}
            style={styles.quickActionGradient}
          >
            <Ionicons name="gift" size={32} color="#fff" />
            <Text style={styles.quickActionTitle}>Boutique</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionCard}
          onPress={() => navigation.goToKnorrChallenges()}
        >
          <LinearGradient
            colors={['#f39c12', '#e67e22']}
            style={styles.quickActionGradient}
          >
            <Ionicons name="trophy" size={32} color="#fff" />
            <Text style={styles.quickActionTitle}>Défis</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Profil alimentaire */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="restaurant" size={24} color="#2ecc71" />
          <Text style={styles.sectionTitle}>Profil Alimentaire</Text>
        </View>
        
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="leaf" size={20} color="#2ecc71" />
            <Text style={styles.infoLabel}>Style alimentaire</Text>
            <Text style={styles.infoValue}>{getProfileValue('dietStyle')}</Text>
          </View>

          {/* Afficher les allergies si elles existent */}
          {(userProfile.profile?.allergies?.length > 0 || userProfile.allergies?.length > 0) && (
            <View style={styles.infoRow}>
              <Ionicons name="warning" size={20} color="#e74c3c" />
              <Text style={styles.infoLabel}>Allergies</Text>
              <Text style={styles.infoValue}>
                {(userProfile.profile?.allergies || userProfile.allergies || []).join(', ')}
              </Text>
            </View>
          )}

          {/* Afficher les préférences si elles existent */}
          {(userProfile.profile?.preferences?.length > 0 || userProfile.favoriteCategories?.length > 0) && (
            <View style={styles.infoRow}>
              <Ionicons name="heart" size={20} color="#e74c3c" />
              <Text style={styles.infoLabel}>Préférences</Text>
              <Text style={styles.infoValue}>
                {(userProfile.profile?.preferences || userProfile.favoriteCategories || []).join(', ')}
              </Text>
            </View>
          )}

          {/* Afficher le budget s'il existe */}
          {(userProfile.profile?.budget > 0 || userProfile.budget > 0) && (
            <View style={styles.infoRow}>
              <Ionicons name="wallet" size={20} color="#3498db" />
              <Text style={styles.infoLabel}>Budget mensuel</Text>
              <Text style={styles.infoValue}>{userProfile.profile?.budget || userProfile.budget} €</Text>
            </View>
          )}

          {/* Afficher le provider pour les comptes Google */}
          {userProfile.provider === 'google' && (
            <View style={styles.infoRow}>
              <Ionicons name="logo-google" size={20} color="#DB4437" />
              <Text style={styles.infoLabel}>Connecté avec Google</Text>
              <Text style={styles.infoValue}>
                {userProfile.isDemo ? 'Mode Démo' : 'Compte Google'}
              </Text>
            </View>
          )}
        </View>

        <TouchableOpacity 
          style={styles.editProfileButton}
          onPress={() => {
            // Temporairement, afficher un message
            Alert.alert(
              'Modifier le profil',
              'La modification de profil sera disponible dans une prochaine version.',
              [{ text: 'OK' }]
            );
          }}
        >
          <Ionicons name="create" size={20} color="#3498db" />
          <Text style={styles.editProfileButtonText}>Modifier mon profil</Text>
        </TouchableOpacity>
      </View>

      {/* Paramètres */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="settings" size={24} color="#3498db" />
          <Text style={styles.sectionTitle}>Paramètres</Text>
        </View>

        <View style={styles.settingCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="notifications" size={22} color="#f39c12" />
              <Text style={styles.settingLabel}>Notifications</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#ddd', true: '#2ecc71' }}
            />
          </View>

          <TouchableOpacity style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="language" size={22} color="#3498db" />
              <Text style={styles.settingLabel}>Langue</Text>
            </View>
            <View style={styles.settingValue}>
              <Text style={styles.settingValueText}>Français</Text>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Confidentialité RGPD */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="shield-checkmark" size={24} color="#9b59b6" />
          <Text style={styles.sectionTitle}>Confidentialité (RGPD)</Text>
        </View>
        
        <View style={styles.gdprCard}>
          <View style={styles.gdprRow}>
            <View style={styles.gdprInfo}>
              <Text style={styles.gdprLabel}>Géolocalisation</Text>
              <Text style={styles.gdprSubtext}>
                Calcul du temps passé en magasin
              </Text>
            </View>
            <Ionicons
              name={userProfile.profile?.gdprConsent?.geolocation ? 'checkmark-circle' : 'close-circle'}
              size={24}
              color={userProfile.profile?.gdprConsent?.geolocation ? '#2ecc71' : '#e74c3c'}
            />
          </View>

          <View style={styles.gdprRow}>
            <View style={styles.gdprInfo}>
              <Text style={styles.gdprLabel}>Traitement des données</Text>
              <Text style={styles.gdprSubtext}>
                {userProfile.profile?.gdprConsent?.consentDate 
                  ? `Consentement donné le ${new Date(userProfile.profile.gdprConsent.consentDate).toLocaleDateString('fr-FR')}`
                  : 'Compte Google - Consentement implicite'
                }
              </Text>
            </View>
            <Ionicons name="checkmark-circle" size={24} color="#2ecc71" />
          </View>
        </View>

        <TouchableOpacity 
          style={styles.exportButton}
          onPress={handleExportData}
        >
          <Ionicons name="download" size={20} color="#3498db" />
          <Text style={styles.exportButtonText}>Exporter mes données</Text>
        </TouchableOpacity>
      </View>

      {/* Actions dangereuses */}
      <View style={styles.section}>
        {/* Bouton de debug pour le web */}
        {Platform.OS === 'web' && (
          <TouchableOpacity 
            style={[styles.logoutButton, { backgroundColor: '#f39c12' }]} 
            onPress={() => navigation.navigate('WebLogoutDebugger')}
          >
            <Ionicons name="bug" size={20} color="#fff" />
            <Text style={styles.logoutButtonText}>🧪 Debug Logout Web</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          style={styles.logoutButton} 
          onPress={handleLogout}
        >
          <Ionicons name="log-out" size={20} color="#fff" />
          <Text style={styles.logoutButtonText}>Se déconnecter</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.deleteButton} 
          onPress={handleDeleteAccount}
        >
          <Ionicons name="trash" size={20} color="#fff" />
          <Text style={styles.deleteButtonText}>Supprimer mon compte</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.version}>FoodApp v2.1 - Knorr Social</Text>
        <Text style={styles.footerText}>
          Fait avec ❤️ pour une alimentation plus intelligente
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    alignItems: 'center',
  },
  headerContent: {
    alignItems: 'center',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#fff',
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    position: 'relative',
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#666',
  },
  levelBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#f39c12',
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  email: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 5,
    marginBottom: 15,
  },
  knorrStats: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 15,
  },
  knorrStat: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  knorrStatText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  knorrProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  knorrProfileButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e63946',
  },
  quickActions: {
    flexDirection: 'row',
    padding: 15,
    gap: 10,
  },
  quickActionCard: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionGradient: {
    padding: 15,
    alignItems: 'center',
  },
  quickActionTitle: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
    marginTop: 8,
  },
  section: {
    marginBottom: 15,
    paddingHorizontal: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    flex: 1,
    fontSize: 15,
    color: '#666',
    marginLeft: 12,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#3498db',
    paddingVertical: 12,
    borderRadius: 12,
  },
  editProfileButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#3498db',
  },
  settingCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  settingValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingValueText: {
    fontSize: 15,
    color: '#666',
    marginRight: 8,
  },
  gdprCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 12,
  },
  gdprRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  gdprInfo: {
    flex: 1,
  },
  gdprLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  gdprSubtext: {
    fontSize: 13,
    color: '#999',
    marginTop: 4,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#3498db',
    paddingVertical: 12,
    borderRadius: 12,
  },
  exportButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#3498db',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#95a5a6',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e74c3c',
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  footer: {
    padding: 30,
    alignItems: 'center',
  },
  version: {
    fontSize: 12,
    color: '#999',
    marginBottom: 5,
  },
  footerText: {
    fontSize: 11,
    color: '#bbb',
    textAlign: 'center',
  },
});

export default ProfileScreen;