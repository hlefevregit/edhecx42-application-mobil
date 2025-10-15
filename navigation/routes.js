/**
 * 🗺️ DÉFINITION DES ROUTES DE L'APP
 * Centralise tous les noms de routes pour éviter les erreurs de typage
 */

// Routes d'authentification
export const AUTH_ROUTES = {
  LOGIN: 'Login',
  REGISTER: 'Register',
  GOOGLE_AUTH_TEST: 'GoogleAuthTest',
};

// Routes principales (tabs)
export const TAB_ROUTES = {
  HOME: 'Home',
  STATS: 'Stats', 
  KNORR: 'Knorr',
};

// Routes standalone
export const MAIN_ROUTES = {
  PROFILE: 'Profile',
  BARCODE_SCANNER: 'BarcodeScanner',
  PRODUCT_DETAIL: 'ProductDetail',
  FRIDGE: 'Fridge',
  RECIPES: 'Recipes',
  SEARCH: 'Search',
  COMMENTS: 'Comments',
  KNORR_STACK: 'KnorrStack',
  GOOGLE_AUTH_TEST: 'GoogleAuthTest',
  NAVIGATION_DEMO: 'NavigationDemo',
};

// Routes Knorr (sous-navigation)
export const KNORR_ROUTES = {
  FEED: 'KnorrFeed',
  SHOP: 'KnorrShop', 
  CREATE_POST: 'CreateKnorrPost',
  PROFILE: 'KnorrProfile',
  CHALLENGES: 'KnorrChallenges',
};

// Navigation Helpers
export const ROUTE_PARAMS = {
  PRODUCT_DETAIL: {
    PRODUCT_ID: 'productId',
    BARCODE: 'barcode',
  },
  COMMENTS: {
    POST_ID: 'postId',
    POST_TYPE: 'postType',
  },
  KNORR_PROFILE: {
    USER_ID: 'userId',
  },
};

// Exemples d'utilisation:
// navigation.navigate(MAIN_ROUTES.PRODUCT_DETAIL, { 
//   [ROUTE_PARAMS.PRODUCT_DETAIL.PRODUCT_ID]: '123' 
// });
