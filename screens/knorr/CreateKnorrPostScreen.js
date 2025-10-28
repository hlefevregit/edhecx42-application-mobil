import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Video } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import apiService from '../../services/apiService';
import { useAuth } from '../../contexts/AuthContext';

const CreateKnorrPostScreen = ({ navigation }) => {
  const { user } = useAuth();
  const userId = user?.id;
  const userName = user?.displayName || user?.name || 'Utilisateur';

  const [mediaUri, setMediaUri] = useState(null);
  const [mediaType, setMediaType] = useState(null);
  const [caption, setCaption] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [showProductPicker, setShowProductPicker] = useState(false);
  
  const [selectedDiet, setSelectedDiet] = useState(null);
  const [selectedAllergens, setSelectedAllergens] = useState([]);
  const [isAllergenFree, setIsAllergenFree] = useState(false);
  
  const [isRecipe, setIsRecipe] = useState(false);
  const [recipeData, setRecipeData] = useState({
    prepTime: '',
    cookTime: '',
    servings: '',
    difficulty: 'facile'
  });
  const [uploading, setUploading] = useState(false);

  // Couleurs de la DA Knorr
  const KNORR_GREEN = '#00753A';
  const KNORR_GREEN_LIGHT = '#27AE60';
  const KNORR_YELLOW = '#FFD93D';
  const KNORR_CREAM = '#FFF9E6';

  const DIET_TYPES = [
    { id: 'vegan', name: 'Vegan', icon: '🌱', color: '#27ae60' },
    { id: 'vegetarian', name: 'Végétarien', icon: '🥗', color: '#2ecc71' },
    { id: 'paleo', name: 'Paléo', icon: '🥩', color: '#e67e22' },
    { id: 'keto', name: 'Keto', icon: '🥑', color: '#9b59b6' },
    { id: 'halal', name: 'Halal', icon: '☪️', color: '#16a085' },
    { id: 'kosher', name: 'Kasher', icon: '✡️', color: '#3498db' },
    { id: 'none', name: 'Aucun', icon: '🍽️', color: '#95a5a6' },
  ];

  const COMMON_ALLERGENS = [
    { id: 'gluten', name: 'Gluten', icon: '🌾' },
    { id: 'dairy', name: 'Produits laitiers', icon: '🥛' },
    { id: 'eggs', name: 'Œufs', icon: '🥚' },
    { id: 'nuts', name: 'Fruits à coque', icon: '🥜' },
    { id: 'soy', name: 'Soja', icon: '🫘' },
    { id: 'shellfish', name: 'Fruits de mer', icon: '🦐' },
    { id: 'fish', name: 'Poisson', icon: '🐟' },
    { id: 'sesame', name: 'Sésame', icon: '🫘' },
  ];

  const KNORR_PRODUCTS = [
    { id: 'knorr_1', name: 'Knorr Bouillon de Légumes', category: 'bouillon', image: 'https://picsum.photos/100' },
    { id: 'knorr_2', name: 'Knorr Bouillon de Poule', category: 'bouillon', image: 'https://picsum.photos/100' },
    { id: 'knorr_3', name: 'Knorr Soupe Tomate', category: 'soupe', image: 'https://picsum.photos/100' },
    { id: 'knorr_4', name: 'Knorr Pasta Box Carbonara', category: 'plat', image: 'https://picsum.photos/100' },
    { id: 'knorr_5', name: 'Knorr Sauce Curry', category: 'sauce', image: 'https://picsum.photos/100' },
    { id: 'knorr_6', name: 'Knorr Purée Nature', category: 'accompagnement', image: 'https://picsum.photos/100' },
    { id: 'knorr_7', name: 'Knorr Risotto Champignons', category: 'plat', image: 'https://picsum.photos/100' },
    { id: 'knorr_8', name: 'Knorr Sauce Béchamel', category: 'sauce', image: 'https://picsum.photos/100' },
  ];

  const pickMedia = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission refusée', 'Accès à la galerie nécessaire');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      setMediaUri(asset.uri);
      setMediaType('image');
    }
  };

  const takeMedia = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission refusée', 'Accès caméra nécessaire');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      setMediaUri(asset.uri);
      setMediaType('image');
    }
  };

  const toggleProduct = (product) => {
    if (selectedProducts.find(p => p.productId === product.id)) {
      setSelectedProducts(selectedProducts.filter(p => p.productId !== product.id));
    } else {
      setSelectedProducts([...selectedProducts, {
        productId: product.id,
        productName: product.name,
        productCategory: product.category
      }]);
    }
  };

  const toggleDiet = (dietId) => {
    setSelectedDiet(selectedDiet === dietId ? null : dietId);
  };

  const toggleAllergen = (allergenId) => {
    if (selectedAllergens.includes(allergenId)) {
      setSelectedAllergens(selectedAllergens.filter(a => a !== allergenId));
    } else {
      setSelectedAllergens([...selectedAllergens, allergenId]);
    }
    if (selectedAllergens.length > 0) {
      setIsAllergenFree(false);
    }
  };

  const publishPost = async () => {
    if (!mediaUri) {
      Alert.alert('Erreur', 'Ajoutez une photo');
      return;
    }

    if (!caption.trim()) {
      Alert.alert('Erreur', 'Ajoutez une description');
      return;
    }

    if (selectedProducts.length === 0) {
      Alert.alert('Attention', 'Aucun produit Knorr tagué. Voulez-vous continuer ?', [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Continuer', onPress: () => createPost() }
      ]);
      return;
    }

    await createPost();
  };

  const createPost = async () => {
    setUploading(true);

    try {
      const hashtagsArray = hashtags
        .split(' ')
        .filter(tag => tag.startsWith('#'))
        .map(tag => tag.trim());

      const postContent = {
        caption,
        hashtags: hashtagsArray.join(' '),
        knorrProducts: JSON.stringify(selectedProducts),
        userName,
        isRecipe: isRecipe.toString(),
        
        dietType: selectedDiet || null,
        allergens: JSON.stringify(selectedAllergens),
        isAllergenFree: isAllergenFree.toString(),
        
        ...(isRecipe && {
          prepTime: recipeData.prepTime,
          cookTime: recipeData.cookTime,
          servings: recipeData.servings,
          difficulty: recipeData.difficulty
        })
      };

      const result = await apiService.createPost({
        userId,
        content: JSON.stringify(postContent),
        imageUri: mediaUri
      });

      Alert.alert(
        '🎉 Post publié !',
        'Votre création Knorr est en ligne !',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );

    } catch (error) {
      console.error('Erreur publication:', error);
      Alert.alert('Erreur', error.message || 'Impossible de publier le post');
    } finally {
      setUploading(false);
    }
  };

  if (uploading) {
    return (
      <View style={styles.uploadingContainer}>
        <ActivityIndicator size="large" color={KNORR_GREEN} />
        <Text style={styles.uploadingText}>Publication en cours...</Text>
        <Text style={styles.uploadingSubtext}>Ne fermez pas l'app</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header avec forme de feuille */}
      <View style={styles.headerContainer}>
        <LinearGradient
          colors={[KNORR_GREEN, '#005A2D']}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={26} color="#fff" />
            </TouchableOpacity>
            
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>Créer un post</Text>
              <Text style={styles.headerSubtitle}>SINCE 1838</Text>
            </View>
            
            <TouchableOpacity onPress={publishPost} style={styles.publishButtonHeader}>
              <LinearGradient
                colors={[KNORR_YELLOW, '#FFBF00']}
                style={styles.publishButtonGradient}
              >
                <Text style={styles.publishButtonText}>Publier</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </LinearGradient>
        
        {/* Forme de feuille décorative */}
        <View style={styles.leafDecoration} />
      </View>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Sélecteur de média avec style Knorr */}
        {mediaUri ? (
          <View style={styles.mediaPreview}>
            {mediaType === 'video' ? (
              <Video
                source={{ uri: mediaUri }}
                style={styles.mediaPreviewContent}
                useNativeControls
                resizeMode="cover"
              />
            ) : (
              <Image
                source={{ uri: mediaUri }}
                style={styles.mediaPreviewContent}
                resizeMode="cover"
              />
            )}
            <TouchableOpacity
              style={styles.removeMediaButton}
              onPress={() => {
                setMediaUri(null);
                setMediaType(null);
              }}
            >
              <LinearGradient
                colors={['#fff', '#f5f5f5']}
                style={styles.removeMediaGradient}
              >
                <Ionicons name="close" size={24} color={KNORR_GREEN} />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.mediaSelectorContainer}>
            <View style={styles.mediaSelectorBackground}>
              <TouchableOpacity style={styles.mediaSelectorButton} onPress={takeMedia}>
                <View style={styles.iconCircle}>
                  <Ionicons name="camera" size={32} color={KNORR_GREEN} />
                </View>
                <Text style={styles.mediaSelectorText}>Prendre une photo</Text>
              </TouchableOpacity>
              
              <View style={styles.mediaSelectorDivider} />
              
              <TouchableOpacity style={styles.mediaSelectorButton} onPress={pickMedia}>
                <View style={styles.iconCircle}>
                  <Ionicons name="images" size={32} color={KNORR_GREEN} />
                </View>
                <Text style={styles.mediaSelectorText}>Galerie</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Description */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderIcon}>
              <Ionicons name="create" size={20} color={KNORR_GREEN} />
            </View>
            <Text style={styles.cardTitle}>Description</Text>
            <View style={styles.requiredBadge}>
              <Text style={styles.requiredText}>Obligatoire</Text>
            </View>
          </View>
          
          <TextInput
            style={styles.captionInput}
            placeholder="Partagez votre délicieuse création Knorr..."
            placeholderTextColor="#999"
            value={caption}
            onChangeText={setCaption}
            multiline
            maxLength={500}
          />
          <Text style={styles.charCount}>{caption.length}/500 caractères</Text>
        </View>

        {/* Hashtags */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderIcon}>
              <Ionicons name="pricetag" size={20} color={KNORR_GREEN} />
            </View>
            <Text style={styles.cardTitle}>Hashtags</Text>
          </View>
          
          <TextInput
            style={styles.input}
            placeholder="#KnorrRecettes #Facile #Délicieux"
            placeholderTextColor="#999"
            value={hashtags}
            onChangeText={setHashtags}
          />
        </View>

        {/* Type de régime */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderIcon}>
              <Text style={{ fontSize: 20 }}>🥗</Text>
            </View>
            <Text style={styles.cardTitle}>Type de régime</Text>
            <Text style={styles.optionalBadge}>Optionnel</Text>
          </View>
          
          <View style={styles.dietGrid}>
            {DIET_TYPES.map(diet => (
              <TouchableOpacity
                key={diet.id}
                style={[
                  styles.dietButton,
                  selectedDiet === diet.id && { 
                    backgroundColor: diet.color,
                    borderColor: diet.color,
                    transform: [{ scale: 1.05 }]
                  }
                ]}
                onPress={() => toggleDiet(diet.id)}
              >
                <Text style={styles.dietIcon}>{diet.icon}</Text>
                <Text style={[
                  styles.dietText,
                  selectedDiet === diet.id && styles.dietTextActive
                ]}>
                  {diet.name}
                </Text>
                {selectedDiet === diet.id && (
                  <View style={styles.checkmarkBadge}>
                    <Ionicons name="checkmark" size={14} color="#fff" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Allergènes */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderIcon}>
              <Text style={{ fontSize: 20 }}>⚠️</Text>
            </View>
            <Text style={styles.cardTitle}>Allergènes</Text>
            
            <TouchableOpacity
              style={[
                styles.allergenFreeButton,
                isAllergenFree && styles.allergenFreeButtonActive
              ]}
              onPress={() => {
                setIsAllergenFree(!isAllergenFree);
                if (!isAllergenFree) {
                  setSelectedAllergens([]);
                }
              }}
            >
              <Ionicons 
                name={isAllergenFree ? "shield-checkmark" : "shield-checkmark-outline"} 
                size={18} 
                color={isAllergenFree ? "#fff" : KNORR_GREEN} 
              />
              <Text style={[
                styles.allergenFreeText,
                isAllergenFree && styles.allergenFreeTextActive
              ]}>
                Sans allergènes
              </Text>
            </TouchableOpacity>
          </View>

          {!isAllergenFree && (
            <>
              <Text style={styles.helperText}>
                Sélectionnez les allergènes présents dans votre recette
              </Text>
              
              <View style={styles.allergenGrid}>
                {COMMON_ALLERGENS.map(allergen => {
                  const isSelected = selectedAllergens.includes(allergen.id);
                  return (
                    <TouchableOpacity
                      key={allergen.id}
                      style={[
                        styles.allergenChip,
                        isSelected && styles.allergenChipSelected
                      ]}
                      onPress={() => toggleAllergen(allergen.id)}
                    >
                      <Text style={styles.allergenIcon}>{allergen.icon}</Text>
                      <Text style={[
                        styles.allergenName,
                        isSelected && styles.allergenNameSelected
                      ]}>
                        {allergen.name}
                      </Text>
                      {isSelected && (
                        <View style={styles.allergenRemoveBadge}>
                          <Ionicons name="close" size={10} color="#fff" />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>
          )}
        </View>

        {/* Produits Knorr */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderIcon}>
              <Ionicons name="basket" size={20} color={KNORR_GREEN} />
            </View>
            <Text style={styles.cardTitle}>Produits Knorr utilisés</Text>
            <View style={styles.counterBadge}>
              <Text style={styles.counterText}>{selectedProducts.length}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.addProductButton}
            onPress={() => setShowProductPicker(!showProductPicker)}
          >
            <Ionicons name="add-circle" size={22} color={KNORR_GREEN} />
            <Text style={styles.addProductText}>Ajouter des produits</Text>
            <Ionicons 
              name={showProductPicker ? "chevron-up" : "chevron-down"} 
              size={20} 
              color="#999" 
            />
          </TouchableOpacity>

          {showProductPicker && (
            <View style={styles.productGrid}>
              {KNORR_PRODUCTS.map(product => {
                const isSelected = selectedProducts.find(p => p.productId === product.id);
                return (
                  <TouchableOpacity
                    key={product.id}
                    style={[
                      styles.productCard,
                      isSelected && styles.productCardSelected
                    ]}
                    onPress={() => toggleProduct(product)}
                  >
                    <Image source={{ uri: product.image }} style={styles.productImage} />
                    <Text style={styles.productName} numberOfLines={2}>
                      {product.name}
                    </Text>
                    {isSelected && (
                      <View style={styles.productCheckmark}>
                        <Ionicons name="checkmark-circle" size={24} color={KNORR_GREEN} />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {selectedProducts.length > 0 && (
            <View style={styles.selectedProductsContainer}>
              <Text style={styles.selectedProductsTitle}>Sélectionnés :</Text>
              <View style={styles.selectedProductsList}>
                {selectedProducts.map((product, index) => (
                  <View key={index} style={styles.selectedProductChip}>
                    <Text style={styles.selectedProductName}>{product.productName}</Text>
                    <TouchableOpacity onPress={() => toggleProduct({ id: product.productId })}>
                      <Ionicons name="close-circle" size={20} color="#fff" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Type de contenu */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderIcon}>
              <Ionicons name="document-text" size={20} color={KNORR_GREEN} />
            </View>
            <Text style={styles.cardTitle}>Type de contenu</Text>
          </View>
          
          <View style={styles.contentTypeContainer}>
            <TouchableOpacity
              style={[
                styles.contentTypeCard,
                !isRecipe && styles.contentTypeCardActive
              ]}
              onPress={() => setIsRecipe(false)}
            >
              <View style={styles.contentTypeIcon}>
                <Ionicons name="chatbubbles" size={32} color={!isRecipe ? KNORR_GREEN : '#999'} />
              </View>
              <Text style={[
                styles.contentTypeLabel,
                !isRecipe && styles.contentTypeLabelActive
              ]}>
                Astuce / Avis
              </Text>
              {!isRecipe && <View style={styles.activeIndicator} />}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.contentTypeCard,
                isRecipe && styles.contentTypeCardActive
              ]}
              onPress={() => setIsRecipe(true)}
            >
              <View style={styles.contentTypeIcon}>
                <Ionicons name="restaurant" size={32} color={isRecipe ? KNORR_GREEN : '#999'} />
              </View>
              <Text style={[
                styles.contentTypeLabel,
                isRecipe && styles.contentTypeLabelActive
              ]}>
                Recette
              </Text>
              {isRecipe && <View style={styles.activeIndicator} />}
            </TouchableOpacity>
          </View>
        </View>

        {/* Détails recette */}
        {isRecipe && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderIcon}>
                <Ionicons name="time" size={20} color={KNORR_GREEN} />
              </View>
              <Text style={styles.cardTitle}>Détails de la recette</Text>
            </View>
            
            <View style={styles.recipeDetailsGrid}>
              <View style={styles.recipeDetailItem}>
                <Text style={styles.recipeDetailLabel}>⏱️ Préparation</Text>
                <TextInput
                  style={styles.recipeDetailInput}
                  placeholder="15 min"
                  placeholderTextColor="#999"
                  value={recipeData.prepTime}
                  onChangeText={(val) => setRecipeData({...recipeData, prepTime: val})}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.recipeDetailItem}>
                <Text style={styles.recipeDetailLabel}>🔥 Cuisson</Text>
                <TextInput
                  style={styles.recipeDetailInput}
                  placeholder="20 min"
                  placeholderTextColor="#999"
                  value={recipeData.cookTime}
                  onChangeText={(val) => setRecipeData({...recipeData, cookTime: val})}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.recipeDetailItem}>
                <Text style={styles.recipeDetailLabel}>👥 Portions</Text>
                <TextInput
                  style={styles.recipeDetailInput}
                  placeholder="4"
                  placeholderTextColor="#999"
                  value={recipeData.servings}
                  onChangeText={(val) => setRecipeData({...recipeData, servings: val})}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <Text style={styles.difficultyLabel}>Niveau de difficulté</Text>
            <View style={styles.difficultyContainer}>
              {['facile', 'moyen', 'difficile'].map(level => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.difficultyChip,
                    recipeData.difficulty === level && styles.difficultyChipActive
                  ]}
                  onPress={() => setRecipeData({...recipeData, difficulty: level})}
                >
                  <Text style={[
                    styles.difficultyText,
                    recipeData.difficulty === level && styles.difficultyTextActive
                  ]}>
                    {level === 'facile' && '😊 '}
                    {level === 'moyen' && '🤔 '}
                    {level === 'difficile' && '👨‍🍳 '}
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Info encouragement */}
        <View style={styles.encouragementCard}>
          <LinearGradient
            colors={[KNORR_CREAM, '#FFF4CC']}
            style={styles.encouragementGradient}
          >
            <View style={styles.encouragementIcon}>
              <Text style={{ fontSize: 32 }}>🌱</Text>
            </View>
            <View style={styles.encouragementContent}>
              <Text style={styles.encouragementTitle}>Cultivez votre passion !</Text>
              <Text style={styles.encouragementText}>
                Partagez vos créations et inspirez la communauté Knorr
              </Text>
            </View>
          </LinearGradient>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  uploadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  uploadingText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginTop: 20,
  },
  uploadingSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  
  // Header avec style Knorr
  headerContainer: {
    position: 'relative',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 25,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 10,
    color: '#FFD93D',
    fontWeight: '600',
    letterSpacing: 2,
    marginTop: 2,
  },
  publishButtonHeader: {
    width: 90,
  },
  publishButtonGradient: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  publishButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#00753A',
    textAlign: 'center',
  },
  leafDecoration: {
    position: 'absolute',
    bottom: -10,
    right: 20,
    width: 40,
    height: 40,
    backgroundColor: '#27AE60',
    borderRadius: 20,
    opacity: 0.3,
  },

  scrollContent: {
    flex: 1,
  },

  // Sélecteur de média
  mediaSelectorContainer: {
    padding: 20,
  },
  mediaSelectorBackground: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  mediaSelectorButton: {
    alignItems: 'center',
    paddingVertical: 25,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  mediaSelectorText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  mediaSelectorDivider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 10,
  },
  mediaPreview: {
    width: '100%',
    height: 350,
    position: 'relative',
    marginBottom: 15,
  },
  mediaPreviewContent: {
    width: '100%',
    height: '100%',
  },
  removeMediaButton: {
    position: 'absolute',
    top: 15,
    right: 15,
  },
  removeMediaGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },

  // Cards
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  cardHeaderIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#333',
    flex: 1,
  },
  requiredBadge: {
    backgroundColor: '#FFE6E6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  requiredText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#E74C3C',
  },
  optionalBadge: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  counterBadge: {
    backgroundColor: '#00753A',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },

  // Inputs
  captionInput: {
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 15,
    padding: 15,
    fontSize: 15,
    minHeight: 120,
    textAlignVertical: 'top',
    backgroundColor: '#FAFAFA',
  },
  charCount: {
    textAlign: 'right',
    fontSize: 12,
    color: '#999',
    marginTop: 8,
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 15,
    padding: 15,
    fontSize: 15,
    backgroundColor: '#FAFAFA',
  },
  helperText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 15,
    fontStyle: 'italic',
  },

  // Régimes alimentaires
  dietGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  dietButton: {
    width: '31%',
    aspectRatio: 1,
    backgroundColor: '#FAFAFA',
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    position: 'relative',
  },
  dietIcon: {
    fontSize: 28,
    marginBottom: 5,
  },
  dietText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
  },
  dietTextActive: {
    color: '#fff',
  },
  checkmarkBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Allergènes
  allergenFreeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    borderWidth: 1.5,
    borderColor: '#00753A',
  },
  allergenFreeButtonActive: {
    backgroundColor: '#00753A',
  },
  allergenFreeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#00753A',
  },
  allergenFreeTextActive: {
    color: '#fff',
  },
  allergenGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  allergenChip: {
    width: '48%',
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  allergenChipSelected: {
    backgroundColor: '#FFE6E6',
    borderColor: '#E74C3C',
  },
  allergenIcon: {
    fontSize: 22,
    marginRight: 10,
  },
  allergenName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    flex: 1,
  },
  allergenNameSelected: {
    color: '#E74C3C',
  },
  allergenRemoveBadge: {
    backgroundColor: '#E74C3C',
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Produits
  addProductButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
    borderWidth: 2,
    borderColor: '#00753A',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
  },
  addProductText: {
    marginLeft: 10,
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#00753A',
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 15,
  },
  productCard: {
    width: '48%',
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    position: 'relative',
  },
  productCardSelected: {
    borderColor: '#00753A',
    backgroundColor: '#E8F5E9',
  },
  productImage: {
    width: 70,
    height: 70,
    borderRadius: 10,
    marginBottom: 8,
  },
  productName: {
    fontSize: 11,
    textAlign: 'center',
    color: '#333',
    fontWeight: '500',
  },
  productCheckmark: {
    position: 'absolute',
    top: 5,
    right: 5,
  },
  selectedProductsContainer: {
    marginTop: 10,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  selectedProductsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    marginBottom: 10,
  },
  selectedProductsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectedProductChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00753A',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  selectedProductName: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginRight: 8,
  },

  // Type de contenu
  contentTypeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  contentTypeCard: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    position: 'relative',
  },
  contentTypeCardActive: {
    backgroundColor: '#E8F5E9',
    borderColor: '#00753A',
  },
  contentTypeIcon: {
    marginBottom: 10,
  },
  contentTypeLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
  },
  contentTypeLabelActive: {
    color: '#00753A',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 10,
    width: 30,
    height: 3,
    backgroundColor: '#00753A',
    borderRadius: 2,
  },

  // Détails recette
  recipeDetailsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  recipeDetailItem: {
    flex: 1,
  },
  recipeDetailLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  recipeDetailInput: {
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    textAlign: 'center',
    backgroundColor: '#FAFAFA',
    fontWeight: '600',
  },
  difficultyLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  difficultyContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  difficultyChip: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  difficultyChipActive: {
    backgroundColor: '#FFD93D',
    borderColor: '#FFD93D',
  },
  difficultyText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  difficultyTextActive: {
    color: '#00753A',
  },

  // Encouragement
  encouragementCard: {
    marginHorizontal: 15,
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  encouragementGradient: {
    flexDirection: 'row',
    padding: 20,
    alignItems: 'center',
  },
  encouragementIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  encouragementContent: {
    flex: 1,
  },
  encouragementTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#00753A',
    marginBottom: 4,
  },
  encouragementText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
});

export default CreateKnorrPostScreen;