#!/usr/bin/env node

/**
 * Script de vérification de la configuration Google Auth
 * Usage: node checkGoogleAuthConfig.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Vérification de la configuration Google Auth...\n');

// 1. Vérifier les packages
console.log('📦 Vérification des packages...');
const packageJsonPath = path.join(__dirname, 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const googleSigninInstalled = packageJson.dependencies?.['@react-native-google-signin/google-signin'];
  
  if (googleSigninInstalled) {
    console.log('✅ @react-native-google-signin/google-signin installé:', googleSigninInstalled);
  } else {
    console.log('❌ @react-native-google-signin/google-signin manquant');
    console.log('   Installez avec: npm install @react-native-google-signin/google-signin');
  }
} else {
  console.log('❌ package.json non trouvé');
}

// 2. Vérifier le service Google Auth
console.log('\n🔧 Vérification du service Google Auth...');
const googleAuthServicePath = path.join(__dirname, 'services', 'googleAuthService.js');
if (fs.existsSync(googleAuthServicePath)) {
  const serviceContent = fs.readFileSync(googleAuthServicePath, 'utf8');
  
  if (serviceContent.includes('VOTRE_WEB_CLIENT_ID')) {
    console.log('⚠️  Web Client ID non configuré dans googleAuthService.js');
    console.log('   Remplacez "VOTRE_WEB_CLIENT_ID" par votre vrai Client ID');
  } else {
    console.log('✅ Service Google Auth configuré');
  }
  
  // Vérifier l'import des dépendances
  if (serviceContent.includes('GoogleSignin')) {
    console.log('✅ Import GoogleSignin correct');
  } else {
    console.log('❌ Import GoogleSignin manquant');
  }
} else {
  console.log('❌ services/googleAuthService.js non trouvé');
}

// 3. Vérifier Firebase Config
console.log('\n🔥 Vérification de la configuration Firebase...');
const firebaseConfigPath = path.join(__dirname, 'firebaseConfig.js');
if (fs.existsSync(firebaseConfigPath)) {
  const firebaseContent = fs.readFileSync(firebaseConfigPath, 'utf8');
  
  if (firebaseContent.includes('922969943051')) {
    console.log('✅ Configuration Firebase trouvée');
  } else {
    console.log('⚠️  Configuration Firebase personnalisée détectée');
  }
} else {
  console.log('❌ firebaseConfig.js non trouvé');
}

// 4. Vérifier les écrans
console.log('\n📱 Vérification des écrans...');
const screens = [
  'screens/LoginScreen.js',
  'screens/RegisterScreen.js', 
  'screens/GoogleAuthTest.js'
];

screens.forEach(screen => {
  const screenPath = path.join(__dirname, screen);
  if (fs.existsSync(screenPath)) {
    console.log(`✅ ${screen} trouvé`);
  } else {
    console.log(`❌ ${screen} manquant`);
  }
});

// 5. Vérifier les composants
console.log('\n🧩 Vérification des composants...');
const componentPath = path.join(__dirname, 'components', 'GoogleSignInButton.js');
if (fs.existsSync(componentPath)) {
  console.log('✅ Composant GoogleSignInButton trouvé');
} else {
  console.log('❌ Composant GoogleSignInButton manquant');
}

// 6. Vérifier la configuration Expo
console.log('\n⚙️  Vérification de la configuration Expo...');
const appConfigPath = path.join(__dirname, 'app.config.js');
const appJsonPath = path.join(__dirname, 'app.json');

if (fs.existsSync(appConfigPath)) {
  console.log('✅ app.config.js trouvé');
} else if (fs.existsSync(appJsonPath)) {
  console.log('✅ app.json trouvé');
  console.log('ℹ️  Considérez migrer vers app.config.js pour plus de flexibilité');
} else {
  console.log('❌ Aucun fichier de config Expo trouvé');
}

console.log('\n🎯 Prochaines étapes:');
console.log('1. Allez sur Firebase Console > Authentication > Sign-in method');
console.log('2. Activez Google Sign-In');
console.log('3. Récupérez le Web Client ID');
console.log('4. Remplacez dans services/googleAuthService.js');
console.log('5. Testez avec le bouton "🧪 Tester Google Auth"');

console.log('\n✨ Configuration terminée ! Bon développement ! 🚀');
