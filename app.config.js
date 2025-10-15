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
      // Configuration Google Sign-In pour iOS
      googleServicesFile: "./GoogleService-Info.plist", // À ajouter plus tard
      bundleIdentifier: "com.foodapp.mvp"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      edgeToEdgeEnabled: true,
      // Configuration Google Sign-In pour Android
      googleServicesFile: "./google-services.json", // À ajouter plus tard
      package: "com.foodapp.mvp"
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    plugins: [
      "@react-native-google-signin/google-signin"
    ],
    extra: {
      // Variables d'environnement pour l'auth Google
      googleWebClientId: process.env.GOOGLE_WEB_CLIENT_ID,
      googleAndroidClientId: process.env.GOOGLE_ANDROID_CLIENT_ID,
      googleIosClientId: process.env.GOOGLE_IOS_CLIENT_ID,
    }
  }
};
