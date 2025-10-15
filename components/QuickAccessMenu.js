import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '../hooks/useNavigation';

/**
 * 🚀 MENU ACCÈS RAPIDE
 * Menu flottant pour tester toutes les routes rapidement
 */
const QuickAccessMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [animation] = useState(new Animated.Value(0));
  const navigation = useNavigation();

  const toggleMenu = () => {
    const toValue = isOpen ? 0 : 1;
    
    Animated.spring(animation, {
      toValue,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
    
    setIsOpen(!isOpen);
  };

  const menuItems = [
    {
      icon: 'navigate',
      label: 'Nav Demo',
      onPress: navigation.goToNavigationDemo,
      color: '#007AFF',
    },
    {
      icon: 'person',
      label: 'Profil',
      onPress: navigation.goToProfile,
      color: '#34C759',
    },
    {
      icon: 'scan',
      label: 'Scanner',
      onPress: navigation.goToBarcodeScanner,
      color: '#FF9500',
    },
    {
      icon: 'search',
      label: 'Chercher',
      onPress: () => navigation.goToSearch(),
      color: '#AF52DE',
    },
    {
      icon: 'storefront',
      label: 'Knorr Shop',
      onPress: navigation.goToKnorrShop,
      color: '#e63946',
    },
    {
      icon: 'add-circle',
      label: 'Post Knorr',
      onPress: navigation.goToCreateKnorrPost,
      color: '#FF2D92',
    },
  ];

  const buttonScale = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.1],
  });

  const menuScale = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const menuOpacity = animation.interpolate({
    inputRange: [0, 0.2, 1],
    outputRange: [0, 0, 1],
  });

  return (
    <View style={styles.container}>
      {/* Menu items */}
      {isOpen && (
        <Animated.View 
          style={[
            styles.menuContainer,
            {
              transform: [{ scale: menuScale }],
              opacity: menuOpacity,
            }
          ]}
        >
          {menuItems.map((item, index) => (
            <Animated.View
              key={index}
              style={[
                styles.menuItem,
                {
                  transform: [{
                    translateY: animation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [50, 0],
                    })
                  }]
                }
              ]}
            >
              <TouchableOpacity
                style={[styles.menuButton, { backgroundColor: item.color }]}
                onPress={() => {
                  item.onPress();
                  toggleMenu();
                }}
              >
                <Ionicons name={item.icon} size={20} color="#fff" />
                <Text style={styles.menuLabel}>{item.label}</Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </Animated.View>
      )}
      
      {/* Main button */}
      <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
        <TouchableOpacity
          style={[styles.mainButton, isOpen && styles.mainButtonOpen]}
          onPress={toggleMenu}
        >
          <Ionicons 
            name={isOpen ? "close" : "apps"} 
            size={24} 
            color="#fff" 
          />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    alignItems: 'flex-end',
    zIndex: 1000,
  },
  menuContainer: {
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  menuItem: {
    marginBottom: 12,
  },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  menuLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  mainButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  mainButtonOpen: {
    backgroundColor: '#FF3B30',
  },
});

export default QuickAccessMenu;
