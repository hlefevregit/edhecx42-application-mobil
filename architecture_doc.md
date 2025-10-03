# Architecture Technique - FoodApp MVP

## 📐 Vue d'ensemble

### Schéma d'architecture

```
┌─────────────────────────────────────────────────┐
│            React Native + Expo                  │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │  Auth    │  │  Screens │  │Navigation│     │
│  │  Layer   │  │  (9)     │  │  (Tabs)  │     │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘     │
│       │             │              │           │
│  ┌────▼─────────────▼──────────────▼─────┐    │
│  │      Services & API Calls             │    │
│  └────┬──────────────┬──────────────┬────┘    │
│       │              │              │          │
└───────┼──────────────┼──────────────┼──────────┘
        │              │              │
   ┌────▼────┐    ┌───▼────┐    ┌───▼────┐
   │Firebase │    │ Open   │    │ Expo   │
   │Auth/DB  │    │ Food   │    │Sensors │
   └─────────┘    │ Facts  │    └────────┘
                  └────────┘
```

## 🏗️ Structure du code

### Organisation des fichiers

```
food-app-mvp/
│
├── App.js                      # Point d'entrée, navigation principale
├── firebaseConfig.js           # Configuration Firebase
├── app.json                    # Config Expo
├── package.json                # Dépendances
│
├── screens/                    # Écrans de l'application
│   ├── Auth/
│   │   ├── LoginScreen.js      # Connexion
│   │   └── RegisterScreen.js   # Inscription + profil
│   │
│   ├── Main/
│   │   ├── HomeScreen.js       # Accueil + liste courses
│   │   ├── StatsScreen.js      # Statistiques + accès frigo
│   │   └── CommunityScreen.js  # Forum communautaire
│   │
│   ├── Secondary/
│   │   ├── ProfileScreen.js    # Profil utilisateur
│   │   ├── FridgeScreen.js     # Gestion frigo
│   │   ├── BarcodeScannerScreen.js  # Scanner
│   │   └── ProductDetailScreen.js   # Détails produit
│   │
│   └── [V2]/
│       ├── RecipeScreen.js     # Recettes (V2)
│       └── ShopScreen.js       # Achats en ligne (V2)
│
├── components/                 # Composants réutilisables (V2)
│   ├── common/
│   │   ├── Button.js
│   │   ├── Input.js
│   │   └── Card.js
│   │
│   └── specialized/
│       ├── ProductCard.js
│       ├── PostCard.js
│       └── StatChart.js
│
├── services/                   # Logique métier (V2)
│   ├── authService.js
│   ├── firestoreService.js
│   ├── productService.js
│   └── geolocationService.js
│
├── utils/                      # Utilitaires (V2)
│   ├── formatters.js
│   ├── validators.js
│   └── constants.js
│
├── hooks/                      # Custom hooks (V2)
│   ├── useAuth.js
│   ├── useOrientation.js
│   └── useLocation.js
│
└── assets/                     # Images, fonts
    ├── icon.png
    ├── splash.png
    └── adaptive-icon.png
```

## 🔄 Flux de données

### 1. Authentification

```
User Input (Email/Password)
    ↓
Firebase Authentication
    ↓
Create/Get User Document (Firestore)
    ↓
onAuthStateChanged listener
    ↓
Update App State
    ↓
Navigate to Main App / Login Screen
```

### 2. Scan de produit

```
Device Orientation Change
    ↓
DeviceMotion Sensor (beta < 0.3)
    ↓
Activate Camera Scanner
    ↓
Scan Barcode (BarCodeScanner)
    ↓
Call Open Food Facts API
    ↓
Parse Response
    ↓
Navigate to ProductDetail Screen
    ↓
User Action: Add to List / Fridge
    ↓
Update Firestore Document
```

### 3. Gestion liste de courses

```
User Action (Add/Delete/Check)
    ↓
Update Local State
    ↓
Save to Firestore (shopping_lists/{userId})
    ↓
Real-time Listener Updates UI
```

## 🗄️ Schéma Base de Données

### Collections Firestore

#### 1. users
```javascript
{
  userId: "abc123",
  email: "user@example.com",
  displayName: "Jean Dupont",
  createdAt: Timestamp,
  profile: {
    allergies: ["gluten", "lactose"],
    preferences: ["bio", "local"],
    dietStyle: "végétarien",
    productsToAvoid: ["huile_palme"],
    budget: 300,
    gdprConsent: {
      geolocation: true,
      dataProcessing: true,
      consentDate: Timestamp
    }
  }
}
```

