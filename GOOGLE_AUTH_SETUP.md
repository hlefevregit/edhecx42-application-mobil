# Configuration Google Authentication pour Firebase

## 🔥 Étapes dans Firebase Console

### 1. Activer Google Sign-In
1. Allez sur [Firebase Console](https://console.firebase.google.com/)
2. Sélectionnez votre projet `foodapp-4e511`
3. Allez dans **Authentication** > **Sign-in method**
4. Cliquez sur **Google** et activez-le
5. Entrez un email de support (ex: votre email)
6. Cliquez **Enregistrer**

### 2. Récupérer le Web Client ID
1. Dans la même section Google, vous verrez le **Web client ID**
2. Copiez cette valeur (format: `XXXXX-YYYYY.apps.googleusercontent.com`)
3. Remplacez dans `services/googleAuthService.js` :
   ```js
   webClientId: 'VOTRE_WEB_CLIENT_ID_ICI'
   ```

### 3. Télécharger les fichiers de configuration (Optionnel pour dev)

#### Pour Android :
1. Allez dans **Paramètres du projet** (⚙️) > **Vos applications**
2. Cliquez sur votre app Android
3. Téléchargez `google-services.json`
4. Placez-le à la racine du projet

#### Pour iOS :
1. Allez dans **Paramètres du projet** (⚙️) > **Vos applications**  
2. Cliquez sur votre app iOS
3. Téléchargez `GoogleService-Info.plist`
4. Placez-le à la racine du projet

## 🧪 Test en développement

Pour tester en développement avec Expo Go :
1. Le **Web Client ID** suffit
2. L'authentification Google fonctionnera dans Expo Go
3. Pas besoin des fichiers de config pour le moment

## 🚀 Pour la production

Vous devrez :
1. Créer un build personnalisé (pas Expo Go)
2. Ajouter les fichiers `google-services.json` et `GoogleService-Info.plist`
3. Configurer les SHA-1/SHA-256 pour Android dans Firebase Console

## 🔑 Client IDs actuels à récupérer

Récupérez ces valeurs depuis Firebase Console :
- **Web Client ID** : `922969943051-XXXXXXX.apps.googleusercontent.com`
- **Android Client ID** : `922969943051-YYYYYYY.apps.googleusercontent.com` 
- **iOS Client ID** : `922969943051-ZZZZZZZ.apps.googleusercontent.com`

Remplacez dans `googleAuthService.js` une fois récupérés !

## 📋 Checklist Configuration

- [ ] ✅ Packages installés (`@react-native-google-signin/google-signin`)
- [ ] 🔥 Google Sign-In activé dans Firebase Console
- [ ] 🔑 Web Client ID récupéré et configuré dans `googleAuthService.js`
- [ ] 📱 App testée avec le bouton "🧪 Tester Google Auth"
- [ ] ✅ Connexion/déconnexion fonctionnelle
- [ ] 👤 Profil utilisateur créé automatiquement
- [ ] 🎮 Profil Knorr créé automatiquement

## 🚨 Dépannage fréquent

### Erreur "developer_error"
➜ Vérifiez que le Web Client ID est correct dans `googleAuthService.js`

### Erreur "sign_in_cancelled"
➜ Normal - l'utilisateur a annulé la connexion

### Erreur "play_services_not_available" 
➜ Testez sur un appareil Android avec Google Play Services

### L'authentification fonctionne mais pas de profil créé
➜ Vérifiez les règles Firestore et les permissions d'écriture
