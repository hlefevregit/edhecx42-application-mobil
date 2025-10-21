import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Créer le context avec une valeur par défaut
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('AuthProvider mounted');
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      console.log('Loading user from AsyncStorage...');
      const token = await AsyncStorage.getItem('authToken');
      const userId = await AsyncStorage.getItem('userId');
      const userEmail = await AsyncStorage.getItem('userEmail');
      const userName = await AsyncStorage.getItem('userName');

      if (token && userId) {
        const userData = { 
          id: userId, 
          email: userEmail, 
          displayName: userName 
        };
        setUser(userData);
        console.log('User loaded:', userData);
      } else {
        console.log('No user found in AsyncStorage');
      }
    } catch (error) {
      console.error('Load user error:', error);
    } finally {
      setLoading(false);
      console.log('Loading complete');
    }
  };

  const login = async (userData, token) => {
    try {
      console.log('AuthContext.login called with:', userData, token);
      
      // Sauvegarder dans AsyncStorage
      await AsyncStorage.setItem('authToken', token);
      await AsyncStorage.setItem('userId', userData.id);
      await AsyncStorage.setItem('userEmail', userData.email);
      if (userData.displayName) {
        await AsyncStorage.setItem('userName', userData.displayName);
      }
      
      // Mettre à jour l'état
      setUser(userData);
      
      console.log('User logged in successfully:', userData);
    } catch (error) {
      console.error('Login context error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log('Logging out...');
      await AsyncStorage.multiRemove([
        'authToken', 
        'userId', 
        'userEmail', 
        'userName'
      ]);
      setUser(null);
      console.log('User logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    loadUser,
    isAuthenticated: !!user
  };

  console.log('AuthProvider rendering with value:', {
    hasUser: !!user,
    loading,
    hasLogin: typeof login === 'function',
    hasLogout: typeof logout === 'function'
  });

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  console.log('useAuth called, context:', context);
  
  if (context === null || context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};