#### 2. shopping_lists
```javascript
{
  listId: "abc123" (= userId),
  userId: "abc123",
  items: [
    {
      id: "item1",
      name: "Lait",
      quantity: 2,
      checked: false,
      addedAt: Timestamp,
      barcode: "3017620422003" (optional)
    }
  ],
  updatedAt: Timestamp
}
```

#### 3. fridge_items
```javascript
{
  fridgeId: "abc123" (= userId),
  items: [
    {
      id: "item1",
      name: "Yaourt",
      barcode: "3017620422003",
      quantity: 6,
      expiryDate: Timestamp (optional),
      addedAt: Timestamp,
      imageUrl: "https://..." (optional)
    }
  ]
}
```

#### 4. products (cache)
```javascript
{
  barcode: "3017620422003",
  name: "Nutella",
  brand: "Ferrero",
  ingredients: "sucre, huile...",
  allergens: ["en:nuts", "en:milk"],
  nutritionScore: "e",
  imageUrl: "https://...",
  categories: "pâtes à tartiner",
  quantity: "400g",
  lastUpdated: Timestamp,
  source: "open_food_facts"
}
```

#### 5. posts
```javascript
{
  postId: "post123",
  userId: "abc123",
  userName: "Jean Dupont",
  content: "Super astuce pour...",
  type: "astuce|recette|avis",
  productsUsed: ["Nutella", "Pain"],
  likes: 15,
  createdAt: Timestamp,
  imageUrl: "https://..." (optional)
}
```

#### 6. stats
```javascript
{
  statsId: "abc123" (= userId),
  shopVisits: [
    {
      date: Timestamp,
      storeName: "Carrefour",
      duration: 45, // minutes
      location: GeoPoint
    }
  ],
  savings: {
    monthly: 45.50,
    total: 180.20
  },
  routines: {
    avgShoppingTime: 40,
    mostBoughtCategories: ["Fruits et légumes", "Produits laitiers"]
  }
}
```

## 🔌 Intégrations API

### 1. Open Food Facts

**Endpoint** : `https://world.openfoodfacts.org/api/v0/product/{barcode}.json`

**Utilisation** :
```javascript
const response = await axios.get(
  `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`
);

if (response.data.status === 1) {
  const product = response.data.product;
  // Utiliser les données
}
```

**Données extraites** :
- `product_name` : Nom du produit
- `brands` : Marques
- `ingredients_text` : Liste ingrédients
- `allergens_tags` : Allergènes
- `nutrition_grades` : Nutri-Score (a-e)
- `image_url` : Image produit
- `categories` : Catégories
- `quantity` : Quantité

**Limites** :
- Gratuit et open-source
- Pas de limite de requêtes
- Base collaborative (données parfois incomplètes)

### 2. Firebase Services

**Authentication** :
```javascript
import { auth } from './firebaseConfig';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut 
} from 'firebase/auth';
```

**Firestore** :
```javascript
import { db } from './firebaseConfig';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  collection,
  query,
  where,
  orderBy 
} from 'firebase/firestore';
```

## 📱 Gestion des capteurs

### DeviceMotion (Orientation)

```javascript
import { DeviceMotion } from 'expo-sensors';

DeviceMotion.addListener(({ rotation }) => {
  const beta = rotation.beta; // Inclinaison avant/arrière
  const isFlat = Math.abs(beta) < 0.3; // Téléphone à plat
  
  if (isFlat) {
    // Activer le scanner
  }
});

DeviceMotion.setUpdateInterval(500); // 500ms
```

**Valeurs de rotation** :
- `beta` : Inclinaison avant/arrière (-π à π)
- `gamma` : Inclinaison gauche/droite (-π/2 à π/2)
- `alpha` : Rotation autour de l'axe Z (0 à 2π)

### Location (Géolocalisation - V2)

```javascript
import * as Location from 'expo-location';

// Demander permission
const { status } = await Location.requestForegroundPermissionsAsync();

// Observer position
Location.watchPositionAsync(
  {
    accuracy: Location.Accuracy.High,
    timeInterval: 10000, // 10s
    distanceInterval: 10 // 10m
  },
  (location) => {
    // Vérifier si dans un magasin (geofencing)
    checkIfInStore(location.coords);
  }
);
```

## 🎨 Système de design

### Palette de couleurs

