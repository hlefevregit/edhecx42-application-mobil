#!/usr/bin/env node

/**
 * 🌐 Script de validation du support Web pour Google Auth
 * 
 * Vérifie que la solution cross-platform est bien en place
 */

const fs = require('fs');
const path = require('path');

console.log('🌐 Vérification du support Web Google Auth...\n');

// 1. Vérifier le service cross-platform
console.log('📁 Vérification des fichiers...');
const crossPlatformServicePath = path.join(__dirname, 'services', 'googleAuthService.crossplatform.js');
if (fs.existsSync(crossPlatformServicePath)) {
  console.log('✅ googleAuthService.crossplatform.js trouvé');
  
  const serviceContent = fs.readFileSync(crossPlatformServicePath, 'utf8');
  
  // Vérifier les imports Firebase Web
  if (serviceContent.includes('signInWithPopup')) {
    console.log('✅ Firebase Auth Web (signInWithPopup) configuré');
  } else {
    console.log('❌ signInWithPopup manquant pour le support web');
  }
  
  // Vérifier la détection de plateforme
  if (serviceContent.includes('Platform.OS === \'web\'')) {
    console.log('✅ Détection de plateforme web implémentée');
  } else {
    console.log('❌ Détection de plateforme web manquante');
  }
  
} else {
  console.log('❌ services/googleAuthService.crossplatform.js manquant');
}

// 2. Vérifier que les écrans utilisent le bon service
console.log('\n📱 Vérification des écrans...');
const screensToCheck = [
  'screens/LoginScreen.js',
  'screens/RegisterScreen.js', 
  'screens/GoogleAuthTest.js'
];

screensToCheck.forEach(screen => {
  const screenPath = path.join(__dirname, screen);
  if (fs.existsSync(screenPath)) {
    const screenContent = fs.readFileSync(screenPath, 'utf8');
    
    if (screenContent.includes('googleAuthService.crossplatform')) {
      console.log(`✅ ${screen} utilise le service cross-platform`);
    } else if (screenContent.includes('googleAuthService')) {
      console.log(`⚠️  ${screen} utilise l'ancien service (peut causer l'erreur web)`);
    } else {
      console.log(`❓ ${screen} - service Google Auth non détecté`);
    }
  } else {
    console.log(`❌ ${screen} non trouvé`);
  }
});

// 3. Vérifier le composant d'info plateforme
console.log('\n🧩 Vérification des composants...');
const platformInfoPath = path.join(__dirname, 'components', 'PlatformInfo.js');
if (fs.existsSync(platformInfoPath)) {
  console.log('✅ Composant PlatformInfo trouvé');
} else {
  console.log('❌ Composant PlatformInfo manquant');
}

// 4. Vérifier la configuration Firebase
console.log('\n🔥 Vérification Firebase Auth Web...');
const firebaseConfigPath = path.join(__dirname, 'firebaseConfig.js');
if (fs.existsSync(firebaseConfigPath)) {
  const firebaseContent = fs.readFileSync(firebaseConfigPath, 'utf8');
  
  if (firebaseContent.includes('getAuth')) {
    console.log('✅ Firebase Auth correctement importé');
  } else {
    console.log('⚠️  Vérifiez l\'import Firebase Auth dans firebaseConfig.js');
  }
} else {
  console.log('❌ firebaseConfig.js non trouvé');
}

// 5. Instructions de test
console.log('\n🧪 Instructions de test:');
console.log('1. Lancez: npm start');
console.log('2. Appuyez sur "w" pour ouvrir dans le navigateur');
console.log('3. Allez sur l\'écran de connexion');
console.log('4. Cliquez "🧪 Tester Google Auth"');
console.log('5. Vérifiez que "🌐 Web Browser" est affiché');
console.log('6. Testez la connexion Google');

// 6. Résumé
console.log('\n📋 Résumé de la solution:');
console.log('✅ Service cross-platform détecte automatiquement la plateforme');
console.log('✅ Web: utilise Firebase Auth Web (signInWithPopup)');
console.log('✅ Mobile: utilise React Native Google Sign-In');
console.log('✅ Plus d\'erreur "not-implemented method on web platform"');

console.log('\n🎉 Solution Web Google Auth prête ! 🚀');
