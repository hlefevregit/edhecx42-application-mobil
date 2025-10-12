import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  increment
} from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const CommentsScreen = ({ route, navigation }) => {
  const { postId } = route.params;
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const userId = auth.currentUser?.uid;
  const userName = auth.currentUser?.displayName || 'Utilisateur';

  useEffect(() => {
    loadComments();
  }, [postId]);

  const loadComments = () => {
    const q = query(
      collection(db, 'knorr_comments'),
      where('postId', '==', postId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const commentsData = [];
      querySnapshot.forEach((doc) => {
        commentsData.push({
          id: doc.id,
          ...doc.data()
        });
      });
      setComments(commentsData);
      setLoading(false);
    });

    return unsubscribe;
  };

  const sendComment = async () => {
    if (!newComment.trim() || sending) return;

    setSending(true);

    try {
      // Ajouter le commentaire
      await addDoc(collection(db, 'knorr_comments'), {
        postId,
        userId,
        userName,
        userAvatar: auth.currentUser?.photoURL || null,
        content: newComment.trim(),
        likes: 0,
        createdAt: new Date()
      });

      // Incrémenter le compteur de commentaires du post
      const postRef = doc(db, 'knorr_posts', postId);
      await updateDoc(postRef, {
        comments: increment(1)
      });

      // Donner XP à l'utilisateur
      const userRef = doc(db, 'knorr_user_profiles', userId);
      await updateDoc(userRef, {
        knorrXP: increment(5), // +5 XP par commentaire
        rewardPoints: increment(2) // +2 points
      });

      setNewComment('');
    } catch (error) {
      console.error('Erreur envoi commentaire:', error);
    } finally {
      setSending(false);
    }
  };

  const likeComment = async (commentId) => {
    try {
      const commentRef = doc(db, 'knorr_comments', commentId);
      await updateDoc(commentRef, {
        likes: increment(1)
      });
    } catch (error) {
      console.error('Erreur like commentaire:', error);
    }
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const commentDate = date.toDate ? date.toDate() : new Date(date);
    const seconds = Math.floor((now - commentDate) / 1000);

    if (seconds < 60) return 'À l\'instant';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}min`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}j`;
    return commentDate.toLocaleDateString('fr-FR');
  };

  const renderComment = ({ item }) => {
    const isOwnComment = item.userId === userId;

    return (
      <View style={[styles.commentCard, isOwnComment && styles.ownCommentCard]}>
        <View style={styles.commentHeader}>
          <View style={styles.commentUser}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {item.userName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View>
              <Text style={styles.commentUserName}>{item.userName}</Text>
              <Text style={styles.commentTime}>{getTimeAgo(item.createdAt)}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.likeButton}
            onPress={() => likeComment(item.id)}
          >
            <Ionicons name="heart-outline" size={20} color="#e74c3c" />
            {item.likes > 0 && (
              <Text style={styles.likesCount}>{item.likes}</Text>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.commentContent}>{item.content}</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#e63946" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      {/* Header */}
      <LinearGradient
        colors={['#e63946', '#c1121f']}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          💬 Commentaires ({comments.length})
        </Text>
        <View style={{ width: 24 }} />
      </LinearGradient>

      {/* Liste commentaires */}
      <FlatList
        data={comments}
        renderItem={renderComment}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.commentsList}
        inverted={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubbles-outline" size={80} color="#ddd" />
            <Text style={styles.emptyText}>Aucun commentaire</Text>
            <Text style={styles.emptySubtext}>
              Soyez le premier à commenter !
            </Text>
          </View>
        }
      />

      {/* Input commentaire */}
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Ajouter un commentaire..."
            placeholderTextColor="#999"
            value={newComment}
            onChangeText={setNewComment}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!newComment.trim() || sending) && styles.sendButtonDisabled
            ]}
            onPress={sendComment}
            disabled={!newComment.trim() || sending}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="send" size={20} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
        <Text style={styles.xpInfo}>
          💡 Gagnez +5 XP et +2 points par commentaire
        </Text>
      </View>
    </KeyboardAvoidingView>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  commentsList: {
    padding: 15,
  },
  commentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  ownCommentCard: {
    backgroundColor: '#e8f4fd',
    borderWidth: 1,
    borderColor: '#3498db',
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  commentUser: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e63946',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  commentUserName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  commentTime: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  likesCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e74c3c',
  },
  commentContent: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 100,
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
  inputContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#e63946',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#ddd',
  },
  xpInfo: {
    fontSize: 11,
    color: '#f39c12',
    textAlign: 'center',
    marginTop: 8,
  },
});

export default CommentsScreen;