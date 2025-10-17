import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';

const GOOGLE_VISION_API_KEY = 'AIzaSyDLSO-InziWAzffyj9K8Sgj2Gb1S0JBsLE';

class VisionService {
  constructor() {
    this.useGoogleVision = true;
    this.detectionHistory = [];
  }

  async analyzeImage(imageUri) {
    try {
      const base64Image = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const response = await axios.post(
        `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_VISION_API_KEY}`,
        {
          requests: [
            {
              image: {
                content: base64Image,
              },
              features: [
                { type: 'LABEL_DETECTION', maxResults: 10 },
                { type: 'OBJECT_LOCALIZATION', maxResults: 10 },
              ],
            },
          ],
        }
      );

      const results = response.data.responses[0];
      const detected = [];

      // Combiner labels et objets détectés
      if (results.labelAnnotations) {
        results.labelAnnotations.forEach((label) => {
          if (this.isFoodRelated(label.description)) {
            detected.push({
              name: label.description,
              confidence: label.score,
              type: 'label',
            });
          }
        });
      }

      if (results.localizedObjectAnnotations) {
        results.localizedObjectAnnotations.forEach((obj) => {
          if (this.isFoodRelated(obj.name)) {
            detected.push({
              name: obj.name,
              confidence: obj.score,
              type: 'object',
            });
          }
        });
      }

      // Dédupliquer et trier par confiance
      const uniqueItems = this.deduplicateItems(detected);
      return uniqueItems.slice(0, 10);
    } catch (error) {
      console.error('Erreur Vision API:', error);
      throw error;
    }
  }

  isFoodRelated(text) {
    const foodKeywords = [
      'food', 'fruit', 'vegetable', 'meat', 'dairy', 'beverage',
      'nourriture', 'aliment', 'fruit', 'légume', 'viande', 'lait',
      'fromage', 'yaourt', 'pain', 'boisson', 'sauce', 'condiment',
      'apple', 'banana', 'orange', 'tomato', 'carrot', 'potato',
      'pomme', 'banane', 'tomate', 'carotte', 'poulet', 'poisson'
    ];

    const lower = text.toLowerCase();
    return foodKeywords.some(keyword => lower.includes(keyword));
  }

  deduplicateItems(items) {
    const seen = new Map();
    
    items.forEach(item => {
      const key = item.name.toLowerCase();
      if (!seen.has(key) || seen.get(key).confidence < item.confidence) {
        seen.set(key, item);
      }
    });

    return Array.from(seen.values()).sort((a, b) => b.confidence - a.confidence);
  }

  // 🔥 NOUVELLE MÉTHODE : Détection avec contexte frigo
  async analyzeFullFridge(imageUri) {
    try {
      const detected = await this.analyzeImage(imageUri);
      
      // Grouper par catégorie automatiquement
      const categorized = this.categorizeItems(detected);
      
      // Suggérer zones de stockage
      const withZones = this.suggestStorageZones(categorized);
      
      // Estimer dates de péremption
      const withExpiry = this.estimateExpiryDates(withZones);
      
      return withExpiry;
    } catch (error) {
      console.error('Erreur analyse frigo complète:', error);
      throw error;
    }
  }

  // Méthode alternative qui accepte des résultats déjà détectés
  async analyzeFullFridge(input) {
    try {
      let detected;
      
      // Si input est une URI d'image
      if (typeof input === 'string' || input.uri) {
        const imageUri = typeof input === 'string' ? input : input.uri;
        detected = await this.analyzeImage(imageUri);
      }
      // Si input contient déjà des items détectés (mode test)
      else if (input.detectedItems) {
        detected = input.detectedItems;
      }
      // Si input est un tableau direct
      else if (Array.isArray(input)) {
        detected = input;
      }
      else {
        throw new Error('Format d\'entrée non reconnu');
      }
      
      if (!detected || detected.length === 0) {
        return [];
      }
      
      // Grouper par catégorie automatiquement
      const categorized = this.categorizeItems(detected);
      
      // Suggérer zones de stockage
      const withZones = this.suggestStorageZones(categorized);
      
      // Estimer dates de péremption
      const withExpiry = this.estimateExpiryDates(withZones);
      
      return withExpiry;
    } catch (error) {
      console.error('Erreur analyse frigo complète:', error);
      throw error;
    }
  }

