export default {
  expo: {
    name: "food-app-mvp",
    slug: "food-app-mvp", 
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.foodapp.mvp"
      // googleServicesFile: "./GoogleService-Info.plist", // À ajouter quand vous l'aurez téléchargé
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      edgeToEdgeEnabled: true,
      package: "com.foodapp.mvp",
      googleServicesFile: "./google-services.json" // ✅ Réactivé car le fichier existe
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    plugins: [
      // "@react-native-google-signin/google-signin" // Désactivé temporairement pour Expo Go
    ],
    extra: {
      // Variables d'environnement pour l'auth Google
      googleWebClientId: process.env.GOOGLE_WEB_CLIENT_ID,
      googleAndroidClientId: process.env.GOOGLE_ANDROID_CLIENT_ID,
      googleIosClientId: process.env.GOOGLE_IOS_CLIENT_ID,
    }
  }
};
