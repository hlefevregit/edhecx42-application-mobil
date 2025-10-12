import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

/**
 * 🤖 SERVICE D'ALGORITHME IA KNORR
 * Recommandations personnalisées basées sur :
 * - Profil alimentaire (allergènes, régime)
 * - Historique likes/vues
 * - Affinités utilisateurs (collaborative filtering)
 * - Produits Knorr taguées
 * - Popularité des posts
 */

class KnorrAlgorithmService {
  constructor() {
    this.userProfile = null;
    this.userPreferences = null;
    this.followingList = [];
    this.cachedPosts = [];
  }

  // Charger le profil complet de l'utilisateur
  async loadUserProfile(userId) {
    try {
      // Profil utilisateur principal
      const userDoc = await getDoc(doc(db, 'users', userId));
      this.userProfile = userDoc.exists() ? userDoc.data() : null;

      // Profil Knorr (XP, badges, etc.)
      const knorrDoc = await getDoc(doc(db, 'knorr_user_profiles', userId));
      this.userPreferences = knorrDoc.exists() ? knorrDoc.data() : null;

      // Liste des utilisateurs suivis
      this.followingList = this.userPreferences?.following || [];

      return true;
    } catch (error) {
      console.error('Erreur chargement profil:', error);
      return false;
    }
  }

