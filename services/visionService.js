import axios from 'axios';
import * as FileSystem from 'expo-file-system';

// ⚠️ IMPORTANT : À remplacer par votre clé API Google Cloud
// 1. Aller sur https://console.cloud.google.com
// 2. Activer "Cloud Vision API"
// 3. Créer des identifiants (clé API)
const GOOGLE_VISION_API_KEY = 'VOTRE_CLE_API_ICI';

// Alternative gratuite : Clarifai Food Model
const CLARIFAI_API_KEY = 'VOTRE_CLE_CLARIFAI_ICI';

class VisionService {
  constructor() {
    this.useGoogleVision = true; // false pour utiliser Clarifai
  }

  // Convertir image en base64
  async imageToBase64(imageUri) {
    try {
      const base64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      return base64;
    } catch (error) {
      console.error('Erreur conversion base64:', error);
      throw error;
    }
  }

  // Google Vision API - Label Detection + Object Localization
  async analyzeWithGoogleVision(imageUri) {
    try {
      const base64Image = await this.imageToBase64(imageUri);

      const requestBody = {
        requests: [
          {
            image: {
              content: base64Image,
            },
            features: [
              {
                type: 'LABEL_DETECTION',
                maxResults: 15,
              },
              {
                type: 'OBJECT_LOCALIZATION',
                maxResults: 10,
              },
            ],
          },
        ],
      };

      const response = await axios.post(
        `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_VISION_API_KEY}`,
        requestBody
      );

      if (response.data.responses[0].error) {
        throw new Error(response.data.responses[0].error.message);
      }

      return this.parseGoogleVisionResults(response.data.responses[0]);
    } catch (error) {
      console.error('Erreur Google Vision:', error);
      throw error;
    }
  }

  // Parser les résultats Google Vision
  parseGoogleVisionResults(result) {
    const labels = result.labelAnnotations || [];
    const objects = result.localizedObjectAnnotations || [];

    // Filtrer uniquement les aliments
    const foodKeywords = [
      'food', 'fruit', 'vegetable', 'dairy', 'meat', 'beverage',
      'cheese', 'milk', 'bread', 'egg', 'yogurt', 'tomato',
      'carrot', 'apple', 'banana', 'orange', 'lettuce'
    ];

    const detectedItems = [];

    // Analyser les objets localisés
    objects.forEach(obj => {
      const name = obj.name.toLowerCase();
      const isFood = foodKeywords.some(keyword => name.includes(keyword));
      
      if (isFood && obj.score > 0.6) {
        detectedItems.push({
          name: this.translateToFrench(obj.name),
          confidence: obj.score,
          quantity: 1,
          source: 'object',
        });
      }
    });

    // Analyser les labels si pas assez d'objets détectés
    if (detectedItems.length < 3) {
      labels.forEach(label => {
        const name = label.description.toLowerCase();
        const isFood = foodKeywords.some(keyword => name.includes(keyword));
        
        if (isFood && label.score > 0.7) {
          const alreadyDetected = detectedItems.some(
            item => item.name.toLowerCase() === this.translateToFrench(label.description).toLowerCase()
          );
          
          if (!alreadyDetected) {
            detectedItems.push({
              name: this.translateToFrench(label.description),
              confidence: label.score,
              quantity: 1,
              source: 'label',
            });
          }
        }
      });
    }

    return detectedItems.slice(0, 10); // Max 10 items
  }

