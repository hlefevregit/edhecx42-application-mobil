# 🔧 DEBUG GUIDE - DÉCONNEXION GOOGLE

## 🚨 Problème
La déconnexion ne fonctionne pas pour les utilisateurs connectés avec Google (mode démo).

## ✅ Corrections Appliquées

### **1. ProfileScreen - Gestion des Profils Google**
- ✅ **Helper getProfileValue()** pour gérer les différentes structures de profil
- ✅ **Gestion conditionnelle** des propriétés du profil (allergies, préférences, etc.)
- ✅ **Affichage du provider** Google avec indicateur mode démo
- ✅ **Logs de debug** détaillés dans handleLogout

### **2. Service Google Auth - Mode Démo Amélioré**
- ✅ **Création de profil démo** temporaire dans Firebase
- ✅ **Profil Knorr démo** avec données par défaut
- ✅ **Gestion d'erreurs** si Firebase n'est pas accessible

### **3. Structure des Données**

#### **Profil Inscription Classique:**
```javascript
{
  uid: "user123",
  email: "user@email.com",
  profile: {
    dietStyle: "Végétarien",
    allergies: ["Gluten"],
    preferences: ["Bio"],
    budget: 200,
    gdprConsent: {
      geolocation: true,
      consentDate: "2025-10-15"
    }
  }
}
```

#### **Profil Google (Réel):**
```javascript
{
  uid: "google_user_123",
  email: "user@gmail.com",
  displayName: "John Doe",
  provider: "google",
  isGoogleUser: true,
  dietaryRestrictions: [],
  allergies: [],
  favoriteCategories: []
}
```

#### **Profil Google (Mode Démo):**
```javascript
{
  uid: "demo_user_1729012345",
  email: "demo@foodapp.com",
  displayName: "Utilisateur Démo",
  provider: "google",
  isDemo: true,
  isGoogleUser: true,
  platform: "demo",
  favoriteCategories: ["Démo", "Test"]
}
```

## 🔍 Instructions de Debug

### **1. Test de Connexion Démo**
```bash
1. Scannez QR code avec Expo Go
2. Allez dans LoginScreen 
3. Cliquez "🔑 Tester Google Sign-In"
4. Vérifiez → Alert "Mode Démo" apparaît
5. Vérifiez → Redirection vers HomeScreen
```

### **2. Test ProfileScreen**
```bash
1. Une fois connecté en mode démo
2. Allez dans ProfileScreen (via navigation)
3. Vérifiez → Profil s'affiche sans erreur
4. Vérifiez → "Connecté avec Google - Mode Démo" visible
5. Vérifiez → Boutons Knorr fonctionnels
```

### **3. Test de Déconnexion**
```bash
1. Dans ProfileScreen, cliquez "Se déconnecter"
2. Confirmez la déconnexion
3. Ouvrez la console Expo (press 'j' pour debugger)
4. Cherchez ces logs:
```

#### **Logs Attendus (Succès):**
```
🔓 Tentative de déconnexion...
👤 User avant déconnexion: demo@foodapp.com
📊 Type de profil: google
🔄 Appel du service Google Auth...
👋 Déconnexion mode démo
📋 Résultat signOutGoogle: { success: true, platform: 'demo' }
✅ Déconnexion réussie
👤 User après déconnexion service: null
```

#### **Logs d'Erreur (Problème):**
```
❌ Erreur déconnexion service: [Error message]
🔄 Tentative fallback Firebase...
✅ Déconnexion Firebase fallback réussie
👤 User après fallback: null
```

### **4. Navigation Automatique**
```bash
1. Après déconnexion réussie
2. App.js détecte user = null
3. Redirection automatique vers AuthNavigator
4. Vous devriez voir LoginScreen
```

## 🛠️ Si ça ne marche toujours pas

### **Vérification 1: AuthListener**
```javascript
// Dans App.js
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
    console.log('🔄 AuthState changed:', currentUser?.email || 'null');
    setUser(currentUser); // ← CRUCIAL
    setLoading(false);
  });
  return () => unsubscribe();
}, []);
```

### **Vérification 2: AppNavigator**
```javascript
// Doit rediriger selon user
return (
  <NavigationContainer>
    {user ? <MainNavigator /> : <AuthNavigator />}
  </NavigationContainer>
);
```

### **Vérification 3: Forcer la déconnexion**
```javascript
// Dans ProfileScreen, ajouter bouton debug temporaire
<TouchableOpacity onPress={async () => {
  await signOut(auth);
  console.log('🔥 Force signOut Firebase');
}}>
  <Text>🔥 Force Logout (Debug)</Text>
</TouchableOpacity>
```

## 🎯 Points de Contrôle

- [ ] ProfileScreen se charge sans erreur avec profil Google
- [ ] Bouton "Se déconnecter" appelle le service Google Auth
- [ ] Logs de debug apparaissent dans la console
- [ ] Service retourne `{ success: true }`
- [ ] AuthListener détecte le changement (user → null)
- [ ] Navigation automatique vers LoginScreen

## 💡 Solutions Alternatives

### **Si le service Google Auth ne fonctionne pas:**
```javascript
// Déconnexion directe dans ProfileScreen
const handleEmergencyLogout = async () => {
  try {
    await signOut(auth);
    console.log('🚨 Déconnexion d\'urgence réussie');
  } catch (error) {
    console.log('🚨 Échec déconnexion d\'urgence');
  }
};
```

### **Si l'AuthListener ne réagit pas:**
```javascript
// Forcer la navigation
import { navigationRef } from '../navigation/navigationService';

const forceNavigation = () => {
  navigationRef.current?.reset({
    index: 0,
    routes: [{ name: 'Auth' }],
  });
};
```

## ✅ Status Corrections

- [x] ProfileScreen compatible Google + inscription classique
- [x] Mode démo crée profil temporaire
- [x] Logs de debug détaillés  
- [x] Fallback Firebase si service échoue
- [x] Gestion des erreurs RGPD
- [x] Indicateurs visuels mode démo

**TEST MAINTENANT** → Scannez le QR code et testez la déconnexion !
