import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function KnorrFeedScreen({ navigation }) {
  const { user } = useAuth(); // Utilise AuthContext au lieu de Firebase
  const userId = user?.id;
  
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [likedPosts, setLikedPosts] = useState([]);

  useEffect(() => {
    loadPosts();
    loadLikedPosts();
  }, [userId]);

  const loadPosts = async () => {
    try {
      // Charger depuis AsyncStorage ou API
      const storedPosts = await AsyncStorage.getItem('knorrPosts');
      if (storedPosts) {
        setPosts(JSON.parse(storedPosts));
      } else {
        // Posts par défaut
        setPosts([
          {
            id: '1',
            userId: 'knorr_official',
            userName: 'Knorr France',
            userAvatar: 'https://via.placeholder.com/50',
            content: '🍝 Nouvelle recette : Pâtes crémeuses aux champignons !',
            image: 'https://via.placeholder.com/400x300',
            likes: 42,
            comments: 8,
            timestamp: new Date().toISOString(),
          },
        ]);
      }
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLikedPosts = async () => {
    if (!userId) return;
    
    try {
      const liked = await AsyncStorage.getItem(`likedPosts_${userId}`);
      if (liked) {
        setLikedPosts(JSON.parse(liked));
      }
    } catch (error) {
      console.error('Error loading liked posts:', error);
    }
  };

  const toggleLike = async (postId) => {
    if (!userId) return;
    
    try {
      const isLiked = likedPosts.includes(postId);
      const newLiked = isLiked
        ? likedPosts.filter(id => id !== postId)
        : [...likedPosts, postId];
      
      setLikedPosts(newLiked);
      await AsyncStorage.setItem(`likedPosts_${userId}`, JSON.stringify(newLiked));

      // Mettre à jour le nombre de likes du post
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === postId
            ? { ...post, likes: post.likes + (isLiked ? -1 : 1) }
            : post
        )
      );
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000); // en secondes

    if (diff < 60) return 'À l\'instant';
    if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)}h`;
    return `Il y a ${Math.floor(diff / 86400)}j`;
  };

  const renderPost = ({ item }) => {
    const isLiked = likedPosts.includes(item.id);

    return (
      <View style={styles.postCard}>
        {/* Header */}
        <View style={styles.postHeader}>
          <Image
            source={{ uri: item.userAvatar }}
            style={styles.avatar}
          />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{item.userName}</Text>
            <Text style={styles.timestamp}>{formatTimestamp(item.timestamp)}</Text>
          </View>
          <TouchableOpacity>
            <Ionicons name="ellipsis-horizontal" size={24} color="#999" />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <Text style={styles.postContent}>{item.content}</Text>

        {/* Image */}
        {item.image && (
          <Image
            source={{ uri: item.image }}
            style={styles.postImage}
          />
        )}

        {/* Actions */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => toggleLike(item.id)}
          >
            <Ionicons
              name={isLiked ? 'heart' : 'heart-outline'}
              size={24}
              color={isLiked ? '#e74c3c' : '#999'}
            />
            <Text style={[styles.actionText, isLiked && styles.actionTextActive]}>
              {item.likes}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Comments', { postId: item.id })}
          >
            <Ionicons name="chatbubble-outline" size={24} color="#999" />
            <Text style={styles.actionText}>{item.comments}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="share-outline" size={24} color="#999" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#006e3e" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Knorr Feed</Text>
        <TouchableOpacity onPress={() => navigation.navigate('CreatePost')}>
          <Ionicons name="add-circle-outline" size={28} color="#006e3e" />
        </TouchableOpacity>
      </View>

      {/* Feed */}
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.feed}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="newspaper-outline" size={80} color="#ddd" />
            <Text style={styles.emptyText}>Aucun post pour le moment</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  feed: {
    padding: 16,
  },
  postCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E5E5E5',
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  postContent: {
    fontSize: 15,
    color: '#1a1a1a',
    lineHeight: 22,
    marginBottom: 12,
  },
  postImage: {
    width: '100%',
    height: 250,
    borderRadius: 8,
    backgroundColor: '#E5E5E5',
    marginBottom: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionText: {
    fontSize: 14,
    color: '#999',
  },
  actionTextActive: {
    color: '#e74c3c',
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
  },
});
