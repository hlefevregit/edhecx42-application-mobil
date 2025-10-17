// Service pour gérer les erreurs d'authentification Google
class GoogleAuthErrorHandler {
  
  // Traduire les codes d'erreur Google en messages français
  static getErrorMessage(error) {
    console.log('Google Auth Error:', error);
    
    switch (error.code) {
      case 'sign_in_cancelled':
        return 'Connexion annulée par l\'utilisateur';
      
      case 'sign_in_required':
        return 'Connexion requise';
      
      case 'play_services_not_available':
        return 'Google Play Services non disponible sur cet appareil';
      
      case 'play_services_not_installed':
        return 'Google Play Services n\'est pas installé';
      
      case 'play_services_outdated':
        return 'Google Play Services doit être mis à jour';
      
      case 'network_error':
        return 'Erreur réseau. Vérifiez votre connexion internet';
      
      case 'developer_error':
        return 'Erreur de configuration. Veuillez contacter le support';
      
      // Erreurs Firebase
      case 'auth/account-exists-with-different-credential':
        return 'Un compte existe déjà avec cette adresse email via un autre fournisseur';
      
      case 'auth/credential-already-in-use':
        return 'Ces identifiants sont déjà utilisés par un autre compte';
      
      case 'auth/operation-not-allowed':
        return 'L\'authentification Google n\'est pas activée';
      
      case 'auth/user-disabled':
        return 'Ce compte utilisateur a été désactivé';
      
      case 'auth/user-not-found':
        return 'Aucun compte trouvé avec ces identifiants';
      
      case 'auth/wrong-password':
        return 'Mot de passe incorrect';
      
      case 'auth/invalid-credential':
        return 'Les identifiants fournis sont invalides';
      
      case 'auth/network-request-failed':
        return 'Erreur réseau. Vérifiez votre connexion';
      
      case 'auth/too-many-requests':
        return 'Trop de tentatives. Réessayez plus tard';
      
      case 'auth/app-not-authorized':
        return 'Application non autorisée pour ce domaine';
      
      case 'auth/unauthorized-domain':
        return 'Domaine non autorisé dans Firebase Console. Ajoutez "localhost" dans Authentication > Settings > Authorized domains';
      
      // Erreur générique
      default:
        if (error.message) {
          return `Erreur: ${error.message}`;
        }
        return 'Une erreur inattendue s\'est produite';
    }
  }

  // Vérifier si l'erreur est récupérable
  static isRetryableError(error) {
    const retryableCodes = [
      'network_error',
      'auth/network-request-failed',
      'play_services_not_available'
    ];
    
    return retryableCodes.includes(error.code);
  }

  // Suggestions d'actions pour l'utilisateur
  static getSuggestion(error) {
    switch (error.code) {
      case 'play_services_not_available':
      case 'play_services_not_installed':
        return 'Installez ou mettez à jour Google Play Services';
      
      case 'play_services_outdated':
        return 'Mettez à jour Google Play Services dans le Play Store';
      
      case 'network_error':
      case 'auth/network-request-failed':
        return 'Vérifiez votre connexion internet et réessayez';
      
      case 'auth/too-many-requests':
        return 'Attendez quelques minutes avant de réessayer';
      
      case 'developer_error':
        return 'Contactez le support technique';
      
      case 'auth/unauthorized-domain':
        return 'Allez dans Firebase Console > Authentication > Settings > Authorized domains et ajoutez "localhost"';
      
      default:
        return 'Réessayez ou contactez le support si le problème persiste';
    }
  }

  // Log détaillé pour le debug
  static logError(error, context = '') {
    console.error('=== Google Auth Error ===');
    console.error('Context:', context);
    console.error('Code:', error.code);
    console.error('Message:', error.message);
    console.error('Full Error:', error);
    console.error('========================');
  }
}

export default GoogleAuthErrorHandler;