```javascript
const colors = {
  primary: '#2ecc71',      // Vert principal
  primaryDark: '#27ae60',  // Vert foncé
  primaryLight: '#a8e6cf', // Vert clair
  
  secondary: '#3498db',    // Bleu
  secondaryDark: '#2980b9',
  
  warning: '#f39c12',      // Orange
  danger: '#e74c3c',       // Rouge
  success: '#2ecc71',      // Vert
  purple: '#9b59b6',       // Violet
  
  gray: {
    100: '#f5f5f5',
    200: '#eee',
    300: '#ddd',
    400: '#999',
    500: '#666',
    600: '#333'
  },
  
  text: {
    primary: '#333',
    secondary: '#666',
    disabled: '#999'
  },
  
  background: {
    default: '#fff',
    gray: '#f5f5f5'
  }
};
```

### Typographie

```javascript
const typography = {
  h1: {
    fontSize: 32,
    fontWeight: 'bold'
  },
  h2: {
    fontSize: 24,
    fontWeight: 'bold'
  },
  h3: {
    fontSize: 20,
    fontWeight: '600'
  },
  body: {
    fontSize: 16,
    lineHeight: 24
  },
  caption: {
    fontSize: 14,
    color: '#666'
  }
};
```

### Espacements

```javascript
const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 30
};
```

## 🔒 Sécurité

### Règles Firestore

Voir section "Règles Firestore" dans README.md

### Bonnes pratiques

1. **Ne jamais exposer les clés API côté client**
   - Utiliser Firebase Functions pour appels sensibles
   - Variables d'environnement pour production

2. **Valider toutes les entrées utilisateur**
   ```javascript
   if (!email || !email.includes('@')) {
     throw new Error('Email invalide');
   }
   ```

3. **Limiter les requêtes Firestore**
   ```javascript
   const q = query(
     collection(db, 'posts'),
     orderBy('createdAt', 'desc'),
     limit(20) // Pagination
   );
   ```

4. **Gérer les erreurs**
   ```javascript
   try {
     await action();
   } catch (error) {
     console.error('Erreur:', error);
     Alert.alert('Erreur', error.message);
   }
   ```

## 📊 Performance

### Optimisations implémentées

1. **Lazy loading** des écrans (React Navigation)
2. **Mise en cache** des données produits (Firestore)
3. **Listeners réactifs** (onSnapshot) limités aux données essentielles
4. **Images optimisées** (compression, lazy loading)

### Optimisations V2

1. **Pagination** des listes longues
2. **Debounce** des recherches
3. **Memoization** avec `useMemo` / `useCallback`
4. **Code splitting** avec `React.lazy`
5. **Service Worker** pour PWA (web)

## 🧪 Tests

### Plan de tests MVP

#### Tests unitaires (à implémenter)
- Validation formulaires
- Formatage données
- Calculs statistiques

#### Tests d'intégration
- Flux d'authentification complet
- CRUD liste de courses
- Scan et ajout produit

#### Tests E2E
- Parcours utilisateur complet
- Vérification RGPD
- Tests multi-devices

### Outils recommandés

- **Jest** : Tests unitaires
- **React Native Testing Library** : Tests composants
- **Detox** : Tests E2E
- **Firebase Emulator** : Tests backend local

## 📈 Monitoring & Analytics

### Firebase Analytics (V2)

```javascript
import analytics from '@react-native-firebase/analytics';

// Track événements
await analytics().logEvent('product_scanned', {
  barcode: '3017620422003',
  product_name: 'Nutella'
});

// Track écrans
await analytics().logScreenView({
  screen_name: 'HomeScreen',
  screen_class: 'HomeScreen'
});
```

### Métriques à suivre

- **Engagement** : DAU, MAU, sessions
- **Rétention** : J+1, J+7, J+30
- **Fonctionnalités** : Scans, posts créés, listes actives
- **Performance** : Temps de chargement, erreurs
- **RGPD** : Consentements, exports, suppressions

## 🚀 Déploiement

### CI/CD avec GitHub Actions (V2)

```yaml
name: Build and Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm test
      
  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: expo/expo-github-action@v7
      - run: eas build --platform all
```

### Versioning

Format : `MAJOR.MINOR.PATCH`

- **MAJOR** : Changements incompatibles
- **MINOR** : Nouvelles fonctionnalités
- **PATCH** : Corrections bugs

Exemple : `1.0.0` (MVP) → `1.1.0` (V2 Sprint 1) → `2.0.0` (V2 complète)

---

**Document maintenu à jour - Dernière modification : Octobre 2025**