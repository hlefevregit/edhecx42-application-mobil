import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3000/api';

class ApiService {
  async handleResponse(response) {
    const contentType = response.headers.get('content-type');
    
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('Non-JSON response:', text);
      throw new Error('Server returned non-JSON response');
    }
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Request failed');
    }
    
    return data;
  }

  // Authentification
  async register(userData) {
    try {
      const response = await fetch(`${API_URL}/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  }

  async login(email, password) {
    try {
      const response = await fetch(`${API_URL}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // Profil utilisateur
  async getUserProfile(userId, token) {
    try {
      const response = await fetch(`${API_URL}/users/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  }

  async updateUserProfile(userId, userData, token) {
    try {
      const response = await fetch(`${API_URL}/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }

  // Frigo
  async getFridgeItems(userId, token) {
    try {
      console.log(`Fetching fridge items from: ${API_URL}/fridge/${userId}`);
      
      const response = await fetch(`${API_URL}/fridge/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Get fridge items error:', error);
      throw error;
    }
  }

  async addFridgeItems(userId, items, token) {
    try {
      console.log(`Adding fridge items to: ${API_URL}/fridge/${userId}`);
      
      const response = await fetch(`${API_URL}/fridge/${userId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items }),
      });
      
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Add fridge items error:', error);
      throw error;
    }
  }

  async updateFridgeItem(itemId, updates, token) {
    try {
      const response = await fetch(`${API_URL}/fridge/${itemId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Update fridge item error:', error);
      throw error;
    }
  }

  async deleteFridgeItem(itemId, token) {
    try {
      const response = await fetch(`${API_URL}/fridge/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Delete fridge item error:', error);
      throw error;
    }
  }

  // Shopping List
  async getShoppingList(userId, token) {
    try {
      const response = await fetch(`${API_URL}/shopping/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Get shopping list error:', error);
      throw error;
    }
  }
}

export default new ApiService();