  // Catégoriser automatiquement
  categorizeItems(items) {
    return items.map(item => ({
      ...item,
      category: this.detectCategory(item.name)
    }));
  }

  detectCategory(itemName) {
    const lower = itemName.toLowerCase();
    
    const categories = {
      'produits laitiers': ['lait', 'yaourt', 'fromage', 'beurre', 'crème', 'dairy', 'milk', 'cheese', 'yogurt', 'butter'],
      'viandes': ['viande', 'poulet', 'bœuf', 'porc', 'jambon', 'meat', 'chicken', 'beef', 'pork', 'ham'],
      'poissons': ['poisson', 'saumon', 'thon', 'crevette', 'fish', 'salmon', 'tuna', 'shrimp'],
      'fruits': ['pomme', 'banane', 'orange', 'fraise', 'raisin', 'fruit', 'apple', 'banana', 'orange', 'strawberry', 'grape'],
      'légumes': ['tomate', 'carotte', 'salade', 'concombre', 'poivron', 'vegetable', 'tomato', 'carrot', 'lettuce', 'cucumber', 'pepper'],
      'boissons': ['jus', 'eau', 'lait', 'soda', 'beverage', 'juice', 'water', 'drink'],
      'condiments': ['sauce', 'moutarde', 'ketchup', 'mayonnaise', 'condiment', 'mustard']
    };
    
    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => lower.includes(keyword))) {
        return category;
      }
    }
    
    return 'autre';
  }

  // Suggérer zone de stockage optimale
  suggestStorageZones(items) {
    return items.map(item => {
      let suggestedZone = 'Frigo principal';
      
      switch (item.category) {
        case 'produits laitiers':
          suggestedZone = 'Étagère haute';
          break;
        case 'viandes':
        case 'poissons':
          suggestedZone = 'Étagère basse (zone froide)';
          break;
        case 'fruits':
        case 'légumes':
          suggestedZone = 'Bac à légumes';
          break;
        case 'condiments':
          suggestedZone = 'Porte du frigo';
          break;
      }
      
      return { ...item, zone: suggestedZone };
    });
  }

  // Estimer dates de péremption par défaut
  estimateExpiryDates(items) {
    const expiryRules = {
      'produits laitiers': 7,  // 7 jours
      'viandes': 3,            // 3 jours
      'poissons': 2,           // 2 jours
      'fruits': 7,
      'légumes': 10,
      'condiments': 30,
      'autre': 5
    };
    
    return items.map(item => {
      const daysToAdd = expiryRules[item.category] || 5;
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + daysToAdd);
      
      return {
        ...item,
        suggestedExpiryDate: expiryDate.toISOString().split('T')[0],
        expiryConfidence: 0.7,
        quantity: 1
      };
    });
  }

  // Historique des détections
  async saveDetectionHistory(userId, detected) {
    try {
      const history = await AsyncStorage.getItem(`detection_history_${userId}`);
      const parsedHistory = history ? JSON.parse(history) : [];
      
      parsedHistory.push({
        date: new Date().toISOString(),
        items: detected,
        count: detected.length
      });
      
      // Garder seulement les 20 dernières détections
      const recentHistory = parsedHistory.slice(-20);
      
      await AsyncStorage.setItem(
        `detection_history_${userId}`,
        JSON.stringify(recentHistory)
      );
    } catch (error) {
      console.error('Erreur sauvegarde historique:', error);
    }
  }

  // Obtenir l'historique
  async getDetectionHistory(userId) {
    try {
      const history = await AsyncStorage.getItem(`detection_history_${userId}`);
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.error('Erreur récupération historique:', error);
      return [];
    }
  }
}

export default new VisionService();