# 📱 Food App MVP - Documentation Technique

## 🎯 Vue d'ensemble du projet

**Food App** est une application mobile cross-platform développée avec React Native et Expo, permettant aux utilisateurs de scanner des produits alimentaires, gérer leur frigo intelligent, et participer à une communauté sociale gamifiée autour de la cuisine.

---

## 🛠️ Stack Technique

### **Frontend Mobile**
- **React Native** - Framework principal pour le développement mobile cross-platform
- **Expo** - Plateforme de développement rapide (SDK 52)
- **React Navigation v6** - Système de navigation hiérarchique
- **Firebase SDK** - Backend-as-a-Service

### **Backend & Services**
- **Node.js + Express** - API REST (my-node-backend)
- **Prisma ORM** - Gestion de la base de données
- **PostgreSQL** - Base de données relationnelle
- **Firebase Authentication** - Authentification Google cross-platform
- **Firestore** - Base de données NoSQL temps réel

### **APIs Externes**
- **Open Food Facts API** - Base de données produits alimentaires
- **Google Vision API** - Reconnaissance d'images pour le scan de produits (prévu)

---

## 🏗️ Architecture de l'Application

### **Structure Modulaire**

```
FoodApp/
├── screens/           # Écrans de l'application
│   ├── HomeScreen.js
│   ├── ProfileScreen.js
│   ├── fridge/       # Module Smart Fridge
│   └── knorr/        # Module Social Knorr
├── navigation/        # Système de navigation centralisé
├── services/          # Services métier (API, Auth, Geolocation)
├── components/        # Composants réutilisables
├── contexts/          # Context API pour state global
└── my-node-backend/   # API REST Node.js
```

### **Navigation Hiérarchique**

Architecture organisée en **stacks imbriqués** :

```
AppNavigator (Root)
├── AuthNavigator → Login, Register
└── MainNavigator
    ├── TabNavigator → Home, Stats, Knorr
    ├── ProfileScreen (Modal)
    ├── BarcodeScanner (Fullscreen)
    └── KnorrNavigator → Feed, Shop, Challenges
```

**Fichier clé** : `navigation/navigationService.js`

---

## 🔑 Fonctionnalités Principales

### **1. Authentification Multi-Plateforme**

**Service intelligent** : `services/googleAuthService.crossplatform.js`

- **Web** : Firebase Auth Web (`signInWithPopup`)
- **Mobile** : React Native Google Sign-In
- **Détection automatique** de la plateforme
- **Mode démo** pour tests sans configuration complexe

```javascript
// Auto-détection
if (Platform.OS === 'web') {
  // Firebase Auth Web
  const result = await signInWithPopup(auth, googleProvider);
} else {
  // Native Google Sign-In
  const userInfo = await GoogleSignin.signIn();
}
```

**Documentation** : `docs/README_GOOGLE_AUTH.md`

---

### **2. Scanner de Code-Barres**

**Écran** : `screens/BarcodeScannerScreen.js`

- Scan en temps réel avec caméra
- Intégration **Open Food Facts API**
- Affichage instantané des informations produit
- Ajout direct au frigo ou liste de courses

---

### **3. Smart Fridge (Frigo Intelligent)**

**Module** : `screens/fridge/`

#### Fonctionnalités :
- 📦 **Gestion d'inventaire** : Ajout manuel ou par scan
- ⚠️ **Alertes expiration** : Notifications produits périmés
- 🧠 **Suggestions recettes** : Basées sur les produits disponibles
- 📊 **Statistiques** : Tracking du gaspillage alimentaire
- 🧪 **Mode Test** : Données de démonstration (`TestModePanel.js`)

**Composants clés** :
- `FridgeScreen.js` - Interface principale
- `geolocationService.js` - Localisation magasins

---

### **4. Knorr Social (Communauté Gamifiée)**

**Module** : `screens/knorr/`

