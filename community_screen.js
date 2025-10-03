import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  Modal
} from 'react-native';
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  updateDoc,
  doc,
  increment
} from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import { Ionicons } from '@expo/vector-icons';

const CommunityScreen = () => {
  const [posts, setPosts] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostType, setNewPostType] = useState('astuce');
  const [productsUsed, setProductsUsed] = useState('');
  
  const userId = auth.currentUser?.uid;
  const userName = auth.currentUser?.displayName || 'Utilisateur';

  useEffect(() => {
    loadPosts();
  }, []);

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

  const createPost = async () => {
    if (!newPostContent.trim()) {
      Alert.alert('Erreur', 'Veuillez écrire quelque chose');
      return;
    }

    try {
      await addDoc(collection(db, 'posts'), {
        userId,
        userName,
        content: newPostContent,
        type: newPostType,
        productsUsed: productsUsed.split(',').map(p => p.trim()).filter(Boolean),
        likes: 0,
        createdAt: new Date(),
        imageUrl: null
      });

      setNewPostContent('');
      setProductsUsed('');
      setShowCreateModal(false);
      Alert.alert('Succès', 'Votre publication a été créée !');
    } catch (error) {
      console.error('Erreur création post:', error);
      Alert.alert('Erreur', 'Impossible de créer la publication');
    }
  };

  const likePost = async (postId, currentLikes) => {
    try {
      const postRef = doc(db, 'posts', postId);
      await updateDoc(postRef, {
        likes: increment(1)
      });
    } catch (error) {
      console.error('Erreur like:', error);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'recette': return '👨‍🍳';
      case 'astuce': return '💡';
      case 'avis': return '⭐';
      default: return '📝';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'recette': return '#e74c3c';
      case 'astuce': return '#f39c12';
      case 'avis': return '#9b59b6';
      default: return '#95a5a6';
    }
  };

  const renderPost = ({ item }) => (
    <View style={styles.post}>
      <View style={styles.postHeader}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {item.userName.charAt(0).toUpperCase()}
            </Text>
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
          style={styles.likeButton}
          onPress={() => likePost(item.id, item.likes)}
        >
          <Ionicons name="heart-outline" size={20} color="#e74c3c" />
          <Text style={styles.likeCount}>{item.likes || 0}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Communauté</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Ionicons name="add-circle" size={28} color="#2ecc71" />
        </TouchableOpacity>
      </View>

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
              {['astuce', 'recette', 'avis'].map(type => (
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
              placeholder="Partagez une astuce, une recette ou votre avis..."
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

            <TouchableOpacity
              style={styles.publishButton}
              onPress={createPost}
            >
              <Text style={styles.publishButtonText}>Publier</Text>
            </TouchableOpacity>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  createButton: {
    padding: 5,
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2ecc71',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
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
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likeCount: {
    marginLeft: 6,
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
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
    gap: 10,
    marginBottom: 10,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
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
});

export default CommunityScreen;