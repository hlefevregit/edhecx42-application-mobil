#!/bin/bash

echo "🚀 === LANCEMENT TEST LOGOUT WEB ==="
echo ""

# Vérifier si on est dans le bon dossier
if [ ! -f "package.json" ]; then
    echo "❌ Erreur: package.json introuvable"
    echo "💡 Assurez-vous d'être dans le dossier FoodApp"
    exit 1
fi

echo "✅ Dossier correct détecté"
echo "📦 Vérification des dépendances..."

# Vérifier si node_modules existe
if [ ! -d "node_modules" ]; then
    echo "📥 Installation des dépendances..."
    npm install
fi

echo "🌐 Démarrage de l'application en mode web..."
echo ""
echo "🔍 INSTRUCTIONS:"
echo "1. Une fois l'app chargée, connectez-vous avec Google"
echo "2. Allez dans ProfileScreen (onglet Profil)"
echo "3. Cliquez sur '🧪 Debug Logout Web' (bouton orange)"
echo "4. Testez les différentes méthodes de déconnexion"
echo "5. Observez les logs dans la console du navigateur"
echo ""
echo "⚠️  PROBLÈMES À OBSERVER:"
echo "   - Duplication du bouton 'Se déconnecter'"
echo "   - Déconnexion qui ne fonctionne pas"
echo "   - Messages d'erreur dans la console"
echo ""

# Lancer l'application
npx expo start --web --clear
