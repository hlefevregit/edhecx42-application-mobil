import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Share
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/apiService';

const KnorrPostDetailScreen = ({ route, navigation }) => {
  const { postId } = route.params;
  const { user } = useAuth();
  const currentUserId = user?.id;

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const scrollViewRef = useRef(null);

  useEffect(() => {
    loadPost();
    loadComments();
    incrementViews();
  }, [postId]);

  const loadPost = async () => {
    try {
      const data = await apiService.getPost(postId);
      setPost(data);
      setLikesCount(data.likes || 0);
      setLoading(false);
    } catch (error) {
      console.error('Error loading post:', error);
      setLoading(false);
    }
  };

  const loadComments = async () => {
    try {
      const data = await apiService.getComments(postId);
      setComments(data);
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const incrementViews = async () => {
    try {
      await apiService.incrementViews(postId);
    } catch (error) {
      console.error('Error incrementing views:', error);
    }
  };

  const handleLike = async () => {
    try {
      if (!isLiked) {
        await apiService.likePost(postId, currentUserId);
        setIsLiked(true);
        setLikesCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Découvrez cette recette Knorr : ${post.content || 'Recette Knorr'}`,
        url: `https://foodapp.com/posts/${postId}`
      });
      await apiService.sharePost(postId, currentUserId);
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      const comment = await apiService.addComment(postId, currentUserId, newComment);
      setComments([comment, ...comments]);
      setNewComment('');
      setPost({ ...post, comments: (post.comments || 0) + 1 });
    } catch (error) {
      console.error('Error adding comment:', error);
      Alert.alert('Erreur', 'Impossible d\'ajouter le commentaire');
    }
  };

  const handleDeleteComment = async (commentId) => {
    Alert.alert(
      'Supprimer',
      'Supprimer ce commentaire ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.deleteComment(commentId);
              setComments(comments.filter(c => c.id !== commentId));
              setPost({ ...post, comments: (post.comments || 0) - 1 });
            } catch (error) {
              console.error('Error deleting comment:', error);
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#e63946" />
      </View>
    );
  }

  if (!post) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={64} color="#e63946" />
        <Text style={styles.errorText}>Post introuvable</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const postContent = post.content || {};
  const knorrProducts = post.knorrProducts || [];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Post</Text>
        <TouchableOpacity onPress={handleShare}>
          <Ionicons name="share-social" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView ref={scrollViewRef} style={styles.content}>
        {/* Image du post */}
        {post.imageUrl && (
          <Image
            source={{ uri: `http://localhost:3000${post.imageUrl}` }}
            style={styles.postImage}
            resizeMode="cover"
          />
        )}

        {/* Auteur */}
        <TouchableOpacity
          style={styles.authorSection}
          onPress={() => navigation.navigate('KnorrProfile', { userId: post.userId })}
        >
          <Image
            source={{ uri: 'https://via.placeholder.com/50' }}
            style={styles.authorAvatar}
          />
          <View style={styles.authorInfo}>
            <Text style={styles.authorName}>{post.userName || 'Utilisateur'}</Text>
            <Text style={styles.postDate}>
              {new Date(post.createdAt).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Stats rapides */}
        <View style={styles.statsBar}>
          <View style={styles.statItem}>
            <Ionicons name="heart" size={20} color="#e63946" />
            <Text style={styles.statText}>{likesCount}</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="chatbubble" size={20} color="#3498db" />
            <Text style={styles.statText}>{post.comments || 0}</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="eye" size={20} color="#999" />
            <Text style={styles.statText}>{post.views || 0}</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="share-social" size={20} color="#2ecc71" />
            <Text style={styles.statText}>{post.shares || 0}</Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionsBar}>
          <TouchableOpacity
            style={[styles.actionButton, isLiked && styles.actionButtonActive]}
            onPress={handleLike}
          >
            <Ionicons
              name={isLiked ? 'heart' : 'heart-outline'}
              size={28}
              color={isLiked ? '#e63946' : '#333'}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => scrollViewRef.current?.scrollToEnd()}
          >
            <Ionicons name="chatbubble-outline" size={26} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
            <Ionicons name="share-social-outline" size={26} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Caption */}
        {postContent.caption && (
          <View style={styles.section}>
            <Text style={styles.caption}>{postContent.caption}</Text>
          </View>
        )}

        {/* Hashtags */}
        {postContent.hashtags && (
          <View style={styles.section}>
            <Text style={styles.hashtags}>{postContent.hashtags}</Text>
          </View>
        )}

        {/* Produits Knorr */}
        {knorrProducts.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🛒 Produits utilisés</Text>
            {knorrProducts.map((product, index) => (
              <View key={index} style={styles.productTag}>
                <Ionicons name="pricetag" size={16} color="#e63946" />
                <Text style={styles.productName}>{product.productName}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Infos recette */}
        {post.isRecipe && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📖 Détails de la recette</Text>
            <View style={styles.recipeDetails}>
              {postContent.prepTime && (
                <View style={styles.recipeDetail}>
                  <Ionicons name="time" size={20} color="#f39c12" />
                  <Text style={styles.recipeDetailText}>Préparation: {postContent.prepTime} min</Text>
                </View>
              )}
              {postContent.cookTime && (
                <View style={styles.recipeDetail}>
                  <Ionicons name="flame" size={20} color="#e74c3c" />
                  <Text style={styles.recipeDetailText}>Cuisson: {postContent.cookTime} min</Text>
                </View>
              )}
              {postContent.servings && (
                <View style={styles.recipeDetail}>
                  <Ionicons name="people" size={20} color="#3498db" />
                  <Text style={styles.recipeDetailText}>{postContent.servings} personnes</Text>
                </View>
              )}
              {postContent.difficulty && (
                <View style={styles.recipeDetail}>
                  <Ionicons name="star" size={20} color="#2ecc71" />
                  <Text style={styles.recipeDetailText}>
                    Difficulté: {postContent.difficulty}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Commentaires */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            💬 Commentaires ({comments.length})
          </Text>
          {comments.length === 0 ? (
            <Text style={styles.noComments}>Aucun commentaire pour le moment</Text>
          ) : (
            comments.map((comment) => (
              <View key={comment.id} style={styles.comment}>
                <Image
                  source={{ uri: 'https://via.placeholder.com/40' }}
                  style={styles.commentAvatar}
                />
                <View style={styles.commentContent}>
                  <Text style={styles.commentAuthor}>{comment.userName}</Text>
                  <Text style={styles.commentText}>{comment.content}</Text>
                  <Text style={styles.commentDate}>
                    {new Date(comment.createdAt).toLocaleDateString('fr-FR')}
                  </Text>
                </View>
                {comment.userId === currentUserId && (
                  <TouchableOpacity onPress={() => handleDeleteComment(comment.id)}>
                    <Ionicons name="trash-outline" size={20} color="#e63946" />
                  </TouchableOpacity>
                )}
              </View>
            ))
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Input commentaire */}
      <View style={styles.commentInput}>
        <TextInput
          style={styles.input}
          placeholder="Ajouter un commentaire..."
          value={newComment}
          onChangeText={setNewComment}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendButton, !newComment.trim() && styles.sendButtonDisabled]}
          onPress={handleAddComment}
          disabled={!newComment.trim()}
        >
          <Ionicons
            name="send"
            size={24}
            color={newComment.trim() ? '#e63946' : '#ccc'}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  errorText: { fontSize: 18, color: '#666', marginTop: 15 },
  backButton: { marginTop: 20, fontSize: 16, color: '#e63946', fontWeight: '600' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#333' },
  content: { flex: 1 },
  postImage: { width: '100%', height: 400 },
  authorSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15
  },
  authorAvatar: { width: 50, height: 50, borderRadius: 25 },
  authorInfo: { marginLeft: 12 },
  authorName: { fontSize: 16, fontWeight: '600', color: '#333' },
  postDate: { fontSize: 12, color: '#999', marginTop: 2 },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 15,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#f0f0f0',
    backgroundColor: '#fafafa'
  },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statText: { fontSize: 14, fontWeight: '600', color: '#333' },
  actionsBar: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    gap: 20
  },
  actionButton: { padding: 5 },
  actionButtonActive: {},
  section: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 10 },
  caption: { fontSize: 15, color: '#333', lineHeight: 22 },
  hashtags: { fontSize: 14, color: '#3498db' },
  productTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff5f5',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8
  },
  productName: { marginLeft: 8, fontSize: 14, color: '#e63946', fontWeight: '500' },
  recipeDetails: { gap: 10 },
  recipeDetail: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  recipeDetailText: { fontSize: 14, color: '#666' },
  noComments: { fontSize: 14, color: '#999', textAlign: 'center', paddingVertical: 20 },
  comment: {
    flexDirection: 'row',
    marginBottom: 15,
    gap: 10
  },
  commentAvatar: { width: 40, height: 40, borderRadius: 20 },
  commentContent: { flex: 1 },
  commentAuthor: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 4 },
  commentText: { fontSize: 14, color: '#666', lineHeight: 20 },
  commentDate: { fontSize: 11, color: '#999', marginTop: 4 },
  commentInput: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#fff'
  },
  input: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 14,
    maxHeight: 100
  },
  sendButton: { marginLeft: 10, padding: 8 },
  sendButtonDisabled: { opacity: 0.5 }
});

export default KnorrPostDetailScreen;