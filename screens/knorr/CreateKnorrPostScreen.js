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
  Platform,
  ActivityIndicator
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Video } from 'expo-av';
import { addDoc, collection, updateDoc, doc, increment } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from '../../firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const CreateKnorrPostScreen = ({ navigation }) => {
  const [mediaUri, setMediaUri] = useState(null);
  const [mediaType, setMediaType] = useState(null); // 'image' ou 'video'
  const [caption, setCaption] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [showProductPicker, setShowProductPicker] = useState(false);
  const [isRecipe, setIsRecipe] = useState(false);
  const [recipeData, setRecipeData] = useState({
    prepTime: '',
    cookTime: '',
    servings: '',
    difficulty: 'facile'
  });
  const [uploading, setUploading] = useState(false);

  const userId = auth.currentUser?.uid;
  const userName = auth.currentUser?.displayName || 'Utilisateur';

  // Base de produits Knorr (à enrichir)
  const KNORR_PRODUCTS = [
    { id: 'knorr_1', name: 'Knorr Bouillon de Légumes', category: 'bouillon', image: 'https://via.placeholder.com/100' },
    { id: 'knorr_2', name: 'Knorr Bouillon de Poule', category: 'bouillon', image: 'https://via.placeholder.com/100' },
    { id: 'knorr_3', name: 'Knorr Soupe Tomate', category: 'soupe', image: 'https://via.placeholder.com/100' },
    { id: 'knorr_4', name: 'Knorr Pasta Box Carbonara', category: 'plat', image: 'https://via.placeholder.com/100' },
    { id: 'knorr_5', name: 'Knorr Sauce Curry', category: 'sauce', image: 'https://via.placeholder.com/100' },
    { id: 'knorr_6', name: 'Knorr Purée Nature', category: 'accompagnement', image: 'https://via.placeholder.com/100' },
    { id: 'knorr_7', name: 'Knorr Risotto Champignons', category: 'plat', image: 'https://via.placeholder.com/100' },
    { id: 'knorr_8', name: 'Knorr Sauce Béchamel', category: 'sauce', image: 'https://via.placeholder.com/100' },
  ];

  // Sélectionner média (photo ou vidéo)
  const pickMedia = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission refusée', 'Accès à la galerie nécessaire');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 0.8,
      videoMaxDuration: 60, // Max 60 secondes
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      setMediaUri(asset.uri);
      setMediaType(asset.type);
    }
  };

  // Prendre photo/vidéo
  const takeMedia = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission refusée', 'Accès caméra nécessaire');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 0.8,
      videoMaxDuration: 60,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      setMediaUri(asset.uri);
      setMediaType(asset.type);
    }
  };

  // Toggle produit Knorr
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

  // Upload média sur Firebase Storage
  const uploadMedia = async (uri) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    
    const filename = `knorr_posts/${userId}_${Date.now()}.${mediaType === 'video' ? 'mp4' : 'jpg'}`;
    const storageRef = ref(storage, filename);
    
    await uploadBytes(storageRef, blob);
    const downloadURL = await getDownloadURL(storageRef);
    
    return downloadURL;
  };

  // Publier le post
  const publishPost = async () => {
    // Validations
    if (!mediaUri) {
      Alert.alert('Erreur', 'Ajoutez une photo ou vidéo');
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
      // Upload média
      const mediaUrl = await uploadMedia(mediaUri);

      // Parser hashtags
      const hashtagsArray = hashtags
        .split(' ')
        .filter(tag => tag.startsWith('#'))
        .map(tag => tag.trim());

      // Créer le post
      const postData = {
        userId,
        userName,
        userAvatar: auth.currentUser?.photoURL || null,
        userLevel: 1, // À récupérer du profil Knorr
        caption,
        hashtags: hashtagsArray,
        mediaUrl,
        type: mediaType,
        knorrProducts: selectedProducts,
        likes: 0,
        views: 0,
        comments: 0,
        shares: 0,
        saves: 0,
        likedBy: [],
        createdAt: new Date(),
        status: 'active',
        isPromoted: false,
        allergens: [], // À détecter depuis les produits
        dietType: 'omnivore', // À détecter
        recipe: isRecipe ? {
          prepTime: parseInt(recipeData.prepTime) || 0,
          cookTime: parseInt(recipeData.cookTime) || 0,
          servings: parseInt(recipeData.servings) || 0,
          difficulty: recipeData.difficulty
        } : null
      };

      const docRef = await addDoc(collection(db, 'knorr_posts'), postData);

      // Mettre à jour profil utilisateur
      const userRef = doc(db, 'knorr_user_profiles', userId);
      await updateDoc(userRef, {
        'stats.totalPosts': increment(1),
        knorrXP: increment(10), // +10 XP par post
        rewardPoints: increment(5) // +5 points
      });

      Alert.alert(
        '🎉 Post publié !',
        'Votre création Knorr est en ligne ! +10 XP',
        [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]
      );

    } catch (error) {
      console.error('Erreur publication:', error);
      Alert.alert('Erreur', 'Impossible de publier le post');
    } finally {
      setUploading(false);
    }
  };

  if (uploading) {
    return (
      <View style={styles.uploadingContainer}>
        <ActivityIndicator size="large" color="#e63946" />
        <Text style={styles.uploadingText}>Publication en cours...</Text>
        <Text style={styles.uploadingSubtext}>Ne fermez pas l'app</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#e63946', '#c1121f']}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Créer un post Knorr</Text>
        <TouchableOpacity onPress={publishPost}>
          <Text style={styles.publishButton}>Publier</Text>
        </TouchableOpacity>
      </LinearGradient>

      {/* Média preview */}
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
            <Ionicons name="close-circle" size={32} color="#e63946" />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.mediaSelector}>
          <TouchableOpacity style={styles.mediaSelectorButton} onPress={takeMedia}>
            <Ionicons name="camera" size={48} color="#e63946" />
            <Text style={styles.mediaSelectorText}>Prendre photo/vidéo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.mediaSelectorButton} onPress={pickMedia}>
            <Ionicons name="images" size={48} color="#e63946" />
            <Text style={styles.mediaSelectorText}>Galerie</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Caption */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Description *</Text>
        <TextInput
          style={styles.captionInput}
          placeholder="Partagez votre recette Knorr..."
          value={caption}
          onChangeText={setCaption}
          multiline
          maxLength={500}
        />
        <Text style={styles.charCount}>{caption.length}/500</Text>
      </View>

      {/* Hashtags */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Hashtags</Text>
        <TextInput
          style={styles.input}
          placeholder="#KnorrRecettes #Facile #Délicieux"
          value={hashtags}
          onChangeText={setHashtags}
        />
      </View>

      {/* Produits Knorr */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🍽️ Produits Knorr utilisés</Text>
          <Text style={styles.sectionSubtitle}>
            {selectedProducts.length} produit{selectedProducts.length > 1 ? 's' : ''}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.addProductButton}
          onPress={() => setShowProductPicker(!showProductPicker)}
        >
          <Ionicons name="add-circle" size={24} color="#e63946" />
          <Text style={styles.addProductText}>Ajouter des produits</Text>
        </TouchableOpacity>

        {showProductPicker && (
          <View style={styles.productPicker}>
            {KNORR_PRODUCTS.map(product => {
              const isSelected = selectedProducts.find(p => p.productId === product.id);
              return (
                <TouchableOpacity
                  key={product.id}
                  style={[
                    styles.productItem,
                    isSelected && styles.productItemSelected
                  ]}
                  onPress={() => toggleProduct(product)}
                >
                  <Image source={{ uri: product.image }} style={styles.productImage} />
                  <Text style={styles.productName} numberOfLines={2}>
                    {product.name}
                  </Text>
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={24} color="#2ecc71" />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {selectedProducts.length > 0 && (
          <View style={styles.selectedProducts}>
            {selectedProducts.map((product, index) => (
              <View key={index} style={styles.selectedProductTag}>
                <Text style={styles.selectedProductText}>{product.productName}</Text>
                <TouchableOpacity onPress={() => toggleProduct({ id: product.productId })}>
                  <Ionicons name="close" size={18} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Type de contenu */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Type de contenu</Text>
        <View style={styles.contentTypeRow}>
          <TouchableOpacity
            style={[styles.contentTypeButton, !isRecipe && styles.contentTypeButtonActive]}
            onPress={() => setIsRecipe(false)}
          >
            <Ionicons name="chatbubble" size={20} color={!isRecipe ? '#fff' : '#666'} />
            <Text style={[styles.contentTypeText, !isRecipe && styles.contentTypeTextActive]}>
              Astuce/Avis
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.contentTypeButton, isRecipe && styles.contentTypeButtonActive]}
            onPress={() => setIsRecipe(true)}
          >
            <Ionicons name="restaurant" size={20} color={isRecipe ? '#fff' : '#666'} />
            <Text style={[styles.contentTypeText, isRecipe && styles.contentTypeTextActive]}>
              Recette
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Détails recette (si recette) */}
      {isRecipe && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Détails de la recette</Text>
          
          <View style={styles.recipeRow}>
            <View style={styles.recipeInput}>
              <Text style={styles.label}>Préparation (min)</Text>
              <TextInput
                style={styles.smallInput}
                placeholder="15"
                value={recipeData.prepTime}
                onChangeText={(val) => setRecipeData({...recipeData, prepTime: val})}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.recipeInput}>
              <Text style={styles.label}>Cuisson (min)</Text>
              <TextInput
                style={styles.smallInput}
                placeholder="20"
                value={recipeData.cookTime}
                onChangeText={(val) => setRecipeData({...recipeData, cookTime: val})}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.recipeInput}>
              <Text style={styles.label}>Parts</Text>
              <TextInput
                style={styles.smallInput}
                placeholder="4"
                value={recipeData.servings}
                onChangeText={(val) => setRecipeData({...recipeData, servings: val})}
                keyboardType="numeric"
              />
            </View>
          </View>

          <Text style={styles.label}>Difficulté</Text>
          <View style={styles.difficultyRow}>
            {['facile', 'moyen', 'difficile'].map(level => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.difficultyButton,
                  recipeData.difficulty === level && styles.difficultyButtonActive
                ]}
                onPress={() => setRecipeData({...recipeData, difficulty: level})}
              >
                <Text style={[
                  styles.difficultyText,
                  recipeData.difficulty === level && styles.difficultyTextActive
                ]}>
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Info XP */}
      <View style={styles.xpInfo}>
        <Ionicons name="trophy" size={24} color="#f39c12" />
        <Text style={styles.xpInfoText}>
          Vous gagnerez +10 XP et +5 points Knorr !
        </Text>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  uploadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  uploadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 20,
  },
  uploadingSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  publishButton: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  mediaPreview: {
    width: '100%',
    height: 300,
    position: 'relative',
  },
  mediaPreviewContent: {
    width: '100%',
    height: '100%',
  },
  removeMediaButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: '#fff',
    borderRadius: 16,
  },
  mediaSelector: {
    flexDirection: 'row',
    padding: 20,
    gap: 15,
  },
  mediaSelectorButton: {
    flex: 1,
    height: 150,
    backgroundColor: '#fff',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e63946',
    borderStyle: 'dashed',
  },
  mediaSelectorText: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  captionInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    textAlign: 'right',
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  addProductButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#e63946',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
  },
  addProductText: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: '600',
    color: '#e63946',
  },
  productPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 15,
  },
  productItem: {
    width: '48%',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  productItemSelected: {
    borderColor: '#2ecc71',
    backgroundColor: '#e8f8f5',
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginBottom: 8,
  },
  productName: {
    fontSize: 12,
    textAlign: 'center',
    color: '#333',
    marginBottom: 5,
  },
  selectedProducts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectedProductTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e63946',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  selectedProductText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    marginRight: 8,
  },
  contentTypeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  contentTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  contentTypeButtonActive: {
    backgroundColor: '#e63946',
    borderColor: '#e63946',
  },
  contentTypeText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  contentTypeTextActive: {
    color: '#fff',
  },
  recipeRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
  recipeInput: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  smallInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    textAlign: 'center',
  },
  difficultyRow: {
    flexDirection: 'row',
    gap: 10,
  },
  difficultyButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  difficultyButtonActive: {
    backgroundColor: '#f39c12',
    borderColor: '#f39c12',
  },
  difficultyText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  difficultyTextActive: {
    color: '#fff',
  },
  xpInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff9e6',
    padding: 15,
    marginHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f39c12',
  },
  xpInfoText: {
    marginLeft: 10,
    fontSize: 14,
    fontWeight: '600',
    color: '#f39c12',
  },
});

export default CreateKnorrPostScreen;