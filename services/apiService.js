import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ancien
// const API_URL = process.env.API_URL || 'http://localhost:3000/api';

// nouveau
const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  'https://edhecx42-application-mobil.onrender.com/api';

let AUTH_TOKEN = null;
export function setAuthToken(token) { AUTH_TOKEN = token || null; }

class ApiService {
  constructor() {
    this.base = API_BASE_URL.replace(/\/+$/, '');
    this.defaultHeaders = { 'Content-Type': 'application/json' };
  }

  buildUrl(path, params) {
    const url = new URL(this.base + (path.startsWith('/') ? path : `/${path}`));
    if (params && typeof params === 'object') {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null) url.searchParams.append(k, String(v));
      });
    }
    return url.toString();
  }

  async handleResponse(res) {
    const contentType = res.headers.get('content-type') || '';
    let text = null;
    let data = null;

    if (res.status !== 204) {
      text = await res.text();
      if (contentType.includes('application/json')) {
        try {
          data = text ? JSON.parse(text) : null;
        } catch (e) {
          data = null; // JSON invalide, on laisse data à null
        }
      } else {
        data = text; // renvoyer le texte brut pour les réponses non-JSON
      }
    }

    if (!res.ok) {
      const err = new Error(`Request failed ${res.status}`);
      err.status = res.status;
      err.data = data ?? text;
      throw err;
    }
    return data;
  }

  async get(path, params) {
    const url = this.buildUrl(path, params);
    const headers = AUTH_TOKEN ? { Authorization: `Bearer ${AUTH_TOKEN}` } : {};
    const res = await fetch(url, { method: 'GET', headers, credentials: 'include' });
    return this.handleResponse(res);
  }

  async post(path, body) {
    const res = await fetch(this.buildUrl(path), {
      method: 'POST',
      headers: this.defaultHeaders,
      body: body instanceof FormData ? body : JSON.stringify(body ?? {}),
      credentials: 'include',
    });
    return this.handleResponse(res);
  }

  async put(path, body) {
    const res = await fetch(this.buildUrl(path), {
      method: 'PUT',
      headers: this.defaultHeaders,
      body: JSON.stringify(body ?? {}),
      credentials: 'include',
    });
    return this.handleResponse(res);
  }

  async delete(path) {
    const res = await fetch(this.buildUrl(path), {
      method: 'DELETE',
      credentials: 'include',
    });
    return this.handleResponse(res);
  }

  async getAuthToken() {
    return await AsyncStorage.getItem('authToken');
  }

  async setAuthToken(token) {
    await AsyncStorage.setItem('authToken', token);
  }

  async removeAuthToken() {
    await AsyncStorage.removeItem('authToken');
  }

  // Auth
  async login(email, password) {
    try {
      console.log('🌐 apiService.login START');
      console.log('  📧 email type:', typeof email, 'value:', email);
      console.log('  🔑 password type:', typeof password, 'length:', password?.length);
      console.trace('Call stack:'); // Voir d'où vient l'appel
      
      if (typeof email !== 'string') {
        console.error('❌ Email is not a string!', email);
        throw new Error('Email must be a string');
      }
      
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la connexion');
      }

      await this.setAuthToken(data.token);
      
      console.log('✅ apiService.login SUCCESS');
      return data;
    } catch (error) {
      console.error('❌ apiService.login ERROR:', error);
      throw error;
    }
  }

  async register(email, password, displayName) {
    try {
      console.log('Register payload:', { email, displayName }); // Pour debug
      
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: email,              // ✅ String simple
          password: password,        // ✅ String simple
          displayName: displayName   // ✅ String simple
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'inscription');
      }

      await this.setAuthToken(data.token);
      return data;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  }

  async googleLogin(idToken) {
    const r = await fetch(`${API_BASE_URL}/auth/google-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    });
    return this.handleResponse(r);
  }

  async logout() {
    try {
      const token = await this.getAuthToken();
      
      const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la déconnexion');
      }

      // Supprimer le token localement
      await this.removeAuthToken();
      
      return data;
    } catch (error) {
      console.error('Logout error:', error);
      // Même en cas d'erreur, on supprime le token local
      await this.removeAuthToken();
      throw error;
    }
  }

  async getCurrentUser() {
    try {
      const token = await this.getAuthToken();
      
      if (!token) {
        throw new Error('Non authentifié');
      }

      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la récupération du profil');
      }

      return data.user;
    } catch (error) {
      console.error('Get current user error:', error);
      throw error;
    }
  }

  // Fridge
  async getFridgeItems(userId, token) {
    const r = await fetch(`${API_BASE_URL}/fridge/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return this.handleResponse(r);
  }

  async addFridgeItems(userId, items, token) {
    const r = await fetch(`${API_BASE_URL}/fridge/${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ items }),
    });
    return this.handleResponse(r);
  }

  // Posts
  async createPost({ userId, content, imageUri }) {
    try {
      const token = await this.getAuthToken();
      const formData = new FormData();
      formData.append('userId', userId);
      formData.append('content', content);

      if (imageUri) {
        const uriParts = imageUri.split('.');
        const fileType = uriParts[uriParts.length - 1];

        formData.append('image', {
          uri: imageUri,
          name: `photo.${fileType}`,
          type: `image/${fileType}`,
        });
      }

      const response = await fetch(`${API_BASE_URL}/posts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la création du post');
      }

      return data;
    } catch (error) {
      console.error('Create post error:', error);
      throw error;
    }
  }

  async getPosts(userId = null, limit = 20) {
    try {
      const token = await this.getAuthToken();
      const params = new URLSearchParams();
      if (userId) params.append('userId', userId);
      params.append('limit', limit);

      const response = await fetch(`${API_BASE_URL}/posts?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la récupération des posts');
      }

      return data;
    } catch (error) {
      console.error('Get posts error:', error);
      throw error;
    }
  }

  async getPost(postId) {
    const r = await fetch(`${API_BASE_URL}/posts/${postId}`);
    return this.handleResponse(r);
  }

  async getComments(postId) {
    const r = await fetch(`${API_BASE_URL}/posts/${postId}/comments`);
    return this.handleResponse(r);
  }

  async addComment(postId, userId, content) {
    const r = await fetch(`${API_BASE_URL}/posts/${postId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, content })
    });
    return this.handleResponse(r);
  }

  async deleteComment(commentId) {
    const r = await fetch(`${API_BASE_URL}/posts/comments/${commentId}`, { // corrigé
      method: 'DELETE'
    });
    return this.handleResponse(r);
  }

  async sharePost(postId, userId) {
    const r = await fetch(`${API_BASE_URL}/posts/${postId}/share`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    return this.handleResponse(r);
  }

  async getKnorrProfile(userId) {
    const r = await fetch(`${API_BASE_URL}/knorr-profiles/${userId}`);
    return this.handleResponse(r);
  }

  async likePost(postId, userId) {
    try {
      const token = await this.getAuthToken();
      const response = await fetch(`${API_BASE_URL}/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors du like');
      }

      return data;
    } catch (error) {
      console.error('Like post error:', error);
      throw error;
    }
  }

  async followUser(targetUserId, currentUserId) {
    const r = await fetch(`${API_BASE_URL}/knorr-profiles/follow`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetUserId, currentUserId }),
    });
    return this.handleResponse(r);
  }

  async unfollowUser(targetUserId, currentUserId) {
    const r = await fetch(`${API_BASE_URL}/knorr-profiles/unfollow`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetUserId, currentUserId }),
    });
    return this.handleResponse(r);
  }

  async incrementViews(postId) {
    try {
      const token = await this.getAuthToken();
      const response = await fetch(`${API_BASE_URL}/posts/${postId}/view`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'incrémentation des vues');
      }

      return data;
    } catch (error) {
      console.error('Increment views error:', error);
      throw error;
    }
  }
}

export default new ApiService();