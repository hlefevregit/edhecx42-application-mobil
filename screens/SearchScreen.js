import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
  ActivityIndicator
} from 'react-native';
import { collection, query as fsQuery, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const SearchScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('posts'); // posts, users, products
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // === RECHERCHES ===
  const searchPosts = async (q) => {
    try {
      const postsQuery = fsQuery(
        collection(db, 'knorr_posts'),
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc'),
        limit(20)
      );
      const snapshot = await getDocs(postsQuery);
      const posts = [];
      snapshot.forEach(doc => {
        const data = { id: doc.id, ...doc.data() };
        if (
          data.caption?.toLowerCase().includes(q.toLowerCase()) ||
          data.hashtags?.some(h => h.toLowerCase().includes(q.toLowerCase()))
        ) {
          posts.push(data);
        }
      });
      return posts;
    } catch (error) {
      console.error('Erreur recherche posts:', error);
      return [];
    }
  };

  const searchUsers = async (q) => {
    try {
      const usersQuery = fsQuery(collection(db, 'users'), limit(20));
      const snapshot = await getDocs(usersQuery);
      const users = [];
      snapshot.forEach(doc => {
        const data = { id: doc.id, ...doc.data() };
        if (data.displayName?.toLowerCase().includes(q.toLowerCase())) {
          users.push(data);
        }
      });
      return users;
    } catch (error) {
      console.error('Erreur recherche users:', error);
      return [];
    }
  };

  const searchProducts = async (q) => {
    try {
      const productsQuery = fsQuery(collection(db, 'products'), limit(20));
      const snapshot = await getDocs(productsQuery);
      const products = [];
      snapshot.forEach(doc => {
        const data = { id: doc.id, ...doc.data() };
        if (
          data.name?.toLowerCase().includes(q.toLowerCase()) ||
          data.brand?.toLowerCase().includes(q.toLowerCase())
        ) {
          products.push(data);
        }
      });
      return products;
    } catch (error) {
      console.error('Erreur recherche produits:', error);
      return [];
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      let searchResults = [];
      if (activeTab === 'posts') searchResults = await searchPosts(searchQuery);
      else if (activeTab === 'users') searchResults = await searchUsers(searchQuery);
      else if (activeTab === 'products') searchResults = await searchProducts(searchQuery);
      setResults(searchResults);
    } catch (error) {
      console.error('Erreur recherche:', error);
    } finally {
      setLoading(false);
    }
  };

  // === RENDU DES RÉSULTATS ===
  const renderPostResult = ({ item }) => (
    <TouchableOpacity
      style={styles.resultCard}
      onPress={() => navigation.navigate('Knorr', { initialPostId: item.id })}
    >
      <Image source={{ uri: item.mediaUrl }} style={styles.postThumbnail} />
      <View style={styles.postInfo}>
        <Text style={styles.postCaption} numberOfLines={2}>
          {item.caption}
        </Text>
        <View style={styles.postStats}>
          <View style={styles.postStat}>
            <Ionicons name="heart" size={16} color="#e74c3c" />
            <Text style={styles.postStatText}>{item.likes || 0}</Text>
          </View>
          <View style={styles.postStat}>
            <Ionicons name="eye" size={16} color="#3498db" />
            <Text style={styles.postStatText}>{item.views || 0}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderUserResult = ({ item }) => (
    <TouchableOpacity
      style={styles.resultCard}
      onPress={() => navigation.navigate('KnorrProfile', { userId: item.id })}
    >
      <View style={styles.userAvatar}>
        <Text style={styles.userAvatarText}>
          {item.displayName?.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.displayName}</Text>
        <Text style={styles.userEmail}>{item.email}</Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color="#999" />
    </TouchableOpacity>
  );

  const renderProductResult = ({ item }) => (
    <TouchableOpacity
      style={styles.resultCard}
      onPress={() => navigation.navigate('ProductDetail', { barcode: item.id, product: item })}
    >
      {item.imageUrl && <Image source={{ uri: item.imageUrl }} style={styles.productImage} />}
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productBrand}>{item.brand}</Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color="#999" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* === HEADER === */}
      <LinearGradient colors={['#e63946', '#c1121f']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>

        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => {
              setSearchQuery('');
              setResults([]);
            }}>
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      {/* === TABS === */}
      <View style={styles.tabs}>
        {['posts', 'users', 'products'].map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => {
              setActiveTab(tab);
              if (searchQuery) handleSearch();
            }}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab === 'posts' ? 'Posts' : tab === 'users' ? 'Utilisateurs' : 'Produits'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* === CONTENU === */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#e63946" />
          <Text style={styles.loadingText}>Recherche en cours...</Text>
        </View>
      ) : (
        <FlatList
          data={results}
          renderItem={
            activeTab === 'posts' ? renderPostResult :
            activeTab === 'users' ? renderUserResult :
            renderProductResult
          }
          keyExtractor={item => item.id}
          contentContainerStyle={styles.results}
          ListEmptyComponent={
            searchQuery ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="search-outline" size={80} color="#ddd" />
                <Text style={styles.emptyText}>Aucun résultat</Text>
                <Text style={styles.emptySubtext}>Essayez avec d'autres mots-clés</Text>
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="sparkles" size={80} color="#ddd" />
                <Text style={styles.emptyText}>Que cherchez-vous ?</Text>
                <Text style={styles.emptySubtext}>Posts, utilisateurs ou produits Knorr</Text>
              </View>
            )
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 50, paddingBottom: 15, paddingHorizontal: 20, gap: 15 },
  searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 25, paddingHorizontal: 15, paddingVertical: 10 },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 16, color: '#333' },
  tabs: { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  tab: { flex: 1, paddingVertical: 15, alignItems: 'center' },
  tabActive: { borderBottomWidth: 3, borderBottomColor: '#e63946' },
  tabText: { fontSize: 15, fontWeight: '600', color: '#999' },
  tabTextActive: { color: '#e63946' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 15, fontSize: 16, color: '#666' },
  results: { padding: 15 },
  resultCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  postThumbnail: { width: 80, height: 80, borderRadius: 8, backgroundColor: '#f0f0f0' },
  postInfo: { flex: 1, marginLeft: 12 },
  postCaption: { fontSize: 15, color: '#333', marginBottom: 8 },
  postStats: { flexDirection: 'row', gap: 15 },
  postStat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  postStatText: { fontSize: 13, color: '#666', fontWeight: '600' },
  userAvatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#e63946', justifyContent: 'center', alignItems: 'center' },
  userAvatarText: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  userInfo: { flex: 1, marginLeft: 12 },
  userName: { fontSize: 16, fontWeight: '600', color: '#333' },
  userEmail: { fontSize: 13, color: '#999', marginTop: 2 },
  productImage: { width: 60, height: 60, borderRadius: 8, backgroundColor: '#f0f0f0' },
  productInfo: { flex: 1, marginLeft: 12 },
  productName: { fontSize: 15, fontWeight: '600', color: '#333' },
  productBrand: { fontSize: 13, color: '#666', marginTop: 4 },
  emptyContainer: { alignItems: 'center', paddingTop: 100 },
  emptyText: { fontSize: 18, fontWeight: '600', color: '#999', marginTop: 20 },
  emptySubtext: { fontSize: 14, color: '#bbb', marginTop: 8, textAlign: 'center' },
});

export default SearchScreen;
