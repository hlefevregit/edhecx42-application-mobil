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
  const [isRecipe, setIsRecipe] = useState(false);
  const [recipeData, setRecipeData] = useState({
    prepTime: '',
    cookTime: '',
    servings: '',
    difficulty: 'facile'
  });
  const [uploading, setUploading] = useState(false);

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
      mediaTypes: ImagePicker.MediaTypeOptions.Images, // Seulement images pour l'instant
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
      // Parser hashtags
      const hashtagsArray = hashtags
        .split(' ')
        .filter(tag => tag.startsWith('#'))
        .map(tag => tag.trim());

      // Préparer les données du post
      const postContent = {
        caption,
        hashtags: hashtagsArray.join(' '),
        knorrProducts: JSON.stringify(selectedProducts),
        userName,
        isRecipe: isRecipe.toString(),
        ...(isRecipe && {
          prepTime: recipeData.prepTime,
          cookTime: recipeData.cookTime,
          servings: recipeData.servings,
          difficulty: recipeData.difficulty
        })
      };

      console.log('Creating post with:', { userId, content: postContent, imageUri: mediaUri });

      // Appeler l'API backend
      const result = await apiService.createPost({
        userId,
        content: JSON.stringify(postContent),
        imageUri: mediaUri
      });

      console.log('Post created:', result);

      Alert.alert(
        '🎉 Post publié !',
        'Votre création Knorr est en ligne !',
        [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]
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
        <ActivityIndicator size="large" color="#006e3e" />
        <Text style={styles.uploadingText}>Publication en cours...</Text>
        <Text style={styles.uploadingSubtext}>Ne fermez pas l'app</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={['#006e3e', '#27503e']}
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
            <Ionicons name="close-circle" size={32} color="#006e3e" />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.mediaSelector}>
          <TouchableOpacity style={styles.mediaSelectorButton} onPress={takeMedia}>
            <Ionicons name="camera" size={48} color="#006e3e" />
            <Text style={styles.mediaSelectorText}>Prendre photo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.mediaSelectorButton} onPress={pickMedia}>
            <Ionicons name="images" size={48} color="#006e3e" />
            <Text style={styles.mediaSelectorText}>Galerie</Text>
          </TouchableOpacity>
        </View>
      )}

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

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Hashtags</Text>
        <TextInput
          style={styles.input}
          placeholder="#KnorrRecettes #Facile #Délicieux"
          value={hashtags}
          onChangeText={setHashtags}
        />
      </View>

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
          <Ionicons name="add-circle" size={24} color="#006e3e" />
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

      <View style={styles.xpInfo}>
        <Ionicons name="trophy" size={24} color="#f39c12" />
        <Text style={styles.xpInfoText}>
          Publication réussie = satisfaction garantie !
        </Text>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  uploadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  uploadingText: { fontSize: 18, fontWeight: '600', color: '#333', marginTop: 20 },
  uploadingSubtext: { fontSize: 14, color: '#999', marginTop: 8 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 50, paddingBottom: 15, paddingHorizontal: 20 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  publishButton: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  mediaPreview: { width: '100%', height: 300, position: 'relative' },
  mediaPreviewContent: { width: '100%', height: '100%' },
  removeMediaButton: { position: 'absolute', top: 15, right: 15, backgroundColor: '#fff', borderRadius: 16 },
  mediaSelector: { flexDirection: 'row', padding: 20, gap: 15 },
  mediaSelectorButton: { flex: 1, height: 150, backgroundColor: '#fff', borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#006e3e', borderStyle: 'dashed' },
  mediaSelectorText: { marginTop: 10, fontSize: 14, fontWeight: '600', color: '#666', textAlign: 'center' },
  section: { backgroundColor: '#fff', padding: 20, marginBottom: 10 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 10 },
  sectionSubtitle: { fontSize: 14, color: '#666' },
  captionInput: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 16, minHeight: 100, textAlignVertical: 'top' },
  charCount: { textAlign: 'right', fontSize: 12, color: '#999', marginTop: 5 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 16 },
  addProductButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', borderWidth: 2, borderColor: '#006e3e', borderRadius: 8, padding: 15, marginBottom: 15 },
  addProductText: { marginLeft: 10, fontSize: 16, fontWeight: '600', color: '#006e3e' },
  productPicker: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 15 },
  productItem: { width: '48%', backgroundColor: '#f9f9f9', borderRadius: 8, padding: 10, alignItems: 'center', borderWidth: 2, borderColor: 'transparent' },
  productItemSelected: { borderColor: '#2ecc71', backgroundColor: '#e8f8f5' },
  productImage: { width: 60, height: 60, borderRadius: 8, marginBottom: 8 },
  productName: { fontSize: 12, textAlign: 'center', color: '#333', marginBottom: 5 },
  selectedProducts: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  selectedProductTag: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#006e3e', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20 },
  selectedProductText: { color: '#fff', fontSize: 13, fontWeight: '600', marginRight: 8 },
  contentTypeRow: { flexDirection: 'row', gap: 10 },
  contentTypeButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 15, borderRadius: 8, borderWidth: 2, borderColor: '#ddd', backgroundColor: '#fff' },
  contentTypeButtonActive: { backgroundColor: '#006e3e', borderColor: '#006e3e' },
  contentTypeText: { marginLeft: 8, fontSize: 14, fontWeight: '600', color: '#666' },
  contentTypeTextActive: { color: '#fff' },
  recipeRow: { flexDirection: 'row', gap: 10, marginBottom: 15 },
  recipeInput: { flex: 1 },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8 },
  smallInput: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, fontSize: 16, textAlign: 'center' },
  difficultyRow: { flexDirection: 'row', gap: 10 },
  difficultyButton: { flex: 1, padding: 12, borderRadius: 8, borderWidth: 2, borderColor: '#ddd', alignItems: 'center' },
  difficultyButtonActive: { backgroundColor: '#f39c12', borderColor: '#f39c12' },
  difficultyText: { fontSize: 14, fontWeight: '600', color: '#666' },
  difficultyTextActive: { color: '#fff' },
  xpInfo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff9e6', padding: 15, marginHorizontal: 20, borderRadius: 8, borderWidth: 1, borderColor: '#f39c12' },
  xpInfoText: { marginLeft: 10, fontSize: 14, fontWeight: '600', color: '#f39c12' },
});

export default CreateKnorrPostScreen;