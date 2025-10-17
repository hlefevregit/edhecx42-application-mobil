import Constants from 'expo-constants';

export const API_URL = "https://edhecx42-application-mobil.onrender.com";
class ApiService {
  async handleResponse(response) {
    const ct = response.headers.get('content-type');
    const text = await response.text();
    const data = ct?.includes('application/json') ? JSON.parse(text) : { raw: text };
    if (!response.ok) {
      throw new Error(data?.error || 'Request failed');
    }
    return data;
  }

  // Auth
  async register(userData) {
    const r = await fetch(`${API_URL}/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    return this.handleResponse(r);
  }

  async login(email, password) {
    const r = await fetch(`${API_URL}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return this.handleResponse(r);
  }

  // User
  async getUserProfile(userId, token) {
    const r = await fetch(`${API_URL}/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return this.handleResponse(r);
  }

  async updateUserProfile(userId, userData, token) {
    const r = await fetch(`${API_URL}/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(userData),
    });
    return this.handleResponse(r);
  }

  // Fridge
  async getFridgeItems(userId, token) {
    const r = await fetch(`${API_URL}/fridge/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return this.handleResponse(r);
  }

  async addFridgeItems(userId, items, token) {
    const r = await fetch(`${API_URL}/fridge/${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ items }),
    });
    return this.handleResponse(r);
  }

  // Posts
  async createPost({ userId, content, imageUri }) {
    const form = new FormData();
    form.append('userId', userId);
    if (content) form.append('content', content);

    if (imageUri) {
      if (typeof window !== 'undefined') {
        const resp = await fetch(imageUri);
        const blob = await resp.blob();
        form.append('image', blob, 'photo.jpg');
      } else {
        form.append('image', { uri: imageUri, name: 'photo.jpg', type: 'image/jpeg' });
      }
    }

    const r = await fetch(`${API_URL}/posts`, { method: 'POST', body: form });
    return this.handleResponse(r);
  }

  async getPosts(userId = null) {
    const url = userId ? `${API_URL}/posts?userId=${userId}` : `${API_URL}/posts`;
    const r = await fetch(url);
    return this.handleResponse(r);
  }

  async getPost(postId) {
    const r = await fetch(`${API_URL}/posts/${postId}`);
    return this.handleResponse(r);
  }

  async getComments(postId) {
    const r = await fetch(`${API_URL}/posts/${postId}/comments`);
    return this.handleResponse(r);
  }

  async addComment(postId, userId, content) {
    const r = await fetch(`${API_URL}/posts/${postId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, content })
    });
    return this.handleResponse(r);
  }

  async deleteComment(commentId) {
    const r = await fetch(`${API_URL}/comments/${commentId}`, {
      method: 'DELETE'
    });
    return this.handleResponse(r);
  }

  async sharePost(postId, userId) {
    const r = await fetch(`${API_URL}/posts/${postId}/share`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    return this.handleResponse(r);
  }

  async getKnorrProfile(userId) {
    const r = await fetch(`${API_URL}/knorr-profiles/${userId}`);
    return this.handleResponse(r);
  }

  async likePost(postId, userId) {
    const r = await fetch(`${API_URL}/posts/${postId}/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    return this.handleResponse(r);
  }

  async followUser(targetUserId, currentUserId) {
    const r = await fetch(`${API_URL}/knorr-profiles/follow`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetUserId, currentUserId }),
    });
    return this.handleResponse(r);
  }

  async unfollowUser(targetUserId, currentUserId) {
    const r = await fetch(`${API_URL}/knorr-profiles/unfollow`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetUserId, currentUserId }),
    });
    return this.handleResponse(r);
  }

  async incrementViews(postId) {
    const r = await fetch(`${API_URL}/posts/${postId}/view`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    return this.handleResponse(r);
  }
}

export default new ApiService();

// Exemple dans votre écran de création de post
import api from '../services/apiService';

const onPublish = async () => {
  try {
    await api.createPost({ userId, content, imageUri });
    // navigation.goBack();
  } catch (e) {
    console.log('Publish error:', e);
  }
};
// <Button onPress={onPublish} title="Publier" />