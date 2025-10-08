import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  Modal,
  Image,
  ScrollView
} from 'react-native';
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  updateDoc,
  doc,
  increment,
  getDoc,
  setDoc
} from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import { Ionicons } from '@expo/vector-icons';

const CommunityScreenV2 = () => {
  const [posts, setPosts] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostType, setNewPostType] = useState('astuce');
  const [productsUsed, setProductsUsed] = useState('');
  const [filter, setFilter] = useState('all'); // all, trending, following
  const [userProfile, setUserProfile] = useState(null);
  const [showChallenges, setShowChallenges] = useState(false);

  const userId = auth.currentUser?.uid;
  const userName = auth.currentUser?.displayName || 'Utilisateur';

  useEffect(() => {
    loadPosts();
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    if (!userId) return;

    try {
      const docRef = doc(db, 'community_profiles', userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setUserProfile(docSnap.data());
      } else {
        // Créer profil communauté
        const newProfile = {
          userId,
          userName,
          level: 1,
          xp: 0,
          badges: [],
          points: 0,
          postsCount: 0,
          likesReceived: 0,
          streak: 0,
          lastPostDate: null,
          achievements: [],
          followers: [],
          following: []
        };
        await setDoc(docRef, newProfile);
        setUserProfile(newProfile);
      }
    } catch (error) {
      console.error('Erreur profil:', error);
    }
  };

  const loadPosts = () => {
    const q = query(
      collection(db, 'posts'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const postsData = [];
      querySnapshot.forEach((doc) => {
        postsData.push({
          id: doc.id,
          ...doc.data()
        });
      });
      setPosts(postsData);
    });

    return unsubscribe;
  };

  const calculateXP = (action) => {
    const xpValues = {
      post: 10,
      like: 2,
      comment: 5,
      share: 8,
      daily_login: 5,
      weekly_challenge: 50,
      monthly_challenge: 200
    };
    return xpValues[action] || 0;
  };

  const checkLevelUp = (currentXP) => {
    // 100 XP par niveau
    const newLevel = Math.floor(currentXP / 100) + 1;
    return newLevel;
  };

  const checkBadges = async (profile) => {
    const newBadges = [];

    // Badge premier post
    if (profile.postsCount === 1 && !profile.badges.includes('first_post')) {
      newBadges.push({ id: 'first_post', name: '🎉 Premier Post', desc: 'Publier son premier post' });
    }

    // Badge 10 posts
    if (profile.postsCount >= 10 && !profile.badges.includes('creator')) {
      newBadges.push({ id: 'creator', name: '✍️ Créateur', desc: '10 publications' });
    }

    // Badge populaire
    if (profile.likesReceived >= 50 && !profile.badges.includes('popular')) {
      newBadges.push({ id: 'popular', name: '⭐ Populaire', desc: '50 likes reçus' });
    }

    // Badge streak 7 jours
    if (profile.streak >= 7 && !profile.badges.includes('consistent')) {
      newBadges.push({ id: 'consistent', name: '🔥 Assidu', desc: '7 jours d\'affilée' });
    }

    // Badge influenceur
    if (profile.followers.length >= 20 && !profile.badges.includes('influencer')) {
      newBadges.push({ id: 'influencer', name: '👑 Influenceur', desc: '20 abonnés' });
    }

    if (newBadges.length > 0) {
      Alert.alert(
        '🎉 Nouveau Badge !',
        `Vous avez débloqué : ${newBadges.map(b => b.name).join(', ')}`,
        [{ text: 'Super !' }]
      );

      // Sauvegarder badges
      const docRef = doc(db, 'community_profiles', userId);
      await updateDoc(docRef, {
        badges: [...profile.badges, ...newBadges.map(b => b.id)]
      });
    }
  };

  const updateStreak = async (profile) => {
    const today = new Date().toDateString();
    const lastPost = profile.lastPostDate ? new Date(profile.lastPostDate).toDateString() : null;

    let newStreak = profile.streak || 0;

    if (lastPost === today) {
      // Déjà posté aujourd'hui
      return newStreak;
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    if (lastPost === yesterdayStr) {
      // Continue la série
      newStreak += 1;
    } else if (!lastPost) {
      // Premier post
      newStreak = 1;
    } else {
      // Série cassée
      newStreak = 1;
    }

    const docRef = doc(db, 'community_profiles', userId);
    await updateDoc(docRef, {
      streak: newStreak,
      lastPostDate: new Date()
    });

    if (newStreak === 7 || newStreak === 30) {
      Alert.alert('🔥 Série !', `${newStreak} jours d'affilée ! Continuez comme ça !`);
    }

    return newStreak;
  };

  const createPost = async () => {
    if (!newPostContent.trim()) {
      Alert.alert('Erreur', 'Veuillez écrire quelque chose');
      return;
    }

    try {
      // Créer le post
      await addDoc(collection(db, 'posts'), {
        userId,
        userName,
        content: newPostContent,
        type: newPostType,
        productsUsed: productsUsed.split(',').map(p => p.trim()).filter(Boolean),
        likes: 0,
        likedBy: [],
        comments: [],
        shares: 0,
        createdAt: new Date(),
        imageUrl: null
      });

      // Gagner XP
      const xpGained = calculateXP('post');
      const newXP = (userProfile?.xp || 0) + xpGained;
      const newLevel = checkLevelUp(newXP);
      const oldLevel = userProfile?.level || 1;

      // Mettre à jour le profil
      const docRef = doc(db, 'community_profiles', userId);
      const updatedProfile = {
        xp: newXP,
        level: newLevel,
        points: increment(10),
        postsCount: increment(1)
      };

      await updateDoc(docRef, updatedProfile);

      // Mise à jour streak
      const newStreak = await updateStreak(userProfile);

      // Vérifier level up
      if (newLevel > oldLevel) {
        Alert.alert(
          '🎉 Level Up !',
          `Félicitations ! Vous êtes maintenant niveau ${newLevel}`,
          [{ text: 'Génial !' }]
        );
      }

      // Vérifier badges
      await checkBadges({
        ...userProfile,
        postsCount: (userProfile?.postsCount || 0) + 1,
        streak: newStreak
      });

      setNewPostContent('');
      setProductsUsed('');
      setShowCreateModal(false);

      Alert.alert('Succès', `Publication créée ! +${xpGained} XP`);

      // Recharger profil
      await loadUserProfile();
    } catch (error) {
      console.error('Erreur création post:', error);
      Alert.alert('Erreur', 'Impossible de créer la publication');
    }
  };

  const likePost = async (postId, currentLikes, likedBy = []) => {
    if (likedBy.includes(userId)) {
      Alert.alert('Info', 'Vous avez déjà liké ce post');
      return;
    }

    try {
      const postRef = doc(db, 'posts', postId);
      await updateDoc(postRef, {
        likes: increment(1),
        likedBy: [...likedBy, userId]
      });

      // Gagner XP
      const xpGained = calculateXP('like');
      const docRef = doc(db, 'community_profiles', userId);
      await updateDoc(docRef, {
        xp: increment(xpGained),
        points: increment(2)
      });

      // Recharger profil
      await loadUserProfile();
    } catch (error) {
      console.error('Erreur like:', error);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'recette': return '👨‍🍳';
      case 'astuce': return '💡';
      case 'avis': return '⭐';
      case 'defi': return '🏆';
      default: return '📝';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'recette': return '#e74c3c';
      case 'astuce': return '#f39c12';
      case 'avis': return '#9b59b6';
      case 'defi': return '#2ecc71';
      default: return '#95a5a6';
    }
  };

  const getLevelColor = (level) => {
    if (level >= 20) return '#e74c3c'; // Rouge (Expert)
    if (level >= 10) return '#9b59b6'; // Violet (Avancé)
    if (level >= 5) return '#3498db'; // Bleu (Intermédiaire)
    return '#2ecc71'; // Vert (Débutant)
  };

  const renderPost = ({ item }) => {
    const isLiked = item.likedBy?.includes(userId);

    return (
      <View style={styles.post}>
        <View style={styles.postHeader}>
          <View style={styles.userInfo}>
            <View style={[styles.avatar, { backgroundColor: getLevelColor(item.userLevel || 1) }]}>
              <Text style={styles.avatarText}>
                {item.userName.charAt(0).toUpperCase()}
              </Text>
              <View style={styles.levelBadge}>
                <Text style={styles.levelText}>{item.userLevel || 1}</Text>
              </View>
            </View>
            <View>
              <Text style={styles.userName}>{item.userName}</Text>
              <Text style={styles.postDate}>
                {new Date(item.createdAt.toDate()).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Text>
            </View>
          </View>
          <View style={[styles.typeBadge, { backgroundColor: getTypeColor(item.type) }]}>
            <Text style={styles.typeIcon}>{getTypeIcon(item.type)}</Text>
            <Text style={styles.typeText}>{item.type}</Text>
          </View>
        </View>

        <Text style={styles.postContent}>{item.content}</Text>

        {item.productsUsed && item.productsUsed.length > 0 && (
          <View style={styles.productsSection}>
            <Text style={styles.productsLabel}>Produits mentionnés :</Text>
            <View style={styles.productTags}>
              {item.productsUsed.map((product, index) => (
                <View key={index} style={styles.productTag}>
                  <Text style={styles.productTagText}>{product}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.postActions}>
          <TouchableOpacity
            style={[styles.actionButton, isLiked && styles.actionButtonActive]}
            onPress={() => likePost(item.id, item.likes, item.likedBy)}
          >
            <Ionicons
              name={isLiked ? 'heart' : 'heart-outline'}
              size={20}
              color={isLiked ? '#e74c3c' : '#666'}
            />
            <Text style={[styles.actionText, isLiked && styles.actionTextActive]}>
              {item.likes || 0}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="chatbubble-outline" size={20} color="#666" />
            <Text style={styles.actionText}>{item.comments?.length || 0}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="share-social-outline" size={20} color="#666" />
            <Text style={styles.actionText}>{item.shares || 0}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header avec profil utilisateur */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>Communauté</Text>
        </View>
        <View style={styles.headerRight}>
          {userProfile && (
            <TouchableOpacity style={styles.profileChip}>
              <View style={[styles.miniAvatar, { backgroundColor: getLevelColor(userProfile.level) }]}>
                <Text style={styles.miniAvatarText}>
                  {userName.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileLevel}>Niv. {userProfile.level}</Text>
                <Text style={styles.profileXP}>{userProfile.xp} XP</Text>
              </View>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => setShowCreateModal(true)}
          >
            <Ionicons name="add-circle" size={28} color="#2ecc71" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Badges de l'utilisateur */}
      {userProfile && userProfile.badges.length > 0 && (
        <ScrollView
          horizontal
          style={styles.badgesScroll}
          showsHorizontalScrollIndicator={false}
        >
          {userProfile.badges.map((badge, index) => (
            <View key={index} style={styles.badgeChip}>
              <Text style={styles.badgeEmoji}>
                {badge === 'first_post' ? '🎉' :
                 badge === 'creator' ? '✍️' :
                 badge === 'popular' ? '⭐' :
                 badge === 'consistent' ? '🔥' :
                 badge === 'influencer' ? '👑' : '🏆'}
              </Text>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Streak indicator */}
      {userProfile && userProfile.streak > 0 && (
        <View style={styles.streakBanner}>
          <Ionicons name="flame" size={20} color="#f39c12" />
          <Text style={styles.streakText}>
            🔥 Série de {userProfile.streak} jour{userProfile.streak > 1 ? 's' : ''} !
          </Text>
        </View>
      )}

      {/* Filtres */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'all' && styles.filterActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
            Tous
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'trending' && styles.filterActive]}
          onPress={() => setFilter('trending')}
        >
          <Text style={[styles.filterText, filter === 'trending' && styles.filterTextActive]}>
            🔥 Tendances
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'following' && styles.filterActive]}
          onPress={() => setFilter('following')}
        >
          <Text style={[styles.filterText, filter === 'following' && styles.filterTextActive]}>
            Abonnements
          </Text>
        </TouchableOpacity>
      </View>

      {/* Défis hebdomadaires */}
      <TouchableOpacity
        style={styles.challengeBanner}
        onPress={() => setShowChallenges(true)}
      >
        <Ionicons name="trophy" size={24} color="#f39c12" />
        <View style={styles.challengeInfo}>
          <Text style={styles.challengeTitle}>🏆 Défis Hebdomadaires</Text>
          <Text style={styles.challengeSubtitle}>3 défis disponibles - Gagnez jusqu'à 150 XP !</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#999" />
      </TouchableOpacity>

      {/* Liste des posts */}
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubbles-outline" size={80} color="#ddd" />
            <Text style={styles.emptyText}>
              Aucune publication pour le moment
            </Text>
            <Text style={styles.emptySubtext}>
              Soyez le premier à partager !
            </Text>
          </View>
        }
      />

      {/* Modal création post */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nouvelle publication</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <Ionicons name="close" size={28} color="#333" />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Type de publication</Text>
            <View style={styles.typeButtons}>
              {['astuce', 'recette', 'avis', 'defi'].map(type => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeButton,
                    newPostType === type && {
                      backgroundColor: getTypeColor(type)
                    }
                  ]}
                  onPress={() => setNewPostType(type)}
                >
                  <Text style={styles.typeButtonIcon}>{getTypeIcon(type)}</Text>
                  <Text style={[
                    styles.typeButtonText,
                    newPostType === type && styles.typeButtonTextActive
                  ]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Votre message</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Partagez une astuce, une recette, un défi..."
              value={newPostContent}
              onChangeText={setNewPostContent}
              multiline
              numberOfLines={6}
            />

            <Text style={styles.label}>Produits utilisés (optionnel)</Text>
            <TextInput
              style={styles.input}
              placeholder="Séparez par des virgules"
              value={productsUsed}
              onChangeText={setProductsUsed}
            />

            <View style={styles.xpPreview}>
              <Ionicons name="star" size={20} color="#f39c12" />
              <Text style={styles.xpPreviewText}>
                Vous gagnerez +10 XP en publiant
              </Text>
            </View>

            <TouchableOpacity
              style={styles.publishButton}
              onPress={createPost}
            >
              <Text style={styles.publishButtonText}>Publier</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal Défis */}
      <Modal
        visible={showChallenges}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowChallenges(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>🏆 Défis Hebdomadaires</Text>
              <TouchableOpacity onPress={() => setShowChallenges(false)}>
                <Ionicons name="close" size={28} color="#333" />
              </TouchableOpacity>
            </View>

            <View style={styles.challengesList}>
              <View style={styles.challengeItem}>
                <View style={styles.challengeIcon}>
                  <Text style={styles.challengeEmoji}>📸</Text>
                </View>
                <View style={styles.challengeDetails}>
                  <Text style={styles.challengeName}>Scanner 10 produits</Text>
                  <Text style={styles.challengeReward}>+50 XP</Text>
                  <View style={styles.challengeProgress}>
                    <View style={[styles.challengeProgressBar, { width: '40%' }]} />
                  </View>
                  <Text style={styles.challengeProgressText}>4/10</Text>
                </View>
              </View>

              <View style={styles.challengeItem}>
                <View style={styles.challengeIcon}>
                  <Text style={styles.challengeEmoji}>💬</Text>
                </View>
                <View style={styles.challengeDetails}>
                  <Text style={styles.challengeName}>Publier 3 astuces</Text>
                  <Text style={styles.challengeReward}>+50 XP</Text>
                  <View style={styles.challengeProgress}>
                    <View style={[styles.challengeProgressBar, { width: '33%' }]} />
                  </View>
                  <Text style={styles.challengeProgressText}>1/3</Text>
                </View>
              </View>

              <View style={styles.challengeItem}>
                <View style={styles.challengeIcon}>
                  <Text style={styles.challengeEmoji}>❤️</Text>
                </View>
                <View style={styles.challengeDetails}>
                  <Text style={styles.challengeName}>Recevoir 20 likes</Text>
                  <Text style={styles.challengeReward}>+50 XP</Text>
                  <View style={styles.challengeProgress}>
                    <View style={[styles.challengeProgressBar, { width: '60%' }]} />
                  </View>
                  <Text style={styles.challengeProgressText}>12/20</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  profileChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  miniAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  miniAvatarText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  profileInfo: {
    alignItems: 'flex-start',
  },
  profileLevel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  profileXP: {
    fontSize: 10,
    color: '#666',
  },
  createButton: {
    padding: 5,
  },
  badgesScroll: {
    maxHeight: 50,
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  badgeChip: {
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeEmoji: {
    fontSize: 20,
  },
  streakBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff3cd',
    padding: 10,
  },
  streakText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#856404',
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingVertical: 10,
    gap: 10,
    backgroundColor: '#fff',
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  filterActive: {
    backgroundColor: '#2ecc71',
    borderColor: '#2ecc71',
  },
  filterText: {
    fontSize: 14,
    color: '#666',
  },
  filterTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  challengeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff9e6',
    padding: 15,
    marginHorizontal: 15,
    marginVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f39c12',
  },
  challengeInfo: {
    flex: 1,
    marginLeft: 12,
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  challengeSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  list: {
    padding: 15,
  },
  post: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    position: 'relative',
  },
  avatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  levelBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#fff',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#f39c12',
  },
  levelText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#f39c12',
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  postDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  typeIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  typeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  postContent: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
    marginBottom: 12,
  },
  productsSection: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  productsLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  productTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  productTag: {
    backgroundColor: '#e8f4fd',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 6,
  },
  productTagText: {
    color: '#3498db',
    fontSize: 13,
  },
  postActions: {
    flexDirection: 'row',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionButtonActive: {
    // Style actif
  },
  actionText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  actionTextActive: {
    color: '#e74c3c',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
    marginTop: 20,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#bbb',
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
    marginTop: 15,
  },
  typeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 10,
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ddd',
  },
  typeButtonIcon: {
    fontSize: 20,
    marginRight: 6,
  },
  typeButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  typeButtonTextActive: {
    color: '#fff',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  xpPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff9e6',
    padding: 12,
    borderRadius: 8,
    marginTop: 15,
  },
  xpPreviewText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#f39c12',
  },
  publishButton: {
    backgroundColor: '#2ecc71',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  publishButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  challengesList: {
    marginTop: 20,
  },
  challengeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  challengeIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  challengeEmoji: {
    fontSize: 32,
  },
  challengeDetails: {
    flex: 1,
  },
  challengeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  challengeReward: {
    fontSize: 14,
    color: '#f39c12',
    fontWeight: '600',
    marginBottom: 8,
  },
  challengeProgress: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  challengeProgressBar: {
    height: '100%',
    backgroundColor: '#2ecc71',
  },
  challengeProgressText: {
    fontSize: 12,
    color: '#666',
  },
});

export default CommunityScreenV2;
