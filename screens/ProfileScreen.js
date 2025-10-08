import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert
} from 'react-native';
import { signOut } from 'firebase/auth';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import { Ionicons } from '@expo/vector-icons';

const ProfileScreen = ({ navigation }) => {
  const [userProfile, setUserProfile] = useState(null);
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
    } catch (error) {
      console.error('Erreur chargement profil:', error);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Voulez-vous vraiment vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnexion',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut(auth);
            } catch (error) {
              console.error('Erreur déconnexion:', error);
              Alert.alert('Erreur', 'Impossible de se déconnecter');
            }
          }
        }
      ]
    );
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
              // Supprimer les données Firestore
              await deleteDoc(doc(db, 'users', userId));
              await deleteDoc(doc(db, 'shopping_lists', userId));
              await deleteDoc(doc(db, 'fridge_items', userId));
              await deleteDoc(doc(db, 'stats', userId));
              
              // Supprimer le compte
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

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {userProfile.displayName?.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.name}>{userProfile.displayName}</Text>
        <Text style={styles.email}>{userProfile.email}</Text>
      </View>

      {/* Profil alimentaire */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Profil Alimentaire</Text>
        
        <View style={styles.infoRow}>
          <Ionicons name="restaurant-outline" size={20} color="#2ecc71" />
          <Text style={styles.infoLabel}>Style alimentaire :</Text>
          <Text style={styles.infoValue}>{userProfile.profile.dietStyle}</Text>
        </View>

        {userProfile.profile.allergies?.length > 0 && (
          <View style={styles.infoRow}>
            <Ionicons name="warning-outline" size={20} color="#e74c3c" />
            <Text style={styles.infoLabel}>Allergies :</Text>
            <Text style={styles.infoValue}>
              {userProfile.profile.allergies.join(', ')}
            </Text>
          </View>
        )}

        {userProfile.profile.preferences?.length > 0 && (
          <View style={styles.infoRow}>
            <Ionicons name="heart-outline" size={20} color="#e74c3c" />
            <Text style={styles.infoLabel}>Préférences :</Text>
            <Text style={styles.infoValue}>
              {userProfile.profile.preferences.join(', ')}
            </Text>
          </View>
        )}

        {userProfile.profile.budget > 0 && (
          <View style={styles.infoRow}>
            <Ionicons name="wallet-outline" size={20} color="#3498db" />
            <Text style={styles.infoLabel}>Budget mensuel :</Text>
            <Text style={styles.infoValue}>{userProfile.profile.budget} €</Text>
          </View>
        )}
      </View>

      {/* Consentements RGPD */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Paramètres de confidentialité</Text>
        
        <View style={styles.gdprRow}>
          <View style={styles.gdprInfo}>
            <Text style={styles.gdprLabel}>Géolocalisation</Text>
            <Text style={styles.gdprSubtext}>
              Calcul du temps passé en magasin
            </Text>
          </View>
          <Ionicons
            name={userProfile.profile.gdprConsent?.geolocation ? 'checkmark-circle' : 'close-circle'}
            size={24}
            color={userProfile.profile.gdprConsent?.geolocation ? '#2ecc71' : '#e74c3c'}
          />
        </View>

        <View style={styles.gdprRow}>
          <View style={styles.gdprInfo}>
            <Text style={styles.gdprLabel}>Traitement des données</Text>
            <Text style={styles.gdprSubtext}>
              Consentement donné le{' '}
              {new Date(userProfile.profile.gdprConsent?.consentDate).toLocaleDateString('fr-FR')}
            </Text>
          </View>
          <Ionicons name="checkmark-circle" size={24} color="#2ecc71" />
        </View>
      </View>

      {/* Actions RGPD */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mes droits (RGPD)</Text>
        
        <TouchableOpacity style={styles.actionButton} onPress={handleExportData}>
          <Ionicons name="download-outline" size={20} color="#3498db" />
          <Text style={styles.actionButtonText}>Exporter mes données</Text>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Register')}>
          <Ionicons name="create-outline" size={20} color="#3498db" />
          <Text style={styles.actionButtonText}>Modifier mon profil</Text>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>
      </View>

      {/* Actions compte */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#fff" />
          <Text style={styles.logoutButtonText}>Se déconnecter</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
          <Ionicons name="trash-outline" size={20} color="#fff" />
          <Text style={styles.deleteButtonText}>Supprimer mon compte</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.version}>Version 1.0.0 (MVP)</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#2ecc71',
    padding: 30,
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#2ecc71',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  email: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
    marginTop: 5,
  },
  section: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 20,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  infoLabel: {
    fontSize: 15,
    color: '#666',
    marginLeft: 10,
    flex: 1,
  },
  infoValue: {
    fontSize: 15,
    color: '#333',
    fontWeight: '600',
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
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  actionButtonText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: '#95a5a6',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  deleteButton: {
    flexDirection: 'row',
    backgroundColor: '#e74c3c',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  version: {
    textAlign: 'center',
    color: '#999',
    fontSize: 12,
    padding: 20,
  },
});

export default ProfileScreen;