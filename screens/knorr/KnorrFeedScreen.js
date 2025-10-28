import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Text,
  StyleSheet,
  TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import feedService from '../../services/feedService';

export default function KnorrCommunityScreen({ navigation }) {
  const { user } = useAuth(); // Utilise AuthContext au lieu de Firebase
  const userId = user?.id;
  
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [feedType, setFeedType] = useState('personalized'); // 'personalized' ou 'explore'

  // Charger le feed initial
  const loadFeed = async (isRefresh = false) => {
    try {
      if (!user?.id) {
        console.warn('⚠️ User non connecté, impossible de charger le feed');
        return;
      }

      const offset = isRefresh ? 0 : posts.length;
      
      const data = feedType === 'personalized' 
        ? await feedService.getPersonalizedFeed(20, offset)
        : await feedService.getExploreFeed(20, offset);

      if (isRefresh) {
        setPosts(data.posts);
      } else {
        setPosts(prev => [...prev, ...data.posts]);
      }

      setHasMore(data.posts.length === 20);
    } catch (error) {
      console.error('❌ Erreur chargement feed:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadFeed();
  }, [user?.id, feedType]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadFeed(true);
  }, [feedType]);

  const loadMore = () => {
    if (!loading && hasMore) {
      loadFeed(false);
    }
  };

  const toggleFeedType = () => {
    setFeedType(prev => prev === 'personalized' ? 'explore' : 'personalized');
    setLoading(true);
  };

  const renderPost = ({ item }) => (
    <TouchableOpacity
      style={styles.postCard}
      onPress={() => {
        // Incrémenter les vues
        feedService.incrementPostView(item.id);
        navigation.navigate('PostDetail', { postId: item.id });
      }}
    >
      {/* Votre UI de post existante */}
      <View>
        <Text style={styles.userName}>{item.user.displayName}</Text>
        <Text style={styles.content}>{item.content}</Text>
        
        {/* Afficher le score en mode debug */}
        {__DEV__ && item.score && (
          <Text style={styles.debug}>
            Score: {item.score.toFixed(2)}
          </Text>
        )}
        
        <View style={styles.stats}>
          <Text>❤️ {item.likes}</Text>
          <Text>💬 {item.comments}</Text>
          <Text>🔄 {item.shares}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading && posts.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#00A86B" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Toggle Feed Type */}
      <View style={styles.feedTypeToggle}>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            feedType === 'personalized' && styles.toggleButtonActive
          ]}
          onPress={() => setFeedType('personalized')}
        >
          <Text style={feedType === 'personalized' ? styles.toggleTextActive : styles.toggleText}>
            Pour toi
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.toggleButton,
            feedType === 'explore' && styles.toggleButtonActive
          ]}
          onPress={() => setFeedType('explore')}
        >
          <Text style={feedType === 'explore' ? styles.toggleTextActive : styles.toggleText}>
            Explorer
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          hasMore && <ActivityIndicator style={{ padding: 20 }} />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  feedTypeToggle: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  toggleButtonActive: {
    backgroundColor: '#00A86B',
  },
  toggleText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  toggleTextActive: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
  postCard: {
    backgroundColor: 'white',
    marginVertical: 8,
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  content: {
    fontSize: 14,
    color: '#333',
    marginBottom: 12,
  },
  stats: {
    flexDirection: 'row',
    gap: 16,
  },
  debug: {
    fontSize: 10,
    color: '#999',
    marginTop: 4,
  },
});
