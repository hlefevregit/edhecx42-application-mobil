# 🗺️ NAVIGATION GUIDE - Food App

## 📁 Structure de Navigation

L'app utilise une **navigation hiérarchique** organisée par feature :

```
navigation/
├── AppNavigator.js        # Point d'entrée principal
├── AuthNavigator.js       # Navigation authentification
├── MainNavigator.js       # Navigation app connectée
├── TabNavigator.js        # Tabs principales (Accueil, Stats, Knorr)
├── KnorrNavigator.js      # Sous-navigation Knorr Social
├── routes.js              # Définition centralisée des routes
└── navigationService.js   # Service global de navigation
```

## 🎯 Utilisation

### **1. Dans un composant React**

```javascript
import { useNavigation } from '../hooks/useNavigation';

const MyComponent = () => {
  const navigation = useNavigation();
  
  // Navigation simple
  const goToProfile = () => {
    navigation.goToProfile();
  };
  
  // Navigation avec paramètres
  const openProduct = (productId) => {
    navigation.goToProductDetail(productId, '8901030895566');
  };
  
  return (
    <TouchableOpacity onPress={goToProfile}>
      <Text>Mon Profil</Text>
    </TouchableOpacity>
  );
};
```

### **2. Depuis un service (hors React)**

```javascript
import navigationService from '../navigation/navigationService';

// Dans un service
class ProductService {
  async scanProduct(barcode) {
    const product = await this.fetchProduct(barcode);
    
    if (product) {
      // Navigation depuis un service
      navigationService.goToProductDetail(product.id, barcode);
    }
  }
}
```

### **3. Navigation Knorr (imbriquée)**

```javascript
// Aller à la boutique Knorr
navigation.goToKnorrShop();

// Créer un post Knorr
navigation.goToCreateKnorrPost();

// Voir profil Knorr d'un utilisateur
navigation.goToKnorrProfile('user123');
```

## 🛠️ Méthodes Disponibles

### **Navigation Générale**
- `navigation.goToHome()` - Accueil
- `navigation.goToProfile()` - Profil utilisateur
- `navigation.goToBarcodeScanner()` - Scanner
- `navigation.goToSearch(query?)` - Recherche
- `navigation.goBack()` - Retour

### **Produits**
- `navigation.goToProductDetail(id, barcode?)` - Détail produit
- `navigation.goToComments(postId, type?)` - Commentaires

### **Knorr Social**
- `navigation.goToKnorrShop()` - Boutique
- `navigation.goToCreateKnorrPost()` - Nouveau post
- `navigation.goToKnorrProfile(userId?)` - Profil Knorr
- `navigation.goToKnorrChallenges()` - Défis

### **Authentification**
- `navigation.goToLogin()` - Connexion
- `navigation.goToRegister()` - Inscription

## 🎨 Types d'Animation

### **Présentation Modal**
```javascript
// Dans la config de route
options={{
  presentation: 'modal', // Slide up from bottom
}}
```

### **Écran Plein**
```javascript
options={{
  presentation: 'fullScreenModal', // Full screen overlay
}}
```

### **Card Standard**
```javascript
options={{
  presentation: 'card', // Slide from right (default)
}}
```

## 📱 Exemples Pratiques

### **Scanner un produit**
```javascript
// Depuis le HomeScreen
<TouchableOpacity onPress={navigation.goToBarcodeScanner}>
  <Ionicons name="scan" />
  <Text>Scanner</Text>
</TouchableOpacity>
```

### **Aller à Knorr depuis une recette**
```javascript
// Dans RecipeDetail
const shareToKnorr = () => {
  navigation.goToCreateKnorrPost();
  // Le post sera pré-rempli avec la recette
};
```

### **Navigation conditionnelle**
```javascript
// Vérifier l'authentification
const handleAction = () => {
  if (user) {
    navigation.goToKnorrShop();
  } else {
    navigation.goToLogin();
  }
};
```

## 🔧 Configuration

### **Ajouter une nouvelle route**

1. **Définir dans `routes.js`**
```javascript
export const MAIN_ROUTES = {
  // ...existing routes
  NEW_FEATURE: 'NewFeature',
};
```

2. **Ajouter dans le navigator**
```javascript
// Dans MainNavigator.js
<Stack.Screen 
  name="NewFeature" 
  component={NewFeatureScreen}
  options={{
    title: 'Nouvelle Feature',
    presentation: 'modal',
  }}
/>
```

3. **Créer la méthode helper**
```javascript
// Dans navigationService.js
goToNewFeature(param) {
  this.navigate(MAIN_ROUTES.NEW_FEATURE, { param });
}
```

## ✅ Avantages de cette structure

- **🎯 Centralisé** - Toutes les routes en un endroit
- **🔧 Type-safe** - Pas d'erreurs de typage de routes
- **🧩 Modulaire** - Navigation par feature
- **🌐 Global** - Utilisable depuis partout
- **🎨 Consistant** - Animations et styles uniformes
- **🔍 Debuggable** - Facile à tracer et débugger

## 🚀 Prochaines étapes

1. **Deep Linking** - URLs personnalisées
2. **State Persistence** - Sauvegarder la navigation
3. **Analytics** - Tracker les écrans visités
4. **Gestures** - Navigation par gestes
