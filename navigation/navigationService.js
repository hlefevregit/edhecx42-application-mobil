import { createNavigationContainerRef } from '@react-navigation/native';
import { MAIN_ROUTES, TAB_ROUTES, KNORR_ROUTES, AUTH_ROUTES } from './routes';

/**
 * 🧭 SERVICE DE NAVIGATION GLOBAL
 * Permet de naviguer depuis n'importe où dans l'app (services, utils, etc.)
 */

export const navigationRef = createNavigationContainerRef();

class NavigationService {
  
  // Navigation de base
  navigate(name, params) {
    if (navigationRef.isReady()) {
      navigationRef.navigate(name, params);
    }
  }
  
  goBack() {
    if (navigationRef.isReady() && navigationRef.canGoBack()) {
      navigationRef.goBack();
    }
  }
  
  reset(routeName) {
    if (navigationRef.isReady()) {
      navigationRef.reset({
        index: 0,
        routes: [{ name: routeName }],
      });
    }
  }

  // Navigations spécialisées
  goToProfile() {
    this.navigate(MAIN_ROUTES.PROFILE);
  }
  
  goToHome() {
    this.navigate(TAB_ROUTES.HOME);
  }
  
  goToProductDetail(productId, barcode = null) {
    this.navigate(MAIN_ROUTES.PRODUCT_DETAIL, {
      productId,
      barcode,
    });
  }
  
  goToBarcodeScanner() {
    this.navigate(MAIN_ROUTES.BARCODE_SCANNER);
  }
  
  goToFridge() {
    this.navigate(MAIN_ROUTES.FRIDGE);
  }
  
  goToComments(postId, postType = 'recipe') {
    this.navigate(MAIN_ROUTES.COMMENTS, {
      postId,
      postType,
    });
  }
  
  goToSearch(query = '') {
    this.navigate(MAIN_ROUTES.SEARCH, { query });
  }
  
  // Navigation Knorr
  goToKnorrShop() {
    this.navigate(MAIN_ROUTES.KNORR_STACK, {
      screen: KNORR_ROUTES.SHOP,
    });
  }
  
  goToCreateKnorrPost() {
    this.navigate(MAIN_ROUTES.KNORR_STACK, {
      screen: KNORR_ROUTES.CREATE_POST,
    });
  }
  
  goToKnorrProfile(userId = null) {
    this.navigate(MAIN_ROUTES.KNORR_STACK, {
      screen: KNORR_ROUTES.PROFILE,
      params: { userId },
    });
  }
  
  goToKnorrChallenges() {
    this.navigate(MAIN_ROUTES.KNORR_STACK, {
      screen: KNORR_ROUTES.CHALLENGES,
    });
  }
  
  // Navigation Auth
  goToLogin() {
    this.navigate(AUTH_ROUTES.LOGIN);
  }
  
  goToRegister() {
    this.navigate(AUTH_ROUTES.REGISTER);
  }
  
  // Demo & Testing
  goToNavigationDemo() {
    this.navigate(MAIN_ROUTES.NAVIGATION_DEMO);
  }
  
  // Utils
  getCurrentRoute() {
    if (navigationRef.isReady()) {
      return navigationRef.getCurrentRoute();
    }
    return null;
  }
  
  getCurrentRouteName() {
    const route = this.getCurrentRoute();
    return route?.name || null;
  }
}

// Instance singleton
const navigationService = new NavigationService();
export default navigationService;

// Exemple d'utilisation dans un service:
// import navigationService from '../navigation/navigationService';
// navigationService.goToProductDetail('123', '8901030895566');
