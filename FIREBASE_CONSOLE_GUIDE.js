/**
 * 🔥 GUIDE FIREBASE CONSOLE - OBTENIR LE WEB CLIENT ID
 * 
 * ⚠️ IMPORTANT: Suivez ces étapes exactement pour activer Google Auth
 */

/*
┌─────────────────────────────────────────────────────────────────┐
│  🚀 ÉTAPE 1: Aller sur Firebase Console                        │
└─────────────────────────────────────────────────────────────────┘

1. Ouvrez https://console.firebase.google.com/
2. Sélectionnez votre projet "foodapp-4e511"


┌─────────────────────────────────────────────────────────────────┐
│  🔐 ÉTAPE 2: Activer Google Authentication                     │
└─────────────────────────────────────────────────────────────────┘

1. Dans le menu de gauche, cliquez sur "Authentication"
2. Cliquez sur l'onglet "Sign-in method"
3. Dans la liste des fournisseurs, trouvez "Google"
4. Cliquez sur "Google" pour l'éditer
5. Basculez le switch sur "Activer"
6. Entrez un email de support (votre email)
7. Cliquez "Enregistrer"


┌─────────────────────────────────────────────────────────────────┐
│  🔑 ÉTAPE 3: Récupérer le Web Client ID                        │
└─────────────────────────────────────────────────────────────────┘

1. Toujours dans la config Google, vous verrez maintenant:
   
   📋 Web client ID: 922969943051-XXXXXXXXXXXXXXXXX.apps.googleusercontent.com
   📋 Web client secret: GOCSPX-XXXXXXXXXXXXXXXXXXXXX
   
2. COPIEZ le "Web client ID" (pas le secret !)
3. Il ressemble à: 922969943051-abc123def456.apps.googleusercontent.com


┌─────────────────────────────────────────────────────────────────┐
│  ⚙️ ÉTAPE 4: Configurer dans l'application                     │
└─────────────────────────────────────────────────────────────────┘

1. Ouvrez le fichier: services/googleAuthService.js
2. Trouvez cette ligne:
   
   webClientId: '922969943051-VOTRE_WEB_CLIENT_ID.apps.googleusercontent.com',
   
3. Remplacez "VOTRE_WEB_CLIENT_ID" par votre vrai Client ID
   
   Exemple:
   webClientId: '922969943051-abc123def456ghi789jkl.apps.googleusercontent.com',


┌─────────────────────────────────────────────────────────────────┐
│  🧪 ÉTAPE 5: Tester l'authentification                         │
└─────────────────────────────────────────────────────────────────┘

1. Lancez l'app: npm start
2. Ouvrez dans Expo Go
3. Sur l'écran de connexion, cliquez "🧪 Tester Google Auth"
4. Cliquez "Tester Google Sign-In"
5. Sélectionnez votre compte Google
6. Vérifiez que ça marche ! ✅


┌─────────────────────────────────────────────────────────────────┐
│  🔧 DÉPANNAGE COURANT                                          │
└─────────────────────────────────────────────────────────────────┘

❌ Erreur "developer_error"
   → Vérifiez que le Web Client ID est correct
   → Assurez-vous qu'il n'y a pas d'espaces avant/après

❌ Erreur "auth/operation-not-allowed"  
   → Google Sign-In pas activé dans Firebase Console
   → Retournez à l'étape 2

❌ "Configuration invalide"
   → Vérifiez que vous avez pris le WEB Client ID (pas Android/iOS)
   → Le format doit être: XXXXXXX-YYYYYYY.apps.googleusercontent.com

✅ "Connexion réussie"
   → Parfait ! Votre authentification Google fonctionne
   → Vous pouvez maintenant utiliser les boutons Google dans Login/Register


┌─────────────────────────────────────────────────────────────────┐
│  📝 NOTE IMPORTANTE                                            │
└─────────────────────────────────────────────────────────────────┘

Pour la PRODUCTION (pas Expo Go), vous devrez aussi:
- Configurer les Client IDs Android/iOS  
- Ajouter les SHA-1/SHA-256 fingerprints
- Télécharger google-services.json (Android) et GoogleService-Info.plist (iOS)

Mais pour le DÉVELOPPEMENT avec Expo Go, seul le Web Client ID suffit ! 🎉
*/
