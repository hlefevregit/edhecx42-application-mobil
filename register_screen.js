import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert
} from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';

const RegisterScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  
  // Profil alimentaire
  const [allergies, setAllergies] = useState('');
  const [preferences, setPreferences] = useState('');
  const [dietStyle, setDietStyle] = useState('omnivore');
  const [productsToAvoid, setProductsToAvoid] = useState('');
  const [budget, setBudget] = useState('');
  
  // Consentement RGPD
  const [gdprGeolocation, setGdprGeolocation] = useState(false);
  const [gdprData, setGdprData] = useState(false);

  const dietStyles = ['omnivore', 'végétarien', 'vegan', 'flexitarien'];

  const handleRegister = async () => {
    // Validation
    if (!email || !password || !displayName) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (!gdprData) {
      Alert.alert('RGPD', 'Vous devez accepter le traitement de vos données');
      return;
    }

    try {
      // Créer l'utilisateur
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Créer le profil dans Firestore
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        displayName,
        createdAt: new Date(),
        profile: {
          allergies: allergies.split(',').map(a => a.trim()).filter(Boolean),
          preferences: preferences.split(',').map(p => p.trim()).filter(Boolean),
          dietStyle,
          productsToAvoid: productsToAvoid.split(',').map(p => p.trim()).filter(Boolean),
          budget: budget ? parseFloat(budget) : 0,
          gdprConsent: {
            geolocation: gdprGeolocation,
            dataProcessing: gdprData,
            consentDate: new Date()
          }
        }
      });

      // Créer une liste de courses vide
      await setDoc(doc(db, 'shopping_lists', user.uid), {
        userId: user.uid,
        items: [],
        updatedAt: new Date()
      });

      // Créer un frigo vide
      await setDoc(doc(db, 'fridge_items', user.uid), {
        items: []
      });

      Alert.alert('Succès', 'Votre compte a été créé !');
      
    } catch (error) {
      console.error('Erreur inscription:', error);
      Alert.alert('Erreur', error.message);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Créer un compte</Text>
      
      {/* Informations de connexion */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informations de connexion</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Nom d'affichage *"
          value={displayName}
          onChangeText={setDisplayName}
        />
        
        <TextInput
          style={styles.input}
          placeholder="Email *"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        
        <TextInput
          style={styles.input}
          placeholder="Mot de passe *"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </View>

      {/* Profil alimentaire */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Votre profil alimentaire</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Allergies (séparées par des virgules)"
          value={allergies}
          onChangeText={setAllergies}
        />
        
        <TextInput
          style={styles.input}
          placeholder="Préférences (bio, local, etc.)"
          value={preferences}
          onChangeText={setPreferences}
        />
        
        <Text style={styles.label}>Style alimentaire :</Text>
        <View style={styles.dietButtons}>
          {dietStyles.map(style => (
            <TouchableOpacity
              key={style}
              style={[
                styles.dietButton,
                dietStyle === style && styles.dietButtonActive
              ]}
              onPress={() => setDietStyle(style)}
            >
              <Text style={[
                styles.dietButtonText,
                dietStyle === style && styles.dietButtonTextActive
              ]}>
                {style}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <TextInput
          style={styles.input}
          placeholder="Produits à éviter"
          value={productsToAvoid}
          onChangeText={setProductsToAvoid}
        />
        
        <TextInput
          style={styles.input}
          placeholder="Budget mensuel (€)"
          value={budget}
          onChangeText={setBudget}
          keyboardType="numeric"
        />
      </View>

      {/* Consentements RGPD */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Consentements RGPD</Text>
        
        <TouchableOpacity
          style={styles.checkbox}
          onPress={() => setGdprGeolocation(!gdprGeolocation)}
        >
          <View style={[styles.checkboxBox, gdprGeolocation && styles.checkboxBoxChecked]}>
            {gdprGeolocation && <Text style={styles.checkboxCheck}>✓</Text>}
          </View>
          <Text style={styles.checkboxLabel}>
            J'accepte l'utilisation de ma géolocalisation pour calculer le temps passé en magasin
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.checkbox}
          onPress={() => setGdprData(!gdprData)}
        >
          <View style={[styles.checkboxBox, gdprData && styles.checkboxBoxChecked]}>
            {gdprData && <Text style={styles.checkboxCheck}>✓</Text>}
          </View>
          <Text style={styles.checkboxLabel}>
            J'accepte le traitement de mes données personnelles *
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>S'inscrire</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.link}>Déjà un compte ? Se connecter</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2ecc71',
    marginBottom: 30,
    textAlign: 'center',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  label: {
    fontSize: 16,
    color: '#555',
    marginBottom: 8,
  },
  dietButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  dietButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2ecc71',
    marginRight: 8,
    marginBottom: 8,
  },
  dietButtonActive: {
    backgroundColor: '#2ecc71',
  },
  dietButtonText: {
    color: '#2ecc71',
    fontSize: 14,
  },
  dietButtonTextActive: {
    color: '#fff',
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  checkboxBox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#2ecc71',
    borderRadius: 4,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxBoxChecked: {
    backgroundColor: '#2ecc71',
  },
  checkboxCheck: {
    color: '#fff',
    fontWeight: 'bold',
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 14,
    color: '#555',
  },
  button: {
    backgroundColor: '#2ecc71',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  link: {
    textAlign: 'center',
    color: '#2ecc71',
    fontSize: 16,
    marginBottom: 20,
  },
});

export default RegisterScreen;