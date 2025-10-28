import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Dimensions,
  RefreshControl,
  Alert,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/apiService';
import GamificationPanel from '../../components/GamificationPanel';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const POST_SIZE = (SCREEN_WIDTH - 6) / 3; // Grille 3 colonnes

const KnorrProfileScreen = ({ route, navigation }) => {
  const { user, logout } = useAuth();
  const currentUserId = user?.id;
  const profileUserId = route.params?.userId || currentUserId;
  const isOwnProfile = profileUserId === currentUserId;

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState('grid'); // 'grid', 'list', 'gamification'

  useEffect(() => {
    loadProfile();
    loadPosts();
  }, [profileUserId]);

  const loadProfile = async () => {
    try {
      const data = await apiService.getKnorrProfile(profileUserId);
      setProfile(data);
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const loadPosts = async () => {
    try {
      setLoading(true);
      const data = await apiService.getPosts(profileUserId);
      setPosts(data);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadProfile(), loadPosts()]);
    setRefreshing(false);
  };

  const handleFollow = async () => {
    if (!profile || !currentUserId) return;
    try {
      const isFollowing = profile.followers?.includes(currentUserId);
      if (isFollowing) {
        await apiService.unfollowUser(profileUserId, currentUserId);
        setProfile({
          ...profile,
          followers: profile.followers.filter(id => id !== currentUserId),
        });
      } else {
        await apiService.followUser(profileUserId, currentUserId);
        setProfile({
          ...profile,
          followers: [...(profile.followers || []), currentUserId],
        });
      }
    } catch (error) {
      console.error('Error following/unfollowing:', error);
    }
  };

  const renderPostGrid = ({ item }) => (
    <TouchableOpacity
      style={styles.gridPost}
      onPress={() => navigation.navigate('KnorrPostDetail', { postId: item.id })}
    >
      <Image
        source={{ uri: item.mediaUrl || 'https://via.placeholder.com/300' }}
        style={styles.gridPostImage}
      />
      {item.isRecipe && (
        <View style={styles.recipeBadge}>
          <Ionicons name="restaurant" size={16} color="#fff" />
        </View>
      )}
      <View style={styles.gridPostOverlay}>
        <View style={styles.gridPostStat}>
          <Ionicons name="heart" size={16} color="#fff" />
          <Text style={styles.gridPostStatText}>{item.likes}</Text>
        </View>
        <View style={styles.gridPostStat}>
          <Ionicons name="eye" size={16} color="#fff" />
          <Text style={styles.gridPostStatText}>{item.views}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading && !profile) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#006e3e" />
        <Text style={styles.loadingText}>Chargement du profil...</Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={64} color="#006e3e" />
        <Text style={styles.errorText}>Profil introuvable</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isFollowing = profile.followers?.includes(currentUserId);
  const nextLevelXP = (profile.knorrLevel || 1) * 100;
  const xpProgress = ((profile.knorrXP || 0) % 100) / 100;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header avec gradient */}
      <LinearGradient colors={['#006e3e', '#265440']} style={styles.header}>
        <TouchableOpacity style={styles.headerBack} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>

        {isOwnProfile && (
          <TouchableOpacity
            style={styles.headerRight}
            onPress={() => navigation.navigate('KnorrSettings')}
          >
            <Ionicons name="settings" size={28} color="#fff" />
          </TouchableOpacity>
        )}
      </LinearGradient>

      {/* Avatar et infos profil */}
      <View style={styles.profileSection}>
        <View style={styles.avatarContainer}>
          <Image
            source={{
              uri:
                user?.photoURL ||
                profile.avatarUrl ||
                'https://via.placeholder.com/120',
            }}
            style={styles.avatar}
          />
          <View style={styles.levelBadge}>
            <Ionicons name="star" size={16} color="#f39c12" />
            <Text style={styles.levelText}>{profile.knorrLevel ?? 1}</Text>
          </View>
        </View>

        <Text style={styles.userName}>
          {user?.displayName || user?.name || profile.displayName || 'Utilisateur Knorr'}
        </Text>

        {/* XP Progress */}
        <View style={styles.xpContainer}>
          <View style={styles.xpBarBackground}>
            <View style={[styles.xpBarFill, { width: `${xpProgress * 100}%` }]} />
          </View>
          <Text style={styles.xpText}>
            {(profile.knorrXP || 0) % 100} / {nextLevelXP} XP
          </Text>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{posts.length}</Text>
            <Text style={styles.statLabel}>Posts</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{profile.followers?.length || 0}</Text>
            <Text style={styles.statLabel}>Abonnés</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{profile.following?.length || 0}</Text>
            <Text style={styles.statLabel}>Abonnements</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{profile.rewardPoints || 0}</Text>
            <Text style={styles.statLabel}>Points</Text>
          </View>
        </View>

        {/* Boutons d'action */}
        {!isOwnProfile && (
          <TouchableOpacity
            style={[styles.followButton, isFollowing && styles.followingButton]}
            onPress={handleFollow}
          >
            <Text style={[styles.followButtonText, isFollowing && styles.followingButtonText]}>
              {isFollowing ? 'Abonné' : "S'abonner"}
            </Text>
          </TouchableOpacity>
        )}

        {isOwnProfile && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => navigation.navigate('KnorrEditProfile', { userId: profileUserId })}
            >
              <Ionicons name="create" size={20} color="#666" />
              <Text style={styles.editButtonText}>Modifier le profil</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.rewardsButton}
              onPress={() => navigation.navigate('KnorrShop')}
            >
              <Ionicons name="gift" size={20} color="#006e3e" />
              <Text style={styles.rewardsButtonText}>Boutique</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Badges */}
        {profile.badges?.length > 0 && (
          <View style={styles.badgesSection}>
            <Text style={styles.badgesSectionTitle}>🏆 Badges</Text>
            <View style={styles.badgesRow}>
              {profile.badges.map((badge, index) => (
                <View key={index} style={styles.badgeItem}>
                  <Text style={styles.badgeEmoji}>{badge.emoji || '🏅'}</Text>
                  <Text style={styles.badgeName}>{badge.name}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'grid' && styles.tabActive]}
          onPress={() => setSelectedTab('grid')}
        >
          <Ionicons name="grid" size={24} color={selectedTab === 'grid' ? '#006e3e' : '#999'} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'gamification' && styles.tabActive]}
          onPress={() => setSelectedTab('gamification')}
        >
          <Ionicons name="game-controller" size={24} color={selectedTab === 'gamification' ? '#006e3e' : '#999'} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'list' && styles.tabActive]}
          onPress={() => setSelectedTab('list')}
        >
          <Ionicons name="list" size={24} color={selectedTab === 'list' ? '#006e3e' : '#999'} />
        </TouchableOpacity>
      </View>

      {/* Contenu selon le tab */}
      {selectedTab === 'gamification' ? (
        <GamificationPanel profile={profile} navigation={navigation} />
      ) : posts.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="images-outline" size={64} color="#ccc" />
          <Text style={styles.emptyStateText}>
            {isOwnProfile ? 'Aucun post publié' : "Cet utilisateur n'a pas encore publié"}
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
      ) : (
        <FlatList
          data={posts}
          renderItem={renderPostGrid}
          keyExtractor={(item) => item.id}
          numColumns={3}
          scrollEnabled={false}
          contentContainerStyle={styles.postsGrid}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, fontSize: 16, color: '#666' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  errorText: { fontSize: 18, color: '#666', marginTop: 15, textAlign: 'center' },
  backText: { color: '#006e3e', marginTop: 10, fontWeight: '600' },
  header: { height: 150, paddingTop: Platform.OS === 'ios' ? 50 : 30 },
  headerBack: { position: 'absolute', top: 50, left: 20, zIndex: 10 },
  headerRight: { position: 'absolute', top: 50, right: 20, zIndex: 10 },
  profileSection: { alignItems: 'center', paddingHorizontal: 20, marginTop: -60 },
  avatarContainer: { position: 'relative' },
  avatar: { width: 120, height: 120, borderRadius: 60, borderWidth: 4, borderColor: '#fff' },
  levelBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#f39c12',
  },
  levelText: { marginLeft: 4, fontSize: 14, fontWeight: 'bold', color: '#f39c12' },
  userName: { fontSize: 24, fontWeight: 'bold', color: '#333', marginTop: 15 },
  xpContainer: { width: '100%', marginTop: 15 },
  xpBarBackground: { height: 8, backgroundColor: '#f0f0f0', borderRadius: 4, overflow: 'hidden' },
  xpBarFill: { height: '100%', backgroundColor: '#f39c12' },
  xpText: { textAlign: 'center', fontSize: 12, color: '#666', marginTop: 5 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginTop: 20 },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  statLabel: { fontSize: 12, color: '#999', marginTop: 4 },
  followButton: {
    backgroundColor: '#006e3e',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
    marginTop: 20,
  },
  followingButton: { backgroundColor: '#fff', borderWidth: 2, borderColor: '#006e3e' },
  followButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  followingButtonText: { color: '#006e3e' },
  actionButtons: { flexDirection: 'row', gap: 10, marginTop: 20, width: '100%' },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    paddingVertical: 12,
    borderRadius: 8,
  },
  editButtonText: { marginLeft: 8, fontSize: 14, fontWeight: '600', color: '#666' },
  rewardsButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#006e3e',
    paddingVertical: 12,
    borderRadius: 8,
  },
  rewardsButtonText: { marginLeft: 8, fontSize: 14, fontWeight: '600', color: '#006e3e' },
  badgesSection: { width: '100%', marginTop: 20 },
  badgesSectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  badgesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  badgeItem: { alignItems: 'center', width: 70 },
  badgeEmoji: { fontSize: 32 },
  badgeName: { fontSize: 10, color: '#666', textAlign: 'center', marginTop: 4 },
  tabsContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#f0f0f0',
    marginTop: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: '#006e3e' },
  postsGrid: { paddingHorizontal: 1 },
  gridPost: { width: POST_SIZE, height: POST_SIZE, margin: 1, position: 'relative' },
  gridPostImage: { width: '100%', height: '100%' },
  recipeBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    padding: 4,
  },
  gridPostOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
  },
  gridPostStat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  gridPostStatText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyStateText: { fontSize: 16, color: '#999', marginTop: 15, textAlign: 'center' },
  createPostButton: {
    backgroundColor: '#006e3e',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 20,
  },
  createPostButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});

export default KnorrProfileScreen;