#### Système de Gamification :
- 🏆 **Points & XP** : Système de progression
- 🎖️ **Niveaux** : Débutant → Expert
- 🎯 **Challenges hebdomadaires** : Défis quotidiens
- 🛒 **Boutique virtuelle** : Échange de points contre récompenses

#### Composants :
- `KnorrFeedScreen.js` - Fil d'actualité social
- `KnorrShopScreen.js` - Boutique de récompenses
- `KnorrChallengesScreen.js` - Défis gamifiés
- `CreateKnorrPostScreen.js` - Création de contenu

**Exemple de données** (voir `my-node-backend/src/controllers/authController.js`) :
```javascript
{
  userId: "user_123",
  knorrPoints: 120,
  level: 3,
  xp: 450,
  challenges: [...]
}
```

---

### **5. Communauté & Partage**

**Écran** : `screens/CommunityScreen.js`

- 💬 **Publications** : Astuces, recettes, défis
- 👍 **Interactions** : Likes, commentaires, partages
- 📈 **Statistiques sociales** : Séries, engagement
- 🏅 **Système de récompenses** : XP pour chaque interaction

**Base de données Firestore** :
```javascript
// Structure d'un post
{
  userId: "user_123",
  userName: "John Doe",
  content: "Ma recette du jour...",
  type: "Astuce",
  likes: 42,
  likedBy: [...],
  comments: [...],
  createdAt: Timestamp
}
```

---

## 🎨 Design Pattern & Principes

### **1. Custom Hooks**

**Hook principal** : `hooks/useNavigation.js`

Encapsule toute la logique de navigation avec des méthodes typées :

```javascript
const navigation = useNavigation();

// Méthodes disponibles
navigation.goToHome();
navigation.goToProfile();
navigation.goToProductDetail(id, barcode);
navigation.goToKnorrShop();
// ... etc
```

### **2. Service Layer Pattern**

Séparation des préoccupations via des services réutilisables :

- `apiService.js` - Appels API centralisés
- `geolocationService.js` - Géolocalisation
- `googleAuthService.crossplatform.js` - Authentification

### **3. Context API**

**Context global** : `contexts/AuthContext.js`

Gestion de l'état utilisateur à travers toute l'app :

```javascript
const { user, loading, signIn, signOut } = useAuth();
```

### **4. Routes Centralisées**

**Fichier** : `navigation/routes.js`

```javascript
export const MAIN_ROUTES = {
  HOME: 'Home',
  PROFILE: 'Profile',
  PRODUCT_DETAIL: 'ProductDetail',
  // ...
};

export const KNORR_ROUTES = {
  FEED: 'KnorrFeed',
  SHOP: 'KnorrShop',
  CHALLENGES: 'KnorrChallenges',
};
```

**Avantages** :
- ✅ Pas d'erreurs de typage
- ✅ Refactoring facilité
- ✅ Autocomplétion IDE

---

## 🔐 Gestion de l'Authentification

### **Flow d'authentification**

```
LoginScreen
    ↓
Google Sign-In (Cross-platform)
    ↓
Firebase Authentication
    ↓
Création/Récupération profil Firestore
    ↓
Attribution points Knorr initiaux
    ↓
Navigation → HomeScreen
```

### **Profil utilisateur**

Structure stockée dans **Firestore** :

```javascript
{
  uid: "firebase_uid",
  email: "user@example.com",
  displayName: "John Doe",
  provider: "google",
  knorrPoints: 100,      // Points boutique
  knorrXP: 0,            // XP progression
  knorrLevel: 1,         // Niveau actuel
  createdAt: Timestamp,
  // Préférences
  allergies: ["gluten"],
  diet: "végétarien",
  location: {...}
}
```

---

## 🧪 Système de Test

### **Mode Démo Expo Go**

**Fichier** : `services/googleAuthService.demo.js`

Permet de tester l'app avec Expo Go sans configuration Google Auth complexe :

```javascript
// Simulation authentification
{
  uid: 'demo_user_1729012345',
  email: 'demo@foodapp.com',
  displayName: 'Utilisateur Démo',
  isDemo: true
}
```

