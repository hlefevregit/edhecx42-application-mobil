import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Platform,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import recipeService from '../services/recipeService';

export default function RecipesScreen({ navigation }) {
  const { user } = useAuth();
  const userId = user?.id;
  const [recipes, setRecipes] = useState([]);
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [fridgeItems, setFridgeItems] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('recommended'); // recommended, all, trending

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    await Promise.all([
      loadFridgeItems(),
      loadUserProfile(),
    ]);
    await loadRecipes();
    setLoading(false);
  };

  const loadFridgeItems = async () => {
    if (!userId) return;

    try {
      const saved = await AsyncStorage.getItem(`fridge_${userId}`);
      if (saved) {
        const data = JSON.parse(saved);
        setFridgeItems(data.items || []);
      }
    } catch (error) {
      console.error('Erreur frigo:', error);
    }
  };

  const loadUserProfile = async () => {
    if (!userId) return;

    try {
      const saved = await AsyncStorage.getItem(`userProfile_${userId}`);
      if (saved) {
        setUserProfile(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Erreur profil:', error);
    }
  };

  const loadRecipes = async () => {
    try {
      const recommendedRecipes = await recipeService.getRecipesByIngredients(
        fridgeItems,
        userProfile
      );
      setRecipes(recommendedRecipes);
    } catch (error) {
      console.error('Erreur recettes:', error);
    }
  };

  const searchRecipes = async () => {
    if (!searchQuery.trim()) {
      loadRecipes();
      return;
    }

    setLoading(true);
    try {
      const results = await recipeService.searchRecipes(searchQuery, userProfile);
      setRecipes(results);
    } catch (error) {
      console.error('Erreur recherche:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSaveRecipe = async (recipeId) => {
    if (!userId) return;

    try {
      const isSaved = savedRecipes.includes(recipeId);
      const newSaved = isSaved
        ? savedRecipes.filter(id => id !== recipeId)
        : [...savedRecipes, recipeId];

      setSavedRecipes(newSaved);
      await AsyncStorage.setItem(`savedRecipes_${userId}`, JSON.stringify(newSaved));
    } catch (error) {
      console.error('Error saving recipe:', error);
    }
  };

  const getMatchColor = (score) => {
    if (score >= 0.8) return '#2ecc71'; // Excellent
    if (score >= 0.6) return '#f39c12'; // Bon
    if (score >= 0.4) return '#e67e22'; // Moyen
    return '#e74c3c'; // Faible
  };

  const getMatchText = (score) => {
    if (score >= 0.8) return 'Excellent match';
    if (score >= 0.6) return 'Bon match';
    if (score >= 0.4) return 'Match moyen';
    return 'Peu d\'ingrédients';
  };

  const renderRecipe = ({ item }) => {
    const isSaved = savedRecipes.includes(item.id);

    return (
      <TouchableOpacity
        style={styles.recipeCard}
        onPress={() => navigation.navigate('RecipeDetail', { recipe: item })}
      >
        <Image
          source={{ uri: item.image }}
          style={styles.recipeImage}
        />

        <View style={styles.recipeInfo}>
          <Text style={styles.recipeName} numberOfLines={2}>
            {item.name}
          </Text>

          <View style={styles.recipeStats}>
            <View style={styles.stat}>
              <Ionicons name="time-outline" size={16} color="#666" />
              <Text style={styles.statText}>{item.time || 30} min</Text>
            </View>

            <View style={styles.stat}>
              <Ionicons name="restaurant-outline" size={16} color="#666" />
              <Text style={styles.statText}>
                {item.usedIngredients}/{item.usedIngredients + item.missedIngredients}
              </Text>
            </View>
          </View>

          <View style={[
            styles.matchBadge,
            { backgroundColor: getMatchColor(item.matchScore) }
          ]}>
            <Text style={styles.matchText}>
              {getMatchText(item.matchScore)}
            </Text>
          </View>

          {item.missedIngredients > 0 && (
            <Text style={styles.missingText}>
              {item.missedIngredients} ingrédient{item.missedIngredients > 1 ? 's' : ''} manquant{item.missedIngredients > 1 ? 's' : ''}
            </Text>
          )}
        </View>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={() => toggleSaveRecipe(item.id)}
        >
          <Ionicons
            name={isSaved ? 'bookmark' : 'bookmark-outline'}
            size={24}
            color={isSaved ? '#006e3e' : '#999'}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const handleBack = () => {
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.getParent()?.navigate('Tabs', { screen: 'Widgets' });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2ecc71" />
        <Text style={styles.loadingText}>Recherche de recettes...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {/* ← Back to Widgets */}
        <TouchableOpacity onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
        </TouchableOpacity>

        <Text style={styles.title}>Recettes</Text>

        <TouchableOpacity onPress={() => navigation.navigate('Search')}>
          <Ionicons name="search" size={24} color="#1a1a1a" />
        </TouchableOpacity>
      </View>

      {/* Recherche */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color="#999" />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher une recette..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={searchRecipes}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => {
            setSearchQuery('');
            loadRecipes();
          }}>
            <Ionicons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      {/* Info frigo */}
      {fridgeItems.length > 0 && (
        <View style={styles.fridgeInfo}>
          <Ionicons name="snow" size={20} color="#3498db" />
          <Text style={styles.fridgeInfoText}>
            {fridgeItems.length} ingrédient{fridgeItems.length > 1 ? 's' : ''} dans votre frigo
          </Text>
        </View>
      )}

      {/* Filtres */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'recommended' && styles.filterActive]}
          onPress={() => setFilter('recommended')}
        >
          <Text style={[styles.filterText, filter === 'recommended' && styles.filterTextActive]}>
            Recommandées
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterButton, filter === 'all' && styles.filterActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
            Toutes
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterButton, filter === 'trending' && styles.filterActive]}
          onPress={() => setFilter('trending')}
        >
          <Text style={[styles.filterText, filter === 'trending' && styles.filterTextActive]}>
            🔥 Tendances
          </Text>
        </TouchableOpacity>
      </View>

      {/* Liste recettes */}
      <FlatList
        data={recipes}
        renderItem={renderRecipe}
        keyExtractor={item => item.id.toString()}
        numColumns={2}
        contentContainerStyle={styles.recipesList}
        columnWrapperStyle={styles.row}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="restaurant-outline" size={80} color="#ddd" />
            <Text style={styles.emptyText}>
              Aucune recette trouvée
            </Text>
            <Text style={styles.emptySubtext}>
              Ajoutez des aliments dans votre frigo pour des recommandations personnalisées
            </Text>
          </View>
        }
      />
    </View>
  );
}

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
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 15,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  fridgeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e8f4fd',
    paddingVertical: 10,
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 8,
  },
  fridgeInfoText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#3498db',
    fontWeight: '600',
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    gap: 10,
    marginBottom: 15,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  filterActive: {
    backgroundColor: '#2ecc71',
    borderColor: '#2ecc71',
  },
  filterText: {
    fontSize: 14,
    color: '#666',
  },
  filterTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  recipesList: {
    padding: 15,
  },
  row: {
    justifyContent: 'space-between',
  },
  recipeCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  recipeImage: {
    width: '100%',
    height: 140,
    backgroundColor: '#f0f0f0',
  },
  recipeInfo: {
    padding: 12,
  },
  recipeName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    height: 40,
  },
  recipeStats: {
    flexDirection: 'row',
    marginBottom: 8,
    gap: 15,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 13,
    color: '#666',
  },
  matchBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  matchText: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '600',
  },
  missingText: {
    fontSize: 11,
    color: '#e74c3c',
    fontStyle: 'italic',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
    marginTop: 20,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#bbb',
    marginTop: 8,
    textAlign: 'center',
  },
  saveButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 8,
  },
});