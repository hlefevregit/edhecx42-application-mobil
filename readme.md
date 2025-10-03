# FoodApp MVP - Application Mobile de Gestion Alimentaire

Application mobile React Native permettant de gérer sa liste de courses, scanner des produits, suivre ses statistiques alimentaires et participer à une communauté.

## 📱 Fonctionnalités MVP (Version 1.0)

### ✅ Implémenté
- **Authentification** : Inscription/Connexion avec email et mot de passe
- **Profil utilisateur** : Gestion du profil alimentaire (allergies, préférences, régime, budget)
- **Liste de courses** : Ajout, modification, suppression d'articles
- **Scan code-barres** : Activation automatique quand le téléphone est à plat
- **Détails produit** : Informations nutritionnelles via Open Food Facts API
- **Frigo virtuel** : Ajout manuel d'aliments
- **Statistiques** : Graphiques de temps passé en magasin, économies réalisées
- **Forum communautaire** : Publication et consultation d'astuces, recettes, avis
- **RGPD** : Consentements explicites, export et suppression de données

### 🚧 À venir (Version 2.0)
- Login social (Google/Apple)
- Reconnaissance d'aliments par photo
- Géolocalisation en temps réel
- Recommandations de recettes
- Liens d'achat directs
- Notifications de dates de péremption

## 🛠️ Stack Technique

- **Frontend** : React Native 0.74 + Expo SDK 51
- **Backend** : Firebase (Auth, Firestore, Storage)
- **Navigation** : React Navigation 6
- **Graphiques** : React Native Chart Kit
- **Scan** : Expo Camera + Barcode Scanner
- **Capteurs** : Expo Sensors (détection orientation)
- **API Externe** : Open Food Facts (données produits)

## 📋 Prérequis

- Node.js >= 18.x
- npm ou yarn
- Expo CLI
- Compte Firebase (gratuit)
- Smartphone iOS/Android OU Émulateur

## 🚀 Installation

### 1. Cloner le projet

```bash
git clone <votre-repo>
cd food-app-mvp
```

### 2. Installer les dépendances

```bash
npm install
# ou
yarn install
```

### 3. Configuration Firebase

