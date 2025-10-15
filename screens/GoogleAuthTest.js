import React from 'react';
import QuickGoogleTest from '../components/QuickGoogleTest';

const GoogleAuthTest = () => {
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [useDemoMode, setUseDemoMode] = useState(true); // Démo par défaut

  const testGoogleSignIn = async () => {
    setLoading(true);
    try {
      const service = useDemoMode ? googleAuthServiceDemo : googleAuthService;
      const result = await service.signInWithGoogle();
      
      if (result.success) {
        const mode = result.isDemo ? ' (MODE DÉMO)' : '';
        Alert.alert('Succès ✅', `Connecté en tant que: ${result.user.email}${mode}`);
        setCurrentUser(result.user);
      } else {
        Alert.alert(
          'Erreur ❌', 
          `${result.error}\n\n💡 Suggestion: ${result.suggestion}`,
          [
            { text: 'OK' },
            result.isRetryable && { text: 'Réessayer', onPress: testGoogleSignIn }
          ].filter(Boolean)
        );
      }
    } catch (error) {
      Alert.alert('Erreur', 'Erreur inattendue lors du test');
    } finally {
      setLoading(false);
    }
  };

  const testSignOut = async () => {
    try {
      const service = useDemoMode ? googleAuthServiceDemo : googleAuthService;
      const result = await service.signOutGoogle();
      const mode = result.isDemo ? ' (MODE DÉMO)' : '';
      Alert.alert('Déconnecté ✅' + mode);
      setCurrentUser(null);
    } catch (error) {
      Alert.alert('Erreur', 'Erreur lors de la déconnexion');
    }
  };

  const checkSignInStatus = async () => {
    try {
      const service = useDemoMode ? googleAuthServiceDemo : googleAuthService;
      const isSignedIn = await service.isSignedIn();
      const user = await service.getCurrentUser();
      
      Alert.alert(
        'État de connexion',
        `Connecté: ${isSignedIn ? 'Oui' : 'Non'}\n${user ? `Utilisateur: ${user.user.email}` : ''}`
      );
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de vérifier l\'état');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🧪 Test Google Auth</Text>
      
      {/* Informations plateforme */}
      <PlatformInfo />
      
      {/* Mode Switch */}
      <View style={styles.modeContainer}>
        <Text style={styles.modeLabel}>Mode Démo (sans Firebase)</Text>
        <Switch
          value={useDemoMode}
          onValueChange={setUseDemoMode}
          trackColor={{ false: '#e63946', true: '#2ecc71' }}
          thumbColor={useDemoMode ? '#fff' : '#fff'}
        />
        <Text style={styles.modeStatus}>
          {useDemoMode ? '🧪 DÉMO' : '🔥 RÉEL'}
        </Text>
      </View>

      <Text style={styles.modeDescription}>
        {useDemoMode 
          ? '🧪 Mode démo: Simule la connexion Google sans configuration Firebase'
          : '🔥 Mode réel: Utilise la vraie API Google (nécessite configuration)'
        }
      </Text>
      
      {currentUser && (
        <View style={styles.userInfo}>
          <Text style={styles.userText}>✅ Connecté: {currentUser.email}</Text>
        </View>
      )}

      <GoogleSignInButton
        onPress={testGoogleSignIn}
        loading={loading}
        text={useDemoMode ? "🧪 Tester Mode Démo" : "🔥 Tester Google Réel"}
        style={styles.button}
      />

      <TouchableOpacity style={styles.secondaryButton} onPress={checkSignInStatus}>
        <Text style={styles.secondaryButtonText}>Vérifier état connexion</Text>
      </TouchableOpacity>

      {currentUser && (
        <TouchableOpacity style={styles.signOutButton} onPress={testSignOut}>
          <Text style={styles.signOutButtonText}>Se déconnecter</Text>
        </TouchableOpacity>
      )}

      <Text style={styles.info}>
        ⚠️ Pour que ça marche, il faut configurer le Web Client ID dans googleAuthService.js
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  modeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  modeLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 10,
  },
  modeStatus: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  modeDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    fontStyle: 'italic',
    paddingHorizontal: 20,
  },
  userInfo: {
    backgroundColor: '#d4edda',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  userText: {
    color: '#155724',
    fontSize: 16,
    textAlign: 'center',
  },
  button: {
    marginBottom: 15,
  },
  secondaryButton: {
    backgroundColor: '#6c757d',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  secondaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  signOutButton: {
    backgroundColor: '#dc3545',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  signOutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  info: {
    textAlign: 'center',
    fontSize: 14,
    color: '#666',
    marginTop: 20,
    fontStyle: 'italic',
  },
});

export default GoogleAuthTest;
