import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const LOCATION_TASK_NAME = 'background-location-task';
const GEOFENCE_RADIUS = 100; // mètres

// Base de données des magasins (à enrichir ou via API)
const STORES_DATABASE = [
  { id: 1, name: 'Carrefour', lat: 43.7102, lng: 7.2620, type: 'supermarché' },
  { id: 2, name: 'Leclerc', lat: 43.7150, lng: 7.2580, type: 'supermarché' },
  { id: 3, name: 'Auchan', lat: 43.7050, lng: 7.2700, type: 'hypermarché' },
  { id: 4, name: 'Monoprix', lat: 43.7080, lng: 7.2650, type: 'supermarché' },
  { id: 5, name: 'Biocoop', lat: 43.7120, lng: 7.2600, type: 'bio' },
  // Ajouter plus de magasins
];

class GeolocationService {
  constructor() {
    this.currentVisit = null;
    this.userId = null;
  }

  // Initialiser le service
  async initialize(userId) {
    this.userId = userId;

    const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
    if (foregroundStatus !== 'granted') {
      throw new Error('Permission géolocalisation refusée');
    }

    const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
    if (backgroundStatus !== 'granted') {
      console.warn('Permission background refusée - tracking limité');
    }

    return true;
  }

  // Calculer distance entre deux points (Haversine)
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Rayon terre en mètres
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance en mètres
  }

  // Trouver le magasin le plus proche
  findNearestStore(latitude, longitude) {
    let nearest = null;
    let minDistance = Infinity;

    STORES_DATABASE.forEach(store => {
      const distance = this.calculateDistance(
        latitude, longitude,
        store.lat, store.lng
      );

      if (distance < minDistance && distance < GEOFENCE_RADIUS) {
        minDistance = distance;
        nearest = { ...store, distance };
      }
    });

    return nearest;
  }

  // Démarrer une visite magasin
  async startStoreVisit(store, location) {
    this.currentVisit = {
      storeId: store.id,
      storeName: store.name,
      storeType: store.type,
      startTime: new Date(),
      entryLocation: {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      }
    };

    console.log(`📍 Entrée détectée: ${store.name}`);
  }

  // Terminer une visite magasin
  async endStoreVisit(location) {
    if (!this.currentVisit) return;

    const endTime = new Date();
    const duration = Math.floor((endTime - this.currentVisit.startTime) / 60000); // minutes

    const visit = {
      ...this.currentVisit,
      endTime,
      duration,
      exitLocation: {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      }
    };

    // Sauvegarder dans Firestore
    await this.saveVisit(visit);

    console.log(`📍 Sortie détectée: ${visit.storeName} - Durée: ${duration} min`);

    this.currentVisit = null;
    return visit;
  }

  // Sauvegarder la visite dans Firestore
  async saveVisit(visit) {
    if (!this.userId) return;

    try {
      const docRef = doc(db, 'stats', this.userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        await updateDoc(docRef, {
          shopVisits: arrayUnion({
            date: visit.startTime,
            storeName: visit.storeName,
            storeType: visit.storeType,
            duration: visit.duration,
            location: visit.entryLocation
          })
        });
      }

      // Calculer nouvelles stats
      await this.updateStats();
    } catch (error) {
      console.error('Erreur sauvegarde visite:', error);
    }
  }

  // Mettre à jour les statistiques
  async updateStats() {
    if (!this.userId) return;

    try {
      const docRef = doc(db, 'stats', this.userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const visits = docSnap.data().shopVisits || [];

        // Calculer moyenne temps
        const avgTime = visits.length > 0
          ? visits.reduce((sum, v) => sum + v.duration, 0) / visits.length
          : 0;

        // Calculer économies (estimation basée sur le temps)
        const savings = visits.reduce((total, v) => {
          // Hypothèse: moins de temps = moins d'achats impulsifs
          // Économie estimée: 2€ par minute économisée vs moyenne
          const timeSaved = Math.max(0, 45 - v.duration);
          return total + (timeSaved * 2);
        }, 0);

        await updateDoc(docRef, {
          routines: {
            avgShoppingTime: Math.round(avgTime),
            totalVisits: visits.length,
            favoriteStore: this.getMostFrequentStore(visits)
          },
          savings: {
            monthly: Math.round(savings * 0.3), // Estimation mensuelle
            total: Math.round(savings)
          }
        });
      }
    } catch (error) {
      console.error('Erreur MAJ stats:', error);
    }
  }

  // Magasin le plus fréquenté
  getMostFrequentStore(visits) {
    const frequency = {};
    visits.forEach(v => {
      frequency[v.storeName] = (frequency[v.storeName] || 0) + 1;
    });

    let maxStore = null;
    let maxCount = 0;
    Object.entries(frequency).forEach(([store, count]) => {
      if (count > maxCount) {
        maxStore = store;
        maxCount = count;
      }
    });

    return maxStore;
  }

  // Tracking en temps réel
  async startTracking() {
    const locationSubscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 10000, // Vérifier toutes les 10 secondes
        distanceInterval: 10 // Ou si déplacement de 10m
      },
      async (location) => {
        const nearestStore = this.findNearestStore(
          location.coords.latitude,
          location.coords.longitude
        );

        if (nearestStore && !this.currentVisit) {
          // Entrée dans un magasin
          await this.startStoreVisit(nearestStore, location);
        } else if (!nearestStore && this.currentVisit) {
          // Sortie du magasin
          await this.endStoreVisit(location);
        }
      }
    );

    return locationSubscription;
  }

  // Arrêter le tracking
  stopTracking(subscription) {
    if (subscription) {
      subscription.remove();
    }
  }

  // Obtenir position actuelle
  async getCurrentLocation() {
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High
    });
    return location;
  }

  // Obtenir magasins à proximité
  async getNearbyStores(radius = 5000) {
    const location = await this.getCurrentLocation();

    const nearby = STORES_DATABASE
      .map(store => ({
        ...store,
        distance: this.calculateDistance(
          location.coords.latitude,
          location.coords.longitude,
          store.lat,
          store.lng
        )
      }))
      .filter(store => store.distance <= radius)
      .sort((a, b) => a.distance - b.distance);

    return nearby;
  }

  // Détecter si actuellement dans un magasin
  async isCurrentlyInStore() {
    const location = await this.getCurrentLocation();
    const nearestStore = this.findNearestStore(
      location.coords.latitude,
      location.coords.longitude
    );
    return nearestStore;
  }
}

// Export singleton
export default new GeolocationService();