### **Composants de test**

- `components/QuickGoogleTest.js` - Interface de test auth
- `screens/NavigationDemoScreen.js` - Test navigation
- `components/QuickAccessMenu.js` - Menu flottant debug

### **Mode Test Smart Fridge**

**Composant** : `screens/fridge/components/TestModePanel.js`

Génère des données de test pour le frigo sans scanner de produits :

- 📦 Frigo basique (5 items)
- 🛒 Frigo plein (10 items)
- ⚠️ Items qui expirent

---

## 📊 Backend API Node.js

**Dossier** : `my-node-backend/`

### **Stack**
- **Express.js** - Framework web
- **Prisma** - ORM pour PostgreSQL
- **JWT** - Authentification token-based
- **Multer** - Upload d'images

### **Routes principales**

**Auth** : `src/controllers/authController.js`
```javascript
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/profile
```

**Structure utilisateur** (Prisma schema) :
```prisma
model User {
  id          String   @id
  email       String   @unique
  password    String
  displayName String?
  allergies   String?  // JSON
  diet        String?
  location    String?  // JSON
  pushNotif   Boolean  @default(true)
  promoNotif  Boolean  @default(false)
  createdAt   DateTime @default(now())
}
```

---

## 📱 Animations & UX

### **Types de présentation**

Configurés dans `navigation/MainNavigator.js` :

- **Modal** : Profile, Search (slide up)
- **FullScreen** : BarcodeScanner (overlay complet)
- **Card** : ProductDetail, Comments (slide right)

### **Custom Tab Bar**

**Composant** : `components/CustomTabBar.js`

- Icônes animées
- Badge notifications
- Indicateur de tab active

---

## 🔍 Résolution de Problèmes

### **Documentation complète**

Le dossier `docs/` contient tous les guides de debug :

| Document | Contenu |
|----------|---------|
| `GOOGLE_AUTH_SETUP.md` | Config Firebase Console |
| `WEB_PLATFORM_SOLUTION.md` | Fix erreur web "not-implemented" |
| `CORRECTIONS_TURBOMODULE.md` | Fix Expo Go compatibility |
| `NAVIGATION_GUIDE.md` | Guide navigation complet |
| `LOGOUT_FIX_DEBUG.md` | Debug déconnexion |

### **Scripts de validation**

- `checkWebSupport.js` - Valide config web
- `validate-expo-go.js` - Valide compatibilité Expo Go
- `validateFinalSetup.js` - Validation setup complet

---

## 🚀 Déploiement & Configuration

### **Variables d'environnement**

**Root** : `.env`
```bash
FIREBASE_API_KEY=...
FIREBASE_AUTH_DOMAIN=...
FIREBASE_PROJECT_ID=...
```

**Backend** : `my-node-backend/.env`
```bash
DATABASE_URL=postgresql://...
JWT_SECRET=...
```

### **Configuration Expo**

**Fichiers** :
- `app.config.js` - Config dynamique
- `app.json` - Config statique

**Plugins activés** :
- `expo-camera` - Scan code-barres
- Google Services (Android)

### **Firebase Configuration**

**Fichier** : `firebaseConfig.js`

Services activés :
- ✅ Authentication (Google)
- ✅ Firestore Database
- ✅ Storage (images)

**Guide setup** : `FIREBASE_CONSOLE_GUIDE.js`

---

## 📦 Open Food Facts Integration

### **API Service**

L'app utilise l'API publique d'Open Food Facts pour récupérer les informations produits :

```javascript
// Appel API
const response = await fetch(
  `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`
);

// Données récupérées
{
  product_name: "Nutella",
  brands: "Ferrero",
  nutrition_grades: "e",
  image_url: "...",
  ingredients_text: "...",
  nutriments: {...}
}
```

---

## 🎯 Principes Fondamentaux

### **1. Cross-Platform First**

Tout le code est pensé pour fonctionner sur **web, iOS et Android** sans modification :

```javascript
// Détection automatique
Platform.OS === 'web' ? webImplementation() : mobileImplementation()
```

