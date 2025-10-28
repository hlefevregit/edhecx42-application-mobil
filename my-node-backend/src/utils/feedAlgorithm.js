const DEFAULT_WEIGHTS = {
  dietMatch: 0.40,              // Augmenté car maintenant on a l'info directe
  allergyCompatibility: 0.35,   // Augmenté car critique
  recency: 0.10,
  engagement: 0.10,
  diversity: 0.05
};

function calculatePostScore(post, userPreferences, weights = DEFAULT_WEIGHTS) {
  let score = 0;

  const dietScore = calculateDietMatch(post, userPreferences.diet);
  score += dietScore * weights.dietMatch;

  const allergyScore = calculateAllergyCompatibility(post, userPreferences.allergies);
  score += allergyScore * weights.allergyCompatibility;

  const recencyScore = calculateRecencyScore(post.createdAt);
  score += recencyScore * weights.recency;

  const engagementScore = calculateEngagementScore(post);
  score += engagementScore * weights.engagement;

  const diversityScore = calculateDiversityScore(post, userPreferences.seenCategories);
  score += diversityScore * weights.diversity;

  return score;
}

function calculateDietMatch(post, userDiet) {
  if (!userDiet || userDiet === 'None') return 0.5;

  // Maintenant on a le champ direct !
  if (post.dietType && post.dietType.toLowerCase() === userDiet.toLowerCase()) {
    return 1.0; // Match parfait
  }

  // Fallback sur l'ancienne méthode avec hashtags
  const postDietTags = extractDietTags(post.hashtags, post.content);
  if (postDietTags.includes(userDiet.toLowerCase())) {
    return 0.9;
  }

  // Vérifier compatibilité (ex: Vegan compatible avec Végétarien)
  if (isDietCompatibleWith(post.dietType, userDiet)) {
    return 0.7;
  }

  return 0.3; // Score bas si pas compatible
}

function calculateAllergyCompatibility(post, userAllergies) {
  if (!userAllergies || userAllergies.length === 0) return 1.0;

  // Si le post est certifié sans allergènes
  if (post.isAllergenFree) {
    return 1.0;
  }

  // Vérifier les allergènes du post
  const postAllergens = post.allergens ? JSON.parse(post.allergens) : [];
  
  // Si le post contient un allergène de l'utilisateur
  const hasUserAllergen = userAllergies.some(userAllergy =>
    postAllergens.some(postAllergen => 
      postAllergen.toLowerCase() === userAllergy.toLowerCase()
    )
  );

  if (hasUserAllergen) {
    return 0.0; // Bloquer complètement si allergène présent
  }

  return 1.0; // Compatible
}

function isDietCompatibleWith(postDiet, userDiet) {
  if (!postDiet) return false;

  const compatibilityMatrix = {
    'vegan': ['vegetarian'], // Vegan est compatible avec végétarien
    'vegetarian': [], // Végétarien n'est pas compatible avec vegan
    'paleo': [],
    'keto': ['paleo'], // Keto peut être compatible avec paleo
    'halal': [],
    'kosher': []
  };

  const postDietLower = postDiet.toLowerCase();
  const userDietLower = userDiet.toLowerCase();

  return compatibilityMatrix[postDietLower]?.includes(userDietLower) || false;
}

function calculateRecencyScore(createdAt) {
  const hoursSincePost = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60);
  
  if (hoursSincePost < 24) return 1.0;
  if (hoursSincePost < 48) return 0.7;
  if (hoursSincePost < 168) return 0.4;
  return 0.2;
}

function calculateEngagementScore(post) {
  const totalEngagement = post.likes + (post.comments * 2) + (post.shares * 3);
  return Math.log10(totalEngagement + 1) / 4;
}

function calculateDiversityScore(post, seenCategories) {
  if (!seenCategories || seenCategories.length === 0) return 1.0;

  const postCategory = extractMainCategory(post);
  const timesSeen = seenCategories.filter(c => c === postCategory).length;

  return Math.max(0.3, 1 - (timesSeen * 0.2));
}

function extractDietTags(hashtags, content) {
  const text = `${hashtags || ''} ${content || ''}`.toLowerCase();
  const diets = ['vegan', 'vegetarian', 'paleo', 'keto', 'halal', 'kosher'];
  return diets.filter(diet => text.includes(diet));
}

function extractIngredients(knorrProducts, content) {
  const products = JSON.parse(knorrProducts || '[]');
  return products.map(p => p.name || p).concat(
    (content || '').match(/\b[A-Z][a-z]+\b/g) || []
  );
}

function isDietCompatible(product, diet) {
  const dietRules = {
    'Vegan': ['légumes', 'tofu', 'végétal'],
    'Vegetarian': ['légumes', 'fromage', 'œuf'],
    'Paleo': ['viande', 'poisson', 'légumes'],
    'Keto': ['viande', 'poisson', 'fromage', 'œuf']
  };
  
  const keywords = dietRules[diet] || [];
  const productName = (product.name || product).toLowerCase();
  return keywords.some(kw => productName.includes(kw));
}

function extractMainCategory(post) {
  const hashtags = (post.hashtags || '').toLowerCase();
  if (hashtags.includes('soupe')) return 'soupe';
  if (hashtags.includes('plat')) return 'plat';
  if (hashtags.includes('dessert')) return 'dessert';
  return 'général';
}

module.exports = {
  calculatePostScore,
  DEFAULT_WEIGHTS
};