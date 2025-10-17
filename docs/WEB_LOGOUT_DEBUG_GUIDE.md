# 🧪 GUIDE DE DEBUG - LOGOUT WEB

## PROBLÈME IDENTIFIÉ
- ✅ Le bouton "Se déconnecter" apparaît **EN DOUBLE** dans l'interface web
- ❌ La déconnexion ne fonctionne pas correctement sur web
- ❓ Le service `googleAuthService.signOutGoogle()` semble ne pas déclencher l'AuthListener

## AMÉLIORATIONS APPORTÉES

### 1. ✅ Service de déconnexion amélioré
- Ajout de logs détaillés
- Gestion du timing avec attente de mise à jour
- Nettoyage du cache localStorage Firebase
- Vérification en boucle de l'état utilisateur

### 2. ✅ ProfileScreen amélioré
- Logs détaillés dans `handleLogout()`
- Ajout d'un bouton de debug pour le web
- Gestion d'erreur avec fallback Firebase direct

### 3. ✅ Composant de debug WebLogoutDebugger
- Test Firebase signOut direct
- Test du service Google Auth
- Monitoring en temps réel de l'état auth
- Logs détaillés pour identifier le problème

## INSTRUCTIONS DE TEST

### 🌐 Mode Web
1. Démarrer l'app en mode web: `npx expo start --web`
2. Se connecter avec Google
3. Aller dans ProfileScreen
4. Cliquer sur "🧪 Debug Logout Web" (bouton orange)
5. Tester les différentes méthodes de déconnexion
6. Observer les logs dans la console du navigateur

### 📱 Vérifications à faire
- [ ] Vérifier si le problème de duplication existe dans d'autres navigateurs
- [ ] Tester avec cache vidé (Ctrl+F5)
- [ ] Vérifier les erreurs de console
- [ ] Tester la déconnexion sur mobile pour comparaison

## COMMANDES UTILES

```bash
# Démarrer en mode web avec cache vidé
npx expo start --web --clear

# Voir les logs détaillés
npx expo start --web --verbose

# Build pour identifier les problèmes
npx expo export --platform web
```

## DIAGNOSTIC EXPECTED

### ✅ Si ça marche
```
🔄 Début déconnexion - Platform: web  
👤 User avant déconnexion: user@example.com
🌐 Déconnexion Web via Firebase...
✅ Firebase signOut appelé
✅ Utilisateur bien déconnecté
🗑️ Suppression cache: firebase:host:xxx
👤 User après déconnexion: null
✅ Déconnexion complète réussie
```

### ❌ Si ça ne marche pas
```
🔄 Début déconnexion - Platform: web
👤 User avant déconnexion: user@example.com
🌐 Déconnexion Web via Firebase...
✅ Firebase signOut appelé
⏳ Tentative 1/10 - User encore connecté, attente...
⏳ Tentative 2/10 - User encore connecté, attente...
⚠️ Utilisateur encore connecté après toutes les tentatives
```

## SOLUTIONS POTENTIELLES

### 1. Problème de timing
- Firebase Auth Web met du temps à mettre à jour l'état
- Solution: Attendre plus longtemps ou forcer le refresh

### 2. Problème de cache
- Tokens Firebase restent en cache
- Solution: Nettoyer localStorage (déjà implémenté)

### 3. Problème d'AuthListener
- `onAuthStateChanged` ne se déclenche pas
- Solution: Vérifier la configuration Firebase

### 4. Problème de navigation
- AppNavigator ne reçoit pas la mise à jour
- Solution: Forcer le re-render du composant

## NEXT STEPS
1. 🧪 Tester avec le WebLogoutDebugger
2. 📋 Analyser les logs pour identifier le blocage
3. 🔧 Appliquer la solution spécifique au problème identifié
4. ✅ Valider que la déconnexion fonctionne
5. 🗑️ Supprimer les composants de debug