### **2. Offline First (prévu)**

- Stockage local avec AsyncStorage
- Synchronisation différée avec Firestore
- Mode dégradé sans connexion

### **3. Performance**

- **Lazy Loading** : Chargement des écrans à la demande
- **Memoization** : Optimisation re-renders avec `useMemo`
- **FlatList** : Listes virtualisées pour grandes données

### **4. Accessibilité**

- Labels accessibles pour lecteurs d'écran
- Contraste couleurs conforme WCAG
- Navigation clavier (web)

---

## 🔮 Évolutions Prévues

### **Phase 2**
- [ ] Google Vision API pour scan images
- [ ] Notifications push (allergies, expirations)
- [ ] Mode hors-ligne complet
- [ ] Partage social natif

### **Phase 3**
- [ ] Intelligence Artificielle : Suggestions recettes personnalisées
- [ ] Analyse nutritionnelle avancée
- [ ] Intégration partenaires magasins
- [ ] Programme de fidélité multi-enseignes

---

## 📚 Ressources & Liens

### **Documentation officielle**
- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [Expo SDK 52](https://docs.expo.dev/)
- [React Navigation v6](https://reactnavigation.org/docs/getting-started)
- [Firebase Docs](https://firebase.google.com/docs)

### **APIs utilisées**
- [Open Food Facts API](https://world.openfoodfacts.org/data)
- [Google Sign-In](https://developers.google.com/identity)

### **Guides internes**
- `docs/NAVIGATION_GUIDE.md` - Navigation complète
- `docs/README_GOOGLE_AUTH.md` - Setup authentification
- `docs/NAVIGATION_RESTRUCTURE_SUCCESS.md` - Architecture navigation

---

## 🏆 Points Forts Techniques

### **1. Architecture Modulaire**
- Code organisé par features
- Services réutilisables
- Composants découplés

### **2. Navigation Avancée**
- Stack imbriqués
- Animations personnalisées
- Deep linking ready

### **3. Authentification Robuste**
- Multi-plateforme (web + mobile)
- Gestion erreurs complète
- Mode démo pour tests

### **4. Gamification Complète**
- Système points/XP
- Challenges dynamiques
- Boutique virtuelle

### **5. Developer Experience**
- Hot reload avec Expo
- Logs détaillés
- Scripts de validation automatiques
- Documentation exhaustive

---

## 🎓 Concepts Clés à Retenir

### **Pour l'équipe Marketing**

1. **Cross-Platform = 1 codebase, 3 plateformes**
   - Une seule base de code pour web, iOS et Android
   - Économie de temps et coûts de développement

2. **Firebase = Backend prêt à l'emploi**
   - Pas besoin de gérer des serveurs
   - Scalabilité automatique
   - Coûts d'infrastructure réduits

3. **Gamification = Engagement utilisateur**
   - Système de points augmente la rétention
   - Challenges créent une habitude d'utilisation
   - Boutique virtuelle = monétisation potentielle

4. **Smart Fridge = Valeur ajoutée unique**
   - Réduction gaspillage alimentaire (argument RSE)
   - Suggestions recettes personnalisées
   - Tracking consommation (insights utilisateurs)

5. **Open Food Facts = Base de données ouverte**
   - 2+ millions de produits
   - Gratuit et collaboratif
   - Données nutritionnelles fiables

---

## 📞 Support Technique

### **Commandes utiles**

```bash
# Lancer l'app
npm start

# Web
npm start -- --web

# Vider cache
npx expo start --clear

# Build production
eas build --platform android
```

### **Debug**

```bash
# Logs détaillés
npx expo start --verbose

# Vérifier setup
node validateFinalSetup.js
```

---

**Version** : 1.0.0  
**Dernière mise à jour** : Octobre 2024  
**Équipe Développement** : FoodApp Team

---

*Cette documentation est destinée à la présentation au jury. Elle couvre les aspects techniques essentiels tout en restant accessible pour l'équipe marketing.*