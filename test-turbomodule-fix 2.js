#!/usr/bin/env node

console.log('🔍 TEST FINAL - Validation TurboModule Expo Go\n');

const fs = require('fs');
const path = require('path');

let allTestsPassed = true;

// Test 1: Vérifier les imports conditionnels
console.log('📱 Test 1: Imports Conditionnels');
const serviceFiles = [
  'services/googleAuthService.js',
  'services/googleAuthService.crossplatform.js', 
  'services/googleAuthService.demo.js'
];

serviceFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('try {') && content.includes('require(\'@react-native-google-signin/google-signin\')')) {
      console.log(`  ✅ ${file} - Import conditionnel OK`);
    } else {
      console.log(`  ❌ ${file} - Import conditionnel manquant`);
      allTestsPassed = false;
    }
  } else {
    console.log(`  ⚠️  ${file} - Fichier non trouvé`);
  }
});

// Test 2: Vérifier la configuration app.config.js
console.log('\n⚙️  Test 2: Configuration Expo');
const configPath = path.join(__dirname, 'app.config.js');
if (fs.existsSync(configPath)) {
  const configContent = fs.readFileSync(configPath, 'utf8');
  if (configContent.includes('// "@react-native-google-signin/google-signin"')) {
    console.log('  ✅ Plugin Google Sign-In désactivé pour Expo Go');
  } else {
    console.log('  ❌ Plugin Google Sign-In toujours actif');
    allTestsPassed = false;
  }
} else {
  console.log('  ❌ app.config.js non trouvé');
  allTestsPassed = false;
}

// Test 3: Vérifier les composants UI
console.log('\n🧩 Test 3: Composants UI');
const uiComponents = [
  'components/ExpoGoWarning.js',
  'components/GoogleSignInButton.js',
  'components/QuickGoogleTest.js'
];

uiComponents.forEach(component => {
  const componentPath = path.join(__dirname, component);
  if (fs.existsSync(componentPath)) {
    console.log(`  ✅ ${component} existe`);
  } else {
    console.log(`  ❌ ${component} manquant`);
    allTestsPassed = false;
  }
});

// Test 4: Vérifier l'utilisation du bon service
console.log('\n🔄 Test 4: Utilisation des Services');
const screenFiles = [
  { file: 'screens/LoginScreen.js', service: 'googleAuthService.crossplatform' },
  { file: 'components/QuickGoogleTest.js', service: 'googleAuthService.crossplatform' }
];

screenFiles.forEach(({ file, service }) => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    if (content.includes(service)) {
      console.log(`  ✅ ${file} utilise ${service}`);
    } else {
      console.log(`  ❌ ${file} n'utilise pas ${service}`);
      allTestsPassed = false;
    }
  }
});

// Test 5: Vérifier la méthode signInDemo
console.log('\n🎯 Test 5: Mode Démo');
const crossPlatformPath = path.join(__dirname, 'services/googleAuthService.crossplatform.js');
if (fs.existsSync(crossPlatformPath)) {
  const content = fs.readFileSync(crossPlatformPath, 'utf8');
  if (content.includes('signInDemo()') && content.includes('isDemo: true')) {
    console.log('  ✅ Mode démo implémenté dans le service crossplatform');
  } else {
    console.log('  ❌ Mode démo manquant dans le service crossplatform');
    allTestsPassed = false;
  }
}

// Résumé final
console.log('\n' + '='.repeat(60));
if (allTestsPassed) {
  console.log('🎉 TOUS LES TESTS PASSÉS! ');
  console.log('✅ L\'application devrait fonctionner sans erreur TurboModule avec Expo Go');
  console.log('\n📱 Instructions de test:');
  console.log('  1. Scannez le QR code avec Expo Go');
  console.log('  2. L\'app se lance sans erreur');
  console.log('  3. Allez dans LoginScreen - Voyez l\'avertissement Expo Go');
  console.log('  4. Testez Google Sign-In - Mode démo fonctionne');
  console.log('  5. Naviguez vers KnorrProfile - Navigation OK');
} else {
  console.log('❌ CERTAINS TESTS ONT ÉCHOUÉ');
  console.log('   Vérifiez les erreurs ci-dessus avant de tester l\'app');
}

console.log('\n🚀 Pour une authentification Google réelle:');
console.log('   • Réactivez le plugin dans app.config.js');
console.log('   • Créez un Development Build avec: eas build');
console.log('   • Ou compilez localement avec: npx expo run:android');

console.log('\n📚 Documentation créée:');
console.log('   • CORRECTIONS_TURBOMODULE.md - Détail des corrections');
console.log('   • EXPO_GO_SOLUTION.md - Solution complète');

console.log('\n✨ Validation terminée!\n');
