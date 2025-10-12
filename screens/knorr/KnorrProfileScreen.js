import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  FlatList,
  StyleSheet,
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  increment,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { auth, db } from '../../firebaseConfig';
import { Ionicons } from '@expo/vector-icons';

const KnorrProfileScreen = ({ route, navigation }) => {
  const [userProfile, setUserProfile] = useState(null);
  const [knorrProfile, setKnorrProfile] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts'); // posts, badges, stats

  const profileUserId = route.params?.userId || auth.currentUser?.uid;
  const currentUserId = auth.currentUser?.uid;
  const isOwnProfile = profileUserId === currentUserId;

  useEffect(() => {
    loadProfile();
  }, [profileUserId]);

  const loadProfile = async () => {
    try {
      // Profil utilisateur
      const userDoc = await getDoc(doc(db, 'users', profileUserId));
      if (userDoc.exists()) {
        setUserProfile(userDoc.data());
      }

      // Profil Knorr
      const knorrDoc = await getDoc(doc(db, 'knorr_user_profiles', profileUserId));
      if (knorrDoc.exists()) {
        const data = knorrDoc.data();
        setKnorrProfile(data);
        
        // Vérifier si on suit cet utilisateur
        if (!isOwnProfile) {
          setIsFollowing(data.followers?.includes(currentUserId) || false);
        }
      }

      // Posts de l'utilisateur
      const postsQuery = query(
        collection(db, 'knorr_posts'),
        where('userId', '==', profileUserId),
        where('status', '==', 'active')
      );
      const postsSnapshot = await getDocs(postsQuery);
      const posts = [];
      postsSnapshot.forEach(doc => {
        posts.push({ id: doc.id, ...doc.data() });
      });
      setUserPosts(posts.sort((a, b) => b.createdAt - a.createdAt));

    } catch (error) {
      console.error('Erreur chargement profil:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    try {
      const targetUserRef = doc(db, 'knorr_user_profiles', profileUserId);
      const currentUserRef = doc(db, 'knorr_user_profiles', currentUserId);

      if (isFollowing) {
        // Unfollow
        await updateDoc(targetUserRef, {
          followers: arrayRemove(currentUserId)
        });
        await updateDoc(currentUserRef, {
          following: arrayRemove(profileUserId)
        });
        setIsFollowing(false);

        // Mettre à jour le state local
        setKnorrProfile({
          ...knorrProfile,
          followers: knorrProfile.followers.filter(id => id !== currentUserId)
        });

      } else {
        // Follow
        await updateDoc(targetUserRef, {
          followers: arrayUnion(currentUserId)
        });
        await updateDoc(currentUserRef, {
          following: arrayUnion(profileUserId),
          knorrXP: increment(5) // +5 XP pour suivre quelqu'un
        });
        setIsFollowing(true);

        // Mettre à jour le state local
        setKnorrProfile({
          ...knorrProfile,
          followers: [...(knorrProfile.followers || []), currentUserId]
        });
      }

    } catch (error) {
      console.error('Erreur follow:', error);
    }
  };

  const getLevelColor = (level) => {
    if (level >= 20) return '#e74c3c'; // Rouge (Expert)
    if (level >= 10) return '#9b59b6'; // Violet (Avancé)
    if (level >= 5) return '#3498db'; // Bleu (Intermédiaire)
    return '#2ecc71'; // Vert (Débutant)
  };

  const getLevelName = (level) => {
    if (level >= 20) return 'Chef Knorr';
    if (level >= 10) return 'Cuisinier Pro';
    if (level >= 5) return 'Apprenti Chef';
    return 'Débutant';
  };

  const renderPost = ({ item }) => (
    <TouchableOpacity
      style={styles.postThumbnail}
      onPress={() => navigation.navigate('KnorrFeed', { initialPostId: item.id })}
    >
      <Image
        source={{ uri: item.mediaUrl }}
        style={styles.postImage}
      />
      {item.type === 'video' && (
        <View style={styles.videoIcon}>
          <Ionicons name="play" size={24} color="#fff" />
        </View>
      )}
      <View style={styles.postStats}>
        <View style={styles.postStat}>
          <Ionicons name="heart" size={16} color="#fff" />
          <Text style={styles.postStatText}>{item.likes || 0}</Text>
        </View>
        <View style={styles.postStat}>
          <Ionicons name="eye" size={16} color="#fff" />
          <Text style={styles.postStatText}>{item.views || 0}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const BADGES_DATA = [
    { id: 'first_post', name: 'Premier Post', icon: '🎉', desc: 'Publier son 1er post' },
    { id: 'creator', name: 'Créateur', icon: '✍️', desc: '10 publications' },
    { id: 'popular', name: 'Populaire', icon: '⭐', desc: '50 likes reçus' },
    { id: 'consistent', name: 'Assidu', icon: '🔥', desc: '7 jours consécutifs' },
    { id: 'influencer', name: 'Influenceur', icon: '👑', desc: '20 abonnés' },
    { id: 'chef', name: 'Chef Knorr', icon: '👨‍🍳', desc: 'Niveau 20 atteint' },
    { id: 'viral', name: 'Viral', icon: '🚀', desc: 'Post avec 1000+ vues' },
  ];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#e63946" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header Background */}
      <LinearGradient
        colors={[getLevelColor(knorrProfile?.knorrLevel || 1), '#fff']}
        style={styles.headerGradient}
      >
        {/* Close Button */}
        <TouchableOpacity 
          style={styles.closeButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>

        {/* Avatar & Info */}
        <View style={styles.profileHeader}>
          <View style={[
            styles.avatar,
            { borderColor: getLevelColor(knorrProfile?.knorrLevel || 1) }
          ]}>
            {userProfile?.photoURL ? (
              <Image
                source={{ uri: userProfile.photoURL }}
                style={styles.avatarImage}
              />
            ) : (
              <Text style={styles.avatarText}>
                {userProfile?.displayName?.charAt(0).toUpperCase() || '?'}
              </Text>
            )}
          </View>

          <Text style={styles.userName}>{userProfile?.displayName || 'Utilisateur'}</Text>
          
          <View style={styles.levelBadge}>
            <Ionicons name="star" size={16} color="#f39c12" />
            <Text style={styles.levelText}>
              Niv. {knorrProfile?.knorrLevel || 1} - {getLevelName(knorrProfile?.knorrLevel || 1)}
            </Text>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statNumber}>{userPosts.length}</Text>
              <Text style={styles.statLabel}>Posts</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statNumber}>{knorrProfile?.followers?.length || 0}</Text>
              <Text style={styles.statLabel}>Abonnés</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statNumber}>{knorrProfile?.following?.length || 0}</Text>
              <Text style={styles.statLabel}>Abonnements</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statNumber}>{knorrProfile?.rewardPoints || 0}</Text>
              <Text style={styles.statLabel}>Points</Text>
            </View>
          </View>

          {/* XP Progress */}
          <View style={styles.xpContainer}>
            <View style={styles.xpBar}>
              <View 
                style={[
                  styles.xpProgress,
                  { width: `${((knorrProfile?.knorrXP || 0) % 100)}%` }
                ]}
              />
            </View>
            <Text style={styles.xpText}>
              {knorrProfile?.knorrXP || 0} XP / {((Math.floor((knorrProfile?.knorrXP || 0) / 100) + 1) * 100)} XP
            </Text>
          </View>

          {/* Follow Button */}
          {!isOwnProfile && (
            <TouchableOpacity
              style={[
                styles.followButton,
                isFollowing && styles.followingButton
              ]}
              onPress={handleFollow}
            >
              <Ionicons 
                name={isFollowing ? "checkmark" : "add"} 
                size={20} 
                color="#fff" 
              />
              <Text style={styles.followButtonText}>
                {isFollowing ? 'Abonné' : 'Suivre'}
              </Text>
            </TouchableOpacity>
          )}

          {isOwnProfile && (
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => navigation.navigate('Profile')}
            >
              <Ionicons name="create" size={20} color="#666" />
              <Text style={styles.editButtonText}>Modifier le profil</Text>
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'posts' && styles.tabActive]}
          onPress={() => setActiveTab('posts')}
        >
          <Ionicons 
            name="grid" 
            size={24} 
            color={activeTab === 'posts' ? '#e63946' : '#999'} 
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'badges' && styles.tabActive]}
          onPress={() => setActiveTab('badges')}
        >
          <Ionicons 
            name="trophy" 
            size={24} 
            color={activeTab === 'badges' ? '#e63946' : '#999'} 
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'stats' && styles.tabActive]}
          onPress={() => setActiveTab('stats')}
        >
          <Ionicons 
            name="stats-chart" 
            size={24} 
            color={activeTab === 'stats' ? '#e63946' : '#999'} 
          />
        </TouchableOpacity>
      </View>

      {/* Content */}
      {activeTab === 'posts' && (
        <FlatList
          data={userPosts}
          renderItem={renderPost}
          keyExtractor={item => item.id}
          numColumns={3}
          scrollEnabled={false}
          columnWrapperStyle={styles.postsRow}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="camera-outline" size={80} color="#ddd" />
              <Text style={styles.emptyText}>
                {isOwnProfile ? 'Aucune publication' : 'Pas encore de posts'}
              </Text>
              {isOwnProfile && (
                <TouchableOpacity
                  style={styles.createPostButton}
                  onPress={() => navigation.navigate('CreateKnorrPost')}
                >
                  <Text style={styles.createPostButtonText}>Créer un post</Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      )}

      {activeTab === 'badges' && (
        <View style={styles.badgesContainer}>
          {BADGES_DATA.map(badge => {
            const isUnlocked = knorrProfile?.badges?.includes(badge.id);
            return (
              <View
                key={badge.id}
                style={[
                  styles.badgeCard,
                  !isUnlocked && styles.badgeCardLocked
                ]}
              >
                <Text style={styles.badgeIcon}>{badge.icon}</Text>
                <Text style={[
                  styles.badgeName,
                  !isUnlocked && styles.badgeNameLocked
                ]}>
                  {badge.name}
                </Text>
                <Text style={styles.badgeDesc}>{badge.desc}</Text>
                {!isUnlocked && (
                  <View style={styles.lockedOverlay}>
                    <Ionicons name="lock-closed" size={32} color="#999" />
                  </View>
                )}
              </View>
            );
          })}
        </View>
      )}

      {activeTab === 'stats' && (
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="eye" size={32} color="#3498db" />
            <Text style={styles.statCardNumber}>
              {knorrProfile?.stats?.totalViews || 0}
            </Text>
            <Text style={styles.statCardLabel}>Vues totales</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="heart" size={32} color="#e74c3c" />
            <Text style={styles.statCardNumber}>
              {knorrProfile?.stats?.totalLikes || 0}
            </Text>
            <Text style={styles.statCardLabel}>Likes reçus</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="chatbubble" size={32} color="#9b59b6" />
            <Text style={styles.statCardNumber}>
              {knorrProfile?.stats?.totalComments || 0}
            </Text>
            <Text style={styles.statCardLabel}>Commentaires</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="share-social" size={32} color="#2ecc71" />
            <Text style={styles.statCardNumber}>
              {knorrProfile?.stats?.totalShares || 0}
            </Text>
            <Text style={styles.statCardLabel}>Partages</Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerGradient: {
    paddingBottom: 30,
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
    padding: 8,
  },
  profileHeader: {
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatarImage: {
    width: 92,
    height: 92,
    borderRadius: 46,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#666',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(243, 156, 18, 0.2)',
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 20,
  },
  levelText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
    color: '#f39c12',
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 25,
  },
  stat: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  xpContainer: {
    width: '100%',
    marginBottom: 20,
  },
  xpBar: {
    height: 8,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 5,
  },
  xpProgress: {
    height: '100%',
    backgroundColor: '#f39c12',
  },
  xpText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  followButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e63946',
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 25,
  },
  followingButton: {
    backgroundColor: '#95a5a6',
  },
  followButtonText: {
    marginLeft: 8,
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 25,
  },
  editButtonText: {
    marginLeft: 8,
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#e63946',
  },
  postsRow: {
    gap: 2,
  },
  postThumbnail: {
    width: '33%',
    aspectRatio: 1,
    position: 'relative',
  },
  postImage: {
    width: '100%',
    height: '100%',
  },
  videoIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  postStats: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    flexDirection: 'row',
    gap: 10,
  },
  postStat: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
  },
  postStatText: {
    color: '#fff',
    fontSize: 11,
    marginLeft: 3,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 20,
  },
  createPostButton: {
    marginTop: 20,
    backgroundColor: '#e63946',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  createPostButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  badgesContainer: {
    padding: 15,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  badgeCard: {
    width: '47%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    position: 'relative',
  },
  badgeCardLocked: {
    opacity: 0.5,
  },
  badgeIcon: {
    fontSize: 48,
    marginBottom: 10,
  },
  badgeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 5,
  },
  badgeNameLocked: {
    color: '#999',
  },
  badgeDesc: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  lockedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  statsContainer: {
    padding: 15,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  statCard: {
    width: '47%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statCardNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
  },
  statCardLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
});

export default KnorrProfileScreen;