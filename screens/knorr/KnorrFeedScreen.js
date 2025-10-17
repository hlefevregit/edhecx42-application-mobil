import React, { useState, useEffect, useRef } from 'react';
import knorrAlgorithmService from '../../services/knorrAlgorithmService';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Dimensions,
  StatusBar,
  Animated,
  ActivityIndicator
} from 'react-native';
import { Video } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  doc,
  updateDoc,
  increment,
  arrayUnion,
  getDoc
} from 'firebase/firestore';
import { auth, db } from '../../firebaseConfig';
import { Ionicons } from '@expo/vector-icons';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

const KnorrFeedScreen = ({ navigation }) => {
  const [posts, setPosts] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);

  const flatListRef = useRef(null);
  const userId = auth.currentUser?.uid;

  useEffect(() => {
    loadUserProfile();
    loadFeed();
  }, []);

  const loadUserProfile = async () => {
    if (!userId) return;

    try {
      const docRef = doc(db, 'knorr_user_profiles', userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setUserProfile(docSnap.data());
      } else {
        // Créer profil Knorr par défaut
        const newProfile = {
          userId,
          knorrLevel: 1,
          knorrXP: 0,
          rewardPoints: 0,
          badges: [],
          stats: {
            totalPosts: 0,
            totalViews: 0,
            totalLikes: 0
          },
          followers: [],
          following: [],
          contentPreferences: {
            favoriteKnorrProducts: [],
            likedPosts: [],
            savedPosts: []
          }
        };
        await setDoc(docRef, newProfile);
        setUserProfile(newProfile);
      }
    } catch (error) {
      console.error('Erreur profil Knorr:', error);
    }
  };

  const loadFeed = async () => {
  try {
    // Charger feed personnalisé avec IA
    const personalizedPosts = await knorrAlgorithmService.generatePersonalizedFeed(
      userId,
      20 // Limit
    );
    
    setPosts(personalizedPosts);
    setLoading(false);
  } catch (error) {
    console.error('Erreur feed:', error);
    // Fallback : charger tous les posts
    const q = query(
      collection(db, 'knorr_posts'),
      orderBy('createdAt', 'desc'),
      limit(20)
    );
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const postsData = [];
      querySnapshot.forEach((doc) => {
        postsData.push({ id: doc.id, ...doc.data() });
      });
      setPosts(postsData);
      setLoading(false);
    });
    
    return unsubscribe;
  }
};

  const handleViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      const index = viewableItems[0].index;
      setCurrentIndex(index);

      // Enregistrer la vue
      if (posts[index]) {
        trackView(posts[index].id);
      }
    }
  }).current;

  const trackView = async (postId) => {
    try {
      const postRef = doc(db, 'knorr_posts', postId);
      await updateDoc(postRef, {
        views: increment(1)
      });
    } catch (error) {
      console.error('Erreur tracking vue:', error);
    }
  };

  const handleLike = async (post) => {
    const isLiked = userProfile?.contentPreferences?.likedPosts?.includes(post.id);

    if (isLiked) return; // Déjà liké

    try {
      // Mettre à jour le post
      const postRef = doc(db, 'knorr_posts', post.id);
      await updateDoc(postRef, {
        likes: increment(1)
      });

      // Mettre à jour profil user
      const userRef = doc(db, 'knorr_user_profiles', userId);
      await updateDoc(userRef, {
        'contentPreferences.likedPosts': arrayUnion(post.id),
        knorrXP: increment(2), // +2 XP par like
        rewardPoints: increment(1) // +1 point par like
      });

      // Récompenser le créateur du post
      const creatorRef = doc(db, 'knorr_user_profiles', post.userId);
      await updateDoc(creatorRef, {
        'stats.totalLikes': increment(1),
        knorrXP: increment(5), // +5 XP quand son post est liké
        rewardPoints: increment(2) // +2 points
      });

      // Recharger profil
      loadUserProfile();
    } catch (error) {
      console.error('Erreur like:', error);
    }
  };

  const handleSave = async (postId) => {
    try {
      const userRef = doc(db, 'knorr_user_profiles', userId);
      await updateDoc(userRef, {
        'contentPreferences.savedPosts': arrayUnion(postId)
      });

      Alert.alert('✅ Enregistré !', 'Retrouvez ce post dans vos favoris');
    } catch (error) {
      console.error('Erreur save:', error);
    }
  };

  const renderPost = ({ item, index }) => {
    const isLiked = userProfile?.contentPreferences?.likedPosts?.includes(item.id);
    const isSaved = userProfile?.contentPreferences?.savedPosts?.includes(item.id);

    return (
      <View style={styles.postContainer}>
        {/* Media (Image ou Video) */}
        {item.type === 'video' ? (
          <Video
            source={{ uri: item.mediaUrl }}
            style={styles.media}
            resizeMode="cover"
            shouldPlay={index === currentIndex}
            isLooping
            isMuted={false}
          />
        ) : (
          <Image
            source={{ uri: item.mediaUrl }}
            style={styles.media}
            resizeMode="cover"
          />
        )}

        {/* Gradient overlay */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.gradient}
        />

        {/* Header flottant */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.userInfo}>
            <Image
              source={{ uri: item.userAvatar || 'https://via.placeholder.com/50' }}
              style={styles.avatar}
            />
            <View>
              <Text style={styles.userName}>{item.userName}</Text>
              <View style={styles.levelBadge}>
                <Ionicons name="star" size={12} color="#f39c12" />
                <Text style={styles.levelText}>Niv. {item.userLevel || 1}</Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.followButton}>
            <Text style={styles.followButtonText}>Suivre</Text>
          </TouchableOpacity>
        </View>

        {/* Actions droite (TikTok style) */}
        <View style={styles.actionsRight}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleLike(item)}
          >
            <Ionicons
              name={isLiked ? 'heart' : 'heart-outline'}
              size={32}
              color={isLiked ? '#e74c3c' : '#fff'}
            />
            <Text style={styles.actionText}>{item.likes || 0}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="chatbubble-outline" size={28} color="#fff" />
            <Text style={styles.actionText}>{item.comments || 0}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="arrow-redo-outline" size={28} color="#fff" />
            <Text style={styles.actionText}>{item.shares || 0}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleSave(item.id)}
          >
            <Ionicons
              name={isSaved ? 'bookmark' : 'bookmark-outline'}
              size={28}
              color={isSaved ? '#f39c12' : '#fff'}
            />
            <Text style={styles.actionText}>{item.saves || 0}</Text>
          </TouchableOpacity>

          {/* Logo Knorr tournant */}
          <View style={styles.knorrLogo}>
            <Image
              source={require('../../assets/knorr-logo.png')}
              style={styles.knorrLogoImage}
            />
          </View>
        </View>

        {/* Infos bas (Caption + Produits) */}
        <View style={styles.bottomInfo}>
          <Text style={styles.caption} numberOfLines={2}>
            {item.caption}
          </Text>

          {item.hashtags && item.hashtags.length > 0 && (
            <Text style={styles.hashtags}>
              {item.hashtags.join(' ')}
            </Text>
          )}

          {/* Produits Knorr tagués */}
          {item.knorrProducts && item.knorrProducts.length > 0 && (
            <View style={styles.productsContainer}>
              {item.knorrProducts.map((product, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.productTag}
                  onPress={() => navigation.navigate('KnorrProductDetail', { productId: product.productId })}
                >
                  <Image
                    source={{ uri: 'https://via.placeholder.com/40' }}
                    style={styles.productIcon}
                  />
                  <Text style={styles.productName} numberOfLines={1}>
                    {product.productName}
                  </Text>
                  <Ionicons name="chevron-forward" size={16} color="#fff" />
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Recette si applicable */}
          {item.recipe && (
            <TouchableOpacity
              style={styles.recipeButton}
              onPress={() => navigation.navigate('RecipeDetail', { post: item })}
            >
              <Ionicons name="restaurant" size={20} color="#fff" />
              <Text style={styles.recipeButtonText}>
                Voir la recette ({item.recipe.prepTime + item.recipe.cookTime} min)
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Badge si post sponsorisé */}
        {item.isPromoted && (
          <View style={styles.promotedBadge}>
            <Text style={styles.promotedText}>Sponsorisé par Knorr</Text>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#e63946" />
        <Text style={styles.loadingText}>Chargement du feed Knorr...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <FlatList
        ref={flatListRef}
        data={posts}
        renderItem={renderPost}
        keyExtractor={item => item.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={SCREEN_HEIGHT}
        snapToAlignment="start"
        decelerationRate="fast"
        onViewableItemsChanged={handleViewableItemsChanged}
        viewabilityConfig={{
          itemVisiblePercentThreshold: 50
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="restaurant-outline" size={80} color="#ddd" />
            <Text style={styles.emptyText}>
              Aucun post pour le moment
            </Text>
            <Text style={styles.emptySubtext}>
              Soyez le premier à partager une recette Knorr !
            </Text>
          </View>
        }
      />

      {/* Floating Action Button - Créer post */}
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => navigation.navigate('CreateKnorrPost')}
      >
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>

      {/* Top Navigation Bar (semi-transparent) */}
      <BlurView intensity={80} style={styles.topNav}>
        <TouchableOpacity onPress={() => navigation.navigate('KnorrDiscover')}>
          <Text style={[styles.topNavText, styles.topNavTextActive]}>
            Pour vous
          </Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text style={styles.topNavText}>Suivis</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text style={styles.topNavText}>Tendances</Text>
        </TouchableOpacity>
      </BlurView>

      {/* Bottom Navigation (Points + Boutique) */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.pointsChip}
          onPress={() => navigation.navigate('KnorrShop')}
        >
          <Ionicons name="gift" size={20} color="#f39c12" />
          <Text style={styles.pointsText}>
            {userProfile?.rewardPoints || 0} points
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('KnorrShop')}>
          <Ionicons name="storefront" size={28} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('KnorrProfile')}>
          <Ionicons name="person" size={28} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  loadingText: {
    color: '#fff',
    marginTop: 15,
    fontSize: 16,
  },
  postContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    position: 'relative',
  },
  media: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: SCREEN_HEIGHT * 0.5,
  },
  header: {
    position: 'absolute',
    top: 50,
    left: 15,
    right: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    borderWidth: 2,
    borderColor: '#e63946',
    marginRight: 10,
  },
  userName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginTop: 2,
  },
  levelText: {
    color: '#f39c12',
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
  followButton: {
    backgroundColor: '#e63946',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  followButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  actionsRight: {
    position: 'absolute',
    right: 15,
    bottom: 180,
    alignItems: 'center',
    gap: 20,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  knorrLogo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 3,
    borderColor: '#e63946',
  },
  knorrLogoImage: {
    width: 40,
    height: 40,
  },
  bottomInfo: {
    position: 'absolute',
    bottom: 100,
    left: 15,
    right: 80,
  },
  caption: {
    color: '#fff',
    fontSize: 15,
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  hashtags: {
    color: '#3498db',
    fontSize: 14,
    marginBottom: 12,
    fontWeight: '600',
  },
  productsContainer: {
    gap: 8,
    marginBottom: 12,
  },
  productTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(230, 57, 70, 0.9)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  productIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
  },
  productName: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  recipeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(46, 204, 113, 0.9)',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 25,
    alignSelf: 'flex-start',
  },
  recipeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  promotedBadge: {
    position: 'absolute',
    top: 100,
    left: 15,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  promotedText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 200,
  },
  emptyText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
  },
  emptySubtext: {
    color: '#999',
    fontSize: 14,
    marginTop: 8,
  },
  createButton: {
    position: 'absolute',
    bottom: 120,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#e63946',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  topNav: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 15,
    gap: 30,
  },
  topNavText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 16,
    fontWeight: '600',
  },
  topNavTextActive: {
    color: '#fff',
    fontSize: 18,
    borderBottomWidth: 2,
    borderBottomColor: '#e63946',
    paddingBottom: 5,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 15,
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  pointsChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(243, 156, 18, 0.2)',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#f39c12',
  },
  pointsText: {
    color: '#f39c12',
    fontWeight: 'bold',
    marginLeft: 6,
    fontSize: 14,
  },
});

export default KnorrFeedScreen;
