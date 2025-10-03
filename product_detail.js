import React from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert
} from 'react-native';
import { doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import { Ionicons } from '@expo/vector-icons';

const ProductDetailScreen = ({ route, navigation }) => {
  const { barcode, product } = route.params;
  const userId = auth.currentUser?.uid;

  const addToShoppingList = async () => {
    if (!userId) return;
    
    try {
      const docRef = doc(db, 'shopping_lists', userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const currentItems = docSnap.data().items || [];
        const newItem = {
          id: Date.now().toString(),
          name: product.name,
          quantity: 1,
          checked: false,
          addedAt: new Date(),
          barcode: barcode
        };
        
        await updateDoc(docRef, {
          items: [...currentItems, newItem],
          updatedAt: new Date()
        });
        
        Alert.alert('Succès', 'Produit ajouté à la liste de courses !');
      }
    } catch (error) {
      console.error('Erreur ajout liste:', error);
      Alert.alert('Erreur', 'Impossible d\'ajouter le produit');
    }
  };

  const addToFridge = async () => {
    if (!userId) return;
    
    try {
      const docRef = doc(db, 'fridge_items', userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const currentItems = docSnap.data().items || [];
        const newItem = {
          id: Date.now().toString(),
          name: product.name,
          barcode: barcode,
          quantity: 1,
          addedAt: new Date(),
          imageUrl: product.imageUrl
        };
        
        await updateDoc(docRef, {
          items: [...currentItems, newItem]
        });
        
        Alert.alert('Succès', 'Produit ajouté au frigo !');
      }
    } catch (error) {
      console.error('Erreur ajout frigo:', error);
      Alert.alert('Erreur', 'Impossible d\'ajouter le produit');
    }
  };

  const getNutritionScoreColor = (score) => {
    const colors = {
      'a': '#038141',
      'b': '#85BB2F',
      'c': '#FECB02',
      'd': '#EE8100',
      'e': '#E63E11'
    };
    return colors[score?.toLowerCase()] || '#999';
  };

  return (
    <ScrollView style={styles.container}>
      {/* Image produit */}
      {product.imageUrl && (
        <Image
          source={{ uri: product.imageUrl }}
          style={styles.image}
          resizeMode="contain"
        />
      )}

      {/* Informations principales */}
      <View style={styles.section}>
        <Text style={styles.productName}>{product.name}</Text>
        <Text style={styles.brand}>{product.brand}</Text>
        {product.quantity && (
          <Text style={styles.quantity}>{product.quantity}</Text>
        )}
        
        {/* Nutri-Score */}
        {product.nutritionScore !== 'N/A' && (
          <View style={styles.nutriScoreContainer}>
            <Text style={styles.nutriScoreLabel}>Nutri-Score :</Text>
            <View style={[
              styles.nutriScoreBadge,
              { backgroundColor: getNutritionScoreColor(product.nutritionScore) }
            ]}>
              <Text style={styles.nutriScoreText}>
                {product.nutritionScore.toUpperCase()}
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Code-barres */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Code-barres</Text>
        <Text style={styles.barcode}>{barcode}</Text>
      </View>

      {/* Catégories */}
      {product.categories && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Catégories</Text>
          <Text style={styles.text}>{product.categories}</Text>
        </View>
      )}

      {/* Ingrédients */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ingrédients</Text>
        <Text style={styles.text}>{product.ingredients}</Text>
      </View>

      {/* Allergènes */}
      {product.allergens && product.allergens.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚠️ Allergènes</Text>
          <View style={styles.allergenContainer}>
            {product.allergens.map((allergen, index) => (
              <View key={index} style={styles.allergenTag}>
                <Text style={styles.allergenText}>
                  {allergen.replace('en:', '')}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Boutons d'action */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.shoppingButton]}
          onPress={addToShoppingList}
        >
          <Ionicons name="cart-outline" size={24} color="#fff" />
          <Text style={styles.actionButtonText}>Ajouter à la liste</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.fridgeButton]}
          onPress={addToFridge}
        >
          <Ionicons name="snow-outline" size={24} color="#fff" />
          <Text style={styles.actionButtonText}>Ajouter au frigo</Text>
        </TouchableOpacity>
      </View>

      {/* Lien Open Food Facts */}
      <TouchableOpacity
        style={styles.linkButton}
        onPress={() => Alert.alert('Info', 'Données fournies par Open Food Facts')}
      >
        <Text style={styles.linkText}>
          Source : Open Food Facts
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  image: {
    width: '100%',
    height: 250,
    backgroundColor: '#fff',
  },
  section: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 10,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  brand: {
    fontSize: 18,
    color: '#666',
    marginBottom: 4,
  },
  quantity: {
    fontSize: 14,
    color: '#999',
    marginBottom: 15,
  },
  nutriScoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  nutriScoreLabel: {
    fontSize: 16,
    color: '#333',
    marginRight: 10,
  },
  nutriScoreBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nutriScoreText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  barcode: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'monospace',
  },
  text: {
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
  },
  allergenContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  allergenTag: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 8,
  },
  allergenText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  actionButtons: {
    padding: 20,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    gap: 10,
  },
  shoppingButton: {
    backgroundColor: '#2ecc71',
  },
  fridgeButton: {
    backgroundColor: '#3498db',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkButton: {
    padding: 20,
    alignItems: 'center',
  },
  linkText: {
    color: '#3498db',
    fontSize: 14,
  },
});

export default ProductDetailScreen;