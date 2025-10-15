import { useNavigation as useRNNavigation } from '@react-navigation/native';
import navigationService from '../navigation/navigationService';

/**
 * 🧭 HOOK NAVIGATION AMÉLIORÉ
 * Combine React Navigation et notre service global
 */
export const useNavigation = () => {
  const navigation = useRNNavigation();
  
  return {
    // Navigation React Native standard
    ...navigation,
    
    // Méthodes du service global
    goToProfile: navigationService.goToProfile.bind(navigationService),
    goToHome: navigationService.goToHome.bind(navigationService),
    goToProductDetail: navigationService.goToProductDetail.bind(navigationService),
    goToBarcodeScanner: navigationService.goToBarcodeScanner.bind(navigationService),
    goToFridge: navigationService.goToFridge.bind(navigationService),
    goToComments: navigationService.goToComments.bind(navigationService),
    goToSearch: navigationService.goToSearch.bind(navigationService),
    
    // Knorr
    goToKnorrShop: navigationService.goToKnorrShop.bind(navigationService),
    goToCreateKnorrPost: navigationService.goToCreateKnorrPost.bind(navigationService),
    goToKnorrProfile: navigationService.goToKnorrProfile.bind(navigationService),
    goToKnorrChallenges: navigationService.goToKnorrChallenges.bind(navigationService),
    
    // Auth
    goToLogin: navigationService.goToLogin.bind(navigationService),
    goToRegister: navigationService.goToRegister.bind(navigationService),
    
    // Demo & Testing
    goToNavigationDemo: navigationService.goToNavigationDemo.bind(navigationService),
    
    // Utils
    getCurrentRoute: navigationService.getCurrentRoute.bind(navigationService),
    getCurrentRouteName: navigationService.getCurrentRouteName.bind(navigationService),
  };
};