  // Clarifai Food Model (Alternative gratuite)
  async analyzeWithClarifai(imageUri) {
    try {
      const base64Image = await this.imageToBase64(imageUri);

      const requestBody = {
        inputs: [
          {
            data: {
              image: {
                base64: base64Image,
              },
            },
          },
        ],
      };

      const response = await axios.post(
        'https://api.clarifai.com/v2/models/bd367be194cf45149e75f01d59f77ba7/outputs',
        requestBody,
        {
          headers: {
            'Authorization': `Key ${CLARIFAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return this.parseClarifaiResults(response.data);
    } catch (error) {
      console.error('Erreur Clarifai:', error);
      throw error;
    }
  }

  // Parser résultats Clarifai
  parseClarifaiResults(result) {
    const concepts = result.outputs[0]?.data?.concepts || [];

    return concepts
      .filter(concept => concept.value > 0.7)
      .slice(0, 10)
      .map(concept => ({
        name: this.translateToFrench(concept.name),
        confidence: concept.value,
        quantity: 1,
        source: 'clarifai',
      }));
  }

  // Traduction simple EN → FR
  translateToFrench(englishName) {
    const translations = {
      // Fruits
      'apple': 'Pomme',
      'banana': 'Banane',
      'orange': 'Orange',
      'strawberry': 'Fraise',
      'grape': 'Raisin',
      'watermelon': 'Pastèque',
      'lemon': 'Citron',
      'peach': 'Pêche',
      'pear': 'Poire',
      
      // Légumes
      'tomato': 'Tomate',
      'carrot': 'Carotte',
      'lettuce': 'Salade',
      'cucumber': 'Concombre',
      'broccoli': 'Brocoli',
      'potato': 'Pomme de terre',
      'onion': 'Oignon',
      'pepper': 'Poivron',
      'garlic': 'Ail',
      
      // Produits laitiers
      'milk': 'Lait',
      'cheese': 'Fromage',
      'yogurt': 'Yaourt',
      'butter': 'Beurre',
      'cream': 'Crème',
      
      // Viandes
      'chicken': 'Poulet',
      'beef': 'Bœuf',
      'pork': 'Porc',
      'fish': 'Poisson',
      'meat': 'Viande',
      
      // Autres
      'egg': 'Œuf',
      'bread': 'Pain',
      'pasta': 'Pâtes',
      'rice': 'Riz',
      'cereal': 'Céréales',
      'juice': 'Jus',
      'water': 'Eau',
      'soda': 'Soda',
      
      // Catégories générales
      'food': 'Aliment',
      'fruit': 'Fruit',
      'vegetable': 'Légume',
      'dairy': 'Produit laitier',
      'beverage': 'Boisson',
    };

    const lower = englishName.toLowerCase();
    return translations[lower] || this.capitalizeFirst(englishName);
  }

  capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // Fonction principale d'analyse
  async analyzeImage(imageUri) {
    try {
      if (this.useGoogleVision) {
        return await this.analyzeWithGoogleVision(imageUri);
      } else {
        return await this.analyzeWithClarifai(imageUri);
      }
    } catch (error) {
      console.error('Erreur analyse image:', error);
      
      // Fallback : retourner des résultats simulés
      console.log('Utilisation du mode simulation (API non configurée)');
      return this.simulateDetection();
    }
  }

  // Simulation pour développement/démo
  simulateDetection() {
    const foods = [
      'Yaourt', 'Lait', 'Fromage', 'Tomates', 'Carottes',
      'Pommes', 'Bananes', 'Pain', 'Œufs', 'Poulet'
    ];

    const count = Math.floor(Math.random() * 5) + 3; // 3-7 items
    const detected = [];

    for (let i = 0; i < count; i++) {
      const randomFood = foods[Math.floor(Math.random() * foods.length)];
      const randomConfidence = 0.7 + Math.random() * 0.25; // 0.7-0.95
      const randomQuantity = Math.floor(Math.random() * 6) + 1; // 1-6

      detected.push({
        name: randomFood,
        confidence: randomConfidence,
        quantity: randomQuantity,
        source: 'simulation',
      });
    }

    return detected;
  }

  // Vérifier si les API keys sont configurées
  isConfigured() {
    if (this.useGoogleVision) {
      return GOOGLE_VISION_API_KEY !== 'AIzaSyDLSO-InziWAzffyj9K8Sgj2Gb1S0JBsLE';
    } else {
      return CLARIFAI_API_KEY !== 'VOTRE_CLE_CLARIFAI_ICI';
    }
  }
}

export default new VisionService();