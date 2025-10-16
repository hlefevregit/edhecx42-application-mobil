const API_URL = 'http://localhost:3000/api'; // Changez selon votre configuration

class ApiService {
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
      
      if (!response.ok) {
        throw new Error('Registration failed');
      }
      
      return await response.json();
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
      
      if (!response.ok) {
        throw new Error('Login failed');
      }
      
      return await response.json();
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
      
      if (!response.ok) {
        throw new Error('Failed to get user profile');
      }
      
      return await response.json();
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
      
      if (!response.ok) {
        throw new Error('Failed to update profile');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }

  // Frigo
  async getFridgeItems(userId, token) {
    try {
      const response = await fetch(`${API_URL}/fridge/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to get fridge items');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Get fridge items error:', error);
      throw error;
    }
  }

  async addFridgeItems(userId, items, token) {
    try {
      const response = await fetch(`${API_URL}/fridge/${userId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add fridge items');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Add fridge items error:', error);
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
      
      if (!response.ok) {
        throw new Error('Failed to get shopping list');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Get shopping list error:', error);
      throw error;
    }
  }
}

export default new ApiService();