  // Charger tous les posts disponibles
  async loadAllPosts() {
    try {
      const postsQuery = query(
        collection(db, 'knorr_posts'),
        where('status', '==', 'active')
      );

      const snapshot = await getDocs(postsQuery);
      this.cachedPosts = [];

      snapshot.forEach(doc => {
        this.cachedPosts.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return this.cachedPosts;
    } catch (error) {
      console.error('Erreur chargement posts:', error);
      return [];
    }
  }

  // 🎯 ALGORITHME PRINCIPAL DE SCORING
  calculatePostScore(post, userId) {
    let score = 0;

    // 1️⃣ SCORE DE BASE (Popularité globale) - 30%
    const popularityScore = this.getPopularityScore(post);
    score += popularityScore * 0.3;

    // 2️⃣ SCORE PROFIL ALIMENTAIRE (Allergènes, régime) - 25%
    const profileScore = this.getProfileCompatibilityScore(post);
    score += profileScore * 0.25;

    // 3️⃣ SCORE AFFINITÉS UTILISATEUR (Goûts similaires) - 20%
    const affinityScore = this.getUserAffinityScore(post, userId);
    score += affinityScore * 0.2;

    // 4️⃣ SCORE SOCIAL (Following, interactions) - 15%
    const socialScore = this.getSocialScore(post, userId);
    score += socialScore * 0.15;

    // 5️⃣ SCORE FRAÎCHEUR (Nouveaux posts) - 10%
    const freshnessScore = this.getFreshnessScore(post);
    score += freshnessScore * 0.1;

    // BONUS : Post jamais vu
    if (!this.userPreferences?.contentPreferences?.viewedPosts?.includes(post.id)) {
      score += 10;
    }

    return Math.min(score, 100); // Cap à 100
  }

  // Score popularité (vues, likes, shares)
  getPopularityScore(post) {
    const views = post.views || 0;
    const likes = post.likes || 0;
    const shares = post.shares || 0;
    const comments = post.comments || 0;

    // Engagement rate
    const engagementRate = views > 0 ? ((likes + comments + shares) / views) * 100 : 0;

    // Score basé sur engagement + volume
    const volumeScore = Math.min((views / 1000) * 20, 40); // Max 40 si 1000+ vues
    const engagementScore = Math.min(engagementRate * 0.6, 60); // Max 60 si 100% engagement

    return volumeScore + engagementScore;
  }

  // Score compatibilité profil alimentaire
  getProfileCompatibilityScore(post) {
    if (!this.userProfile?.profile) return 50; // Neutre si pas de profil

    let score = 100;

    // Vérifier allergènes
    const userAllergies = this.userProfile.profile.allergies || [];
    const postAllergens = post.allergens || [];

    // Pénalité si allergène présent
    const hasAllergen = userAllergies.some(allergy => 
      postAllergens.some(allergen => 
        allergen.toLowerCase().includes(allergy.toLowerCase())
      )
    );

    if (hasAllergen) {
      score -= 80; // Grosse pénalité si allergène
    }

    // Vérifier régime alimentaire
    const userDiet = this.userProfile.profile.dietStyle || 'omnivore';
    const postDiet = post.dietType || 'omnivore';

    // Bonus si compatible avec le régime
    if (this.isDietCompatible(userDiet, postDiet)) {
      score += 20;
    } else {
      score -= 50;
    }

    return Math.max(score, 0);
  }

  // Vérifier compatibilité régime
  isDietCompatible(userDiet, postDiet) {
    const compatibility = {
      'vegan': ['vegan'],
      'végétarien': ['vegan', 'végétarien'],
      'flexitarien': ['vegan', 'végétarien', 'flexitarien'],
      'omnivore': ['vegan', 'végétarien', 'flexitarien', 'omnivore']
    };

    return compatibility[userDiet]?.includes(postDiet) || false;
  }

  // Score affinités utilisateur (collaborative filtering)
  getUserAffinityScore(post, userId) {
    if (!this.userPreferences?.contentPreferences) return 50;

    let score = 50;

    // Produits Knorr favoris
    const favoriteProducts = this.userPreferences.contentPreferences.favoriteKnorrProducts || [];
    const postProducts = post.knorrProducts?.map(p => p.productId) || [];

    const favoriteInPost = favoriteProducts.some(fav => postProducts.includes(fav));
    if (favoriteInPost) {
      score += 30; // Bonus si produit favori
    }

    // Posts likés dans le passé (similarité contenu)
    const likedPosts = this.userPreferences.contentPreferences.likedPosts || [];
    const likedPostsData = this.cachedPosts.filter(p => likedPosts.includes(p.id));

    // Calculer similarité (produits Knorr en commun)
    let similarity = 0;
    likedPostsData.forEach(likedPost => {
      const likedProducts = likedPost.knorrProducts?.map(p => p.productId) || [];
      const commonProducts = postProducts.filter(p => likedProducts.includes(p));
      similarity += commonProducts.length;
    });

    if (similarity > 0) {
      score += Math.min(similarity * 5, 30); // Max +30 si beaucoup de similarité
    }

    return Math.min(score, 100);
  }

  // Score social (following, cercle proche)
  getSocialScore(post, userId) {
    let score = 0;

    // Bonus si créateur suivi
    if (this.followingList.includes(post.userId)) {
      score += 50;
    }

    // Bonus si créateur a un niveau élevé (influence)
    const creatorLevel = post.userLevel || 1;
    score += Math.min(creatorLevel * 2, 30); // Max +30 si niveau 15+

    // Bonus si amis ont liké (cercle proche)
    const postLikes = post.likedBy || [];
    const friendsLiked = this.followingList.filter(friendId => postLikes.includes(friendId));

    if (friendsLiked.length > 0) {
      score += Math.min(friendsLiked.length * 10, 20); // Max +20 si plusieurs amis
    }

    return Math.min(score, 100);
  }

  // Score fraîcheur (nouveaux posts privilégiés)
  getFreshnessScore(post) {
    if (!post.createdAt) return 50;

    const now = new Date();
    const postDate = post.createdAt.toDate ? post.createdAt.toDate() : new Date(post.createdAt);
    const hoursSincePost = (now - postDate) / (1000 * 60 * 60);

    // Score décroissant avec le temps
    if (hoursSincePost < 6) return 100;        // < 6h : 100%
    if (hoursSincePost < 24) return 80;        // < 24h : 80%
    if (hoursSincePost < 72) return 60;        // < 3j : 60%
    if (hoursSincePost < 168) return 40;       // < 7j : 40%
    return 20;                                  // > 7j : 20%
  }

  // 🎯 GÉNÉRER LE FEED PERSONNALISÉ
  async generatePersonalizedFeed(userId, limit = 20) {
    // Charger profil + posts
    await this.loadUserProfile(userId);
    await this.loadAllPosts();

    // Calculer score pour chaque post
    const scoredPosts = this.cachedPosts.map(post => ({
      ...post,
      recommendationScore: this.calculatePostScore(post, userId)
    }));

    // Trier par score décroissant
    scoredPosts.sort((a, b) => b.recommendationScore - a.recommendationScore);

    // Diversifier : mélanger les 30 meilleurs pour éviter monotonie
    const topPosts = scoredPosts.slice(0, Math.min(30, scoredPosts.length));
    const shuffledTop = this.shuffleArray(topPosts);

    // Retourner les meilleurs
    return shuffledTop.slice(0, limit);
  }

  // Mélanger tableau (Fisher-Yates)
  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // 🎯 FEED "TENDANCES" (Posts viraux)
  async getTrendingFeed(limit = 20) {
    await this.loadAllPosts();

    // Trier par engagement récent (7 derniers jours)
    const now = new Date();
    const trendingPosts = this.cachedPosts
      .filter(post => {
        const postDate = post.createdAt?.toDate ? post.createdAt.toDate() : new Date(post.createdAt);
        const daysSince = (now - postDate) / (1000 * 60 * 60 * 24);
        return daysSince <= 7; // 7 derniers jours
      })
      .map(post => ({
        ...post,
        trendScore: this.getPopularityScore(post)
      }))
      .sort((a, b) => b.trendScore - a.trendScore);

    return trendingPosts.slice(0, limit);
  }

  // 🎯 FEED "SUIVIS" (Créateurs suivis uniquement)
  async getFollowingFeed(userId, limit = 20) {
    await this.loadUserProfile(userId);
    await this.loadAllPosts();

    const followingPosts = this.cachedPosts
      .filter(post => this.followingList.includes(post.userId))
      .sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
        return dateB - dateA; // Plus récent d'abord
      });

    return followingPosts.slice(0, limit);
  }

  // 🎯 POSTS SUGGÉRÉS SIMILAIRES (après avoir vu un post)
  async getSimilarPosts(postId, limit = 5) {
    await this.loadAllPosts();

    const currentPost = this.cachedPosts.find(p => p.id === postId);
    if (!currentPost) return [];

    const currentProducts = currentPost.knorrProducts?.map(p => p.productId) || [];

    // Calculer similarité avec les autres posts
    const similarPosts = this.cachedPosts
      .filter(post => post.id !== postId)
      .map(post => {
        const postProducts = post.knorrProducts?.map(p => p.productId) || [];
        const commonProducts = postProducts.filter(p => currentProducts.includes(p));
        
        return {
          ...post,
          similarityScore: commonProducts.length * 20 + this.getPopularityScore(post) * 0.5
        };
      })
      .sort((a, b) => b.similarityScore - a.similarityScore);

    return similarPosts.slice(0, limit);
  }
}

export default new KnorrAlgorithmService();