1. Créer un projet sur [Firebase Console](https://console.firebase.google.com/)
2. Activer **Authentication** (Email/Password)
3. Créer une base **Firestore Database** (mode test)
4. Créer une application Web et copier les clés de configuration
5. Remplacer les valeurs dans `firebaseConfig.js` :

```javascript
const firebaseConfig = {
  apiKey: "VOTRE_API_KEY",
  authDomain: "votre-projet.firebaseapp.com",
  projectId: "votre-projet-id",
  storageBucket: "votre-projet.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

### 4. Structure du projet

Créer la structure suivante :

```
food-app-mvp/
├── App.js
├── firebaseConfig.js
├── package.json
├── screens/
│   ├── LoginScreen.js
│   ├── RegisterScreen.js
│   ├── HomeScreen.js
│   ├── BarcodeScannerScreen.js
│   ├── ProductDetailScreen.js
│   ├── StatsScreen.js
│   ├── FridgeScreen.js
│   ├── CommunityScreen.js
│   └── ProfileScreen.js
└── README.md
```

### 5. Lancer l'application

```bash
npx expo start
```

Scannez le QR code avec :
- **iOS** : Application Appareil photo
- **Android** : Expo Go app

## 📱 Utilisation

### Première utilisation

1. **Inscription** : Créer un compte avec email/mot de passe
2. **Profil** : Remplir vos préférences alimentaires
3. **Consentements RGPD** : Accepter le traitement des données

### Fonctionnalités principales

#### 🛒 Liste de Courses
- Ajouter des articles manuellement
- Cocher les articles achetés
- Supprimer des articles

#### 📷 Scanner un Produit
- **Méthode 1** : Poser le téléphone à plat (activation auto)
- **Méthode 2** : Bouton "Scanner un produit"
- Voir les informations nutritionnelles
- Ajouter à la liste ou au frigo

#### 📊 Statistiques
- Temps passé en magasin (graphique)
- Économies réalisées
- Catégories favorites
- Accès au frigo depuis cette page

#### 🧊 Frigo Virtuel
- Ajouter des aliments manuellement
- Gérer les quantités
- Icônes automatiques selon le type

#### 💬 Communauté
- Publier des astuces, recettes, avis
- Consulter les publications des autres
- Liker les posts

#### 👤 Profil
- Voir ses informations
- Gérer les consentements RGPD
- Exporter ses données
- Se déconnecter
- Supprimer son compte

## 🔒 Conformité RGPD

L'application respecte le RGPD avec :
- ✅ Consentement explicite lors de l'inscription
- ✅ Opt-in pour la géolocalisation
- ✅ Droit à l'export des données
- ✅ Droit à l'oubli (suppression compte)
- ✅ Transparence sur l'utilisation des données
- ✅ Données stockées en Europe (Firebase EU)

## 🧪 Tests

### Scénarios de test

1. **Inscription/Connexion**
   - Créer un compte
   - Se déconnecter
   - Se reconnecter

2. **Liste de courses**
   - Ajouter 3 articles
   - Cocher 1 article
   - Supprimer 1 article

3. **Scan de produit**
   - Scanner un code-barres (ex: 3017620422003 - Nutella)
   - Vérifier les informations affichées
   - Ajouter au frigo

4. **Statistiques**
   - Vérifier l'affichage du graphique
   - Accéder au frigo
   - Vérifier les données simulées

5. **Communauté**
   - Créer un post de type "astuce"
   - Liker un post
   - Vérifier l'ordre chronologique

## 🐛 Problèmes connus (MVP)

- Détection orientation peut varier selon les devices
- Stats de géolocalisation simulées (implémentation V2)
- Login social non fonctionnel (V2)
- Reconnaissance photo frigo non implémentée (V2)

## 📈 Roadmap V2

### Sprint 1 (2 semaines)
- Intégration Google Sign-In / Apple Sign-In
- Amélioration UI/UX avec animations
- Optimisation performances

### Sprint 2 (2 semaines)
- Reconnaissance d'aliments par photo (ML Kit)
- Géolocalisation temps réel avec geofencing
- Notifications push

### Sprint 3 (2 semaines)
- Système de recommandations de recettes
- Intégration API achats (liens produits)
- Gestion dates de péremption

### Sprint 4 (1 semaine)
- Tests end-to-end
- Optimisation base de données
- Préparation stores (iOS/Android)

### Sprint 5 (1 semaine)
- Beta testing
- Corrections bugs
- Publication stores

## 🎨 Personnalisation

### Couleurs principales
```javascript
primary: '#2ecc71'    // Vert
secondary: '#3498db'  // Bleu
warning: '#f39c12'    // Orange
danger: '#e74c3c'     // Rouge
purple: '#9b59b6'     // Violet
```

### Modifier le thème
Éditer les `StyleSheet` dans chaque fichier screen.

## 📄 Licence

MIT License - Libre d'utilisation

## 👥 Support

Pour toute question :
- Email : support@foodapp.com
- GitHub Issues : [lien vers issues]

## 🙏 Crédits

- **Open Food Facts** : Base de données produits alimentaires
- **Firebase** : Backend et authentification
- **Expo** : Framework de développement
- **React Native** : Framework mobile

## 📊 Métriques MVP

### Complexité
- **Écrans** : 9
- **Composants** : ~15
- **API endpoints** : 1 (Open Food Facts)
- **Collections Firestore** : 5

### Temps de développement estimé
- Setup initial : 4h
- Authentification : 8h
- Écrans principaux : 16h
- Scan & détection : 8h
- Statistiques : 6h
- Communauté : 6h
- Tests : 8h
- **Total : ~56 heures** (1,5 semaines)

## 🔧 Configuration avancée

### Permissions nécessaires

Dans `app.json` :
```json
{
  "expo": {
    "permissions": [
      "CAMERA",
      "ACCESS_FINE_LOCATION",
      "ACCESS_COARSE_LOCATION"
    ],
    "ios": {
      "infoPlist": {
        "NSCameraUsageDescription": "L'application a besoin d'accéder à la caméra pour scanner les codes-barres.",
        "NSLocationWhenInUseUsageDescription": "L'application utilise votre position pour calculer le temps passé en magasin (avec votre consentement)."
      }
    },
    "android": {
      "permissions": [
        "CAMERA",
        "ACCESS_FINE_LOCATION"
      ]
    }
  }
}
```

### Variables d'environnement

Pour la production, utiliser des variables d'environnement :

1. Créer `.env` :
```
FIREBASE_API_KEY=votre_key
FIREBASE_AUTH_DOMAIN=votre_domain
FIREBASE_PROJECT_ID=votre_id
```

2. Installer `react-native-dotenv`
3. Modifier `firebaseConfig.js` pour utiliser `process.env`

### Règles Firestore

Dans Firebase Console > Firestore > Règles :

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Shopping lists
    match /shopping_lists/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Fridge items
    match /fridge_items/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Stats
    match /stats/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Posts - lecture publique, écriture authentifiée
    match /posts/{postId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null && request.auth.uid == resource.data.userId;
      allow delete: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    // Products - lecture publique
    match /products/{barcode} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## 🚀 Déploiement

### Build pour iOS

```bash
# Installer EAS CLI
npm install -g eas-cli

# Login
eas login

# Configurer le projet
eas build:configure

# Build
eas build --platform ios
```

### Build pour Android

```bash
eas build --platform android
```

### Publication sur stores

1. **Apple App Store**
   - Créer un compte Apple Developer (99€/an)
   - Configurer l'app dans App Store Connect
   - Soumettre pour review

2. **Google Play Store**
   - Créer un compte Google Play Console (25€ unique)
   - Créer une fiche produit
   - Soumettre l'APK/AAB

## 📝 Checklist avant production

### Technique
- [ ] Supprimer tous les `console.log`
- [ ] Gérer tous les cas d'erreur
- [ ] Optimiser les images
- [ ] Tester sur devices réels (iOS + Android)
- [ ] Vérifier les permissions
- [ ] Configurer les règles Firestore
- [ ] Activer Firebase Analytics

### Légal
- [ ] Rédiger CGU/CGV
- [ ] Rédiger politique de confidentialité
- [ ] Configurer mentions RGPD
- [ ] Prévoir email de contact support
- [ ] Vérifier conformité stores

### UX/UI
- [ ] Icon app (1024x1024)
- [ ] Splash screen
- [ ] Screenshots stores (tous formats)
- [ ] Description app (FR/EN)
- [ ] Vidéo démo (optionnel)

## 🔍 FAQ

### Q: Pourquoi l'app ne détecte pas l'orientation ?
**R:** Vérifiez que DeviceMotion est disponible sur votre appareil. Certains émulateurs ne supportent pas les capteurs.

### Q: Le scan de code-barres ne fonctionne pas
**R:** Vérifiez les permissions caméra et testez sur un device réel (pas émulateur).

### Q: Erreur Firebase "Permission denied"
**R:** Vérifiez les règles Firestore et que l'utilisateur est bien authentifié.

### Q: L'app est lente
**R:** 
- Optimisez les requêtes Firestore (limit, index)
- Utilisez `useMemo` et `useCallback`
- Implémentez la pagination pour les listes longues

### Q: Comment tester sans créer de compte ?
**R:** Créez un compte de test : `test@foodapp.com` / `test123456`

## 📞 Contact & Contribution

### Contribuer
1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit (`git commit -m 'Add AmazingFeature'`)
4. Push (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

### Guidelines de contribution
- Code en français (commentaires, variables)
- Respecter l'architecture existante
- Tester sur iOS et Android
- Documenter les nouvelles fonctionnalités

### Roadmap communautaire
Votez pour les prochaines features sur [GitHub Discussions]

---

**Développé avec ❤️ pour simplifier la gestion alimentaire**

Version MVP 1.0.0 - Octobre 2025