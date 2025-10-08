import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Switch,
  ActivityIndicator
} from 'react-native';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import geolocationService from '../services/geolocationService';

const screenWidth = Dimensions.get('window').width;

const StatsScreenV2 = ({ navigation }) => {
  const [stats, setStats] = useState(null);
  const [trackingEnabled, setTrackingEnabled] = useState(false);
  const [currentStore, setCurrentStore] = useState(null);
  const [nearbyStores, setNearbyStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trackingSubscription, setTrackingSubscription] = useState(null);

  const userId = auth.currentUser?.uid;

  useEffect(() => {
    loadStats();
    checkGDPRConsent();
    loadNearbyStores();
  }, []);

  useEffect(() => {
    if (trackingEnabled) {
      startTracking();
    } else {
      stopTracking();
    }

    return () => stopTracking();
  }, [trackingEnabled]);

  const checkGDPRConsent = async () => {
    if (!userId) return;

    try {
      const docRef = doc(db, 'users', userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const consent = docSnap.data().profile?.gdprConsent?.geolocation;
        setTrackingEnabled(consent || false);
      }
    } catch (error) {
      console.error('Erreur GDPR:', error);
    }
  };

  const loadStats = async () => {
    if (!userId) return;

    try {
      const docRef = doc(db, 'stats', userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setStats(docSnap.data());
      } else {
        // Créer stats par défaut
        const defaultStats = {
          shopVisits: [],
          savings: { monthly: 0, total: 0 },
          routines: {
            avgShoppingTime: 0,
            totalVisits: 0,
            favoriteStore: null
          }
        };
        setStats(defaultStats);
      }
    } catch (error) {
      console.error('Erreur stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadNearbyStores = async () => {
    try {
      const stores = await geolocationService.getNearbyStores(5000);
      setNearbyStores(stores);
    } catch (error) {
      console.error('Erreur magasins proches:', error);
    }
  };

  const startTracking = async () => {
    try {
      await geolocationService.initialize(userId);
      const subscription = await geolocationService.startTracking();
      setTrackingSubscription(subscription);

      // Vérifier immédiatement si dans un magasin
      const inStore = await geolocationService.isCurrentlyInStore();
      setCurrentStore(inStore);

      // Vérifier périodiquement
      const interval = setInterval(async () => {
        const store = await geolocationService.isCurrentlyInStore();
        setCurrentStore(store);

        // Recharger stats si changement
        if (store !== currentStore) {
          await loadStats();
        }
      }, 15000); // Toutes les 15 secondes

      return () => clearInterval(interval);
    } catch (error) {
      console.error('Erreur tracking:', error);
      setTrackingEnabled(false);
    }
  };

  const stopTracking = () => {
    if (trackingSubscription) {
      geolocationService.stopTracking(trackingSubscription);
      setTrackingSubscription(null);
    }
    setCurrentStore(null);
  };

  const toggleTracking = async (value) => {
    // Mettre à jour le consentement GDPR
    try {
      const docRef = doc(db, 'users', userId);
      await updateDoc(docRef, {
        'profile.gdprConsent.geolocation': value
      });
      setTrackingEnabled(value);
    } catch (error) {
      console.error('Erreur toggle:', error);
    }
  };

  const getChartData = () => {
    if (!stats?.shopVisits || stats.shopVisits.length === 0) {
      return {
        labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'],
        datasets: [{ data: [0, 0, 0, 0] }]
      };
    }

    // Regrouper par semaine (4 dernières semaines)
    const weeks = Array(4).fill(0);
    const now = new Date();

    stats.shopVisits.forEach(visit => {
      const visitDate = new Date(visit.date);
      const weeksDiff = Math.floor((now - visitDate) / (7 * 24 * 60 * 60 * 1000));

      if (weeksDiff < 4) {
        weeks[3 - weeksDiff] += visit.duration;
      }
    });

    return {
      labels: ['S-3', 'S-2', 'S-1', 'Cette sem.'],
      datasets: [{ data: weeks.map(w => Math.round(w)) }]
    };
  };

  const getStoreTypeChart = () => {
    if (!stats?.shopVisits || stats.shopVisits.length === 0) {
      return [];
    }

    const types = {};
    stats.shopVisits.forEach(visit => {
      const type = visit.storeType || 'supermarché';
      types[type] = (types[type] || 0) + 1;
    });

    const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6'];

    return Object.entries(types).map(([name, count], index) => ({
      name,
      population: count,
      color: colors[index % colors.length],
      legendFontColor: '#333',
      legendFontSize: 14
    }));
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2ecc71" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Tracking en temps réel */}
      <View style={styles.trackingCard}>
        <View style={styles.trackingHeader}>
          <View>
            <Text style={styles.trackingTitle}>📍 Tracking Temps Réel</Text>
            <Text style={styles.trackingSubtitle}>
              {trackingEnabled ? 'Actif' : 'Désactivé'}
            </Text>
          </View>
          <Switch
            value={trackingEnabled}
            onValueChange={toggleTracking}
            trackColor={{ false: '#ddd', true: '#2ecc71' }}
            thumbColor={trackingEnabled ? '#fff' : '#f4f3f4'}
          />
        </View>

        {trackingEnabled && currentStore && (
          <View style={styles.currentStore}>
            <Ionicons name="location" size={24} color="#2ecc71" />
            <View style={styles.currentStoreInfo}>
              <Text style={styles.currentStoreName}>
                🏪 {currentStore.name}
              </Text>
              <Text style={styles.currentStoreDistance}>
                À {Math.round(currentStore.distance)}m
              </Text>
            </View>
          </View>
        )}

        {trackingEnabled && !currentStore && (
          <Text style={styles.noStoreText}>
            Aucun magasin détecté à proximité
          </Text>
        )}
      </View>

      {/* Bouton Frigo */}
      <TouchableOpacity
        style={styles.fridgeButton}
        onPress={() => navigation.navigate('Fridge')}
      >
        <Ionicons name="snow" size={32} color="#fff" />
        <Text style={styles.fridgeButtonText}>Mon Frigo Intelligent</Text>
      </TouchableOpacity>

      {/* Stats principales */}
      <View style={styles.header}>
        <Text style={styles.title}>Mes Statistiques</Text>
      </View>

      {/* KPIs */}
      <View style={styles.kpiRow}>
        <View style={styles.kpiCard}>
          <Ionicons name="time-outline" size={32} color="#3498db" />
          <Text style={styles.kpiValue}>
            {stats?.routines?.avgShoppingTime || 0} min
          </Text>
          <Text style={styles.kpiLabel}>Temps moyen</Text>
        </View>

        <View style={styles.kpiCard}>
          <Ionicons name="cart-outline" size={32} color="#2ecc71" />
          <Text style={styles.kpiValue}>
            {stats?.routines?.totalVisits || 0}
          </Text>
          <Text style={styles.kpiLabel}>Visites</Text>
        </View>

        <View style={styles.kpiCard}>
          <Ionicons name="cash-outline" size={32} color="#f39c12" />
          <Text style={styles.kpiValue}>
            {stats?.savings?.total?.toFixed(0) || 0}€
          </Text>
          <Text style={styles.kpiLabel}>Économisé</Text>
        </View>
      </View>

      {/* Graphique temps */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>⏱️ Temps par semaine</Text>
        <LineChart
          data={getChartData()}
          width={screenWidth - 60}
          height={220}
          chartConfig={{
            backgroundColor: '#fff',
            backgroundGradientFrom: '#fff',
            backgroundGradientTo: '#fff',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(46, 204, 113, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: { borderRadius: 16 },
            propsForDots: {
              r: '6',
              strokeWidth: '2',
              stroke: '#2ecc71'
            }
          }}
          bezier
          style={styles.chart}
        />
      </View>

      {/* Types de magasins */}
      {getStoreTypeChart().length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🏪 Types de magasins</Text>
          <PieChart
            data={getStoreTypeChart()}
            width={screenWidth - 60}
            height={200}
            chartConfig={{
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            }}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />
        </View>
      )}

      {/* Magasin favori */}
      {stats?.routines?.favoriteStore && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>⭐ Votre magasin favori</Text>
          <View style={styles.favoriteStore}>
            <Ionicons name="heart" size={40} color="#e74c3c" />
            <Text style={styles.favoriteStoreName}>
              {stats.routines.favoriteStore}
            </Text>
          </View>
        </View>
      )}

      {/* Magasins à proximité */}
      {nearbyStores.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📍 Magasins à proximité</Text>
          {nearbyStores.slice(0, 5).map((store, index) => (
            <View key={store.id} style={styles.nearbyStoreItem}>
              <View style={styles.nearbyStoreInfo}>
                <Text style={styles.nearbyStoreName}>
                  🏪 {store.name}
                </Text>
                <Text style={styles.nearbyStoreType}>{store.type}</Text>
              </View>
              <Text style={styles.nearbyStoreDistance}>
                {(store.distance / 1000).toFixed(1)} km
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Visites récentes */}
      {stats?.shopVisits && stats.shopVisits.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🏪 Visites récentes</Text>
          {stats.shopVisits.slice(-5).reverse().map((visit, index) => (
            <View key={index} style={styles.visitItem}>
              <View style={styles.visitInfo}>
                <Text style={styles.visitStore}>{visit.storeName}</Text>
                <Text style={styles.visitDate}>
                  {new Date(visit.date).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Text>
              </View>
              <Text style={styles.visitDuration}>{visit.duration} min</Text>
            </View>
          ))}
        </View>
      )}

      {/* Info RGPD */}
      <View style={styles.infoCard}>
        <Ionicons name="shield-checkmark-outline" size={20} color="#3498db" />
        <Text style={styles.infoText}>
          Le tracking géographique est conforme RGPD. Vos données sont chiffrées et vous pouvez le désactiver à tout moment.
        </Text>
      </View>
    </ScrollView>
  );
};

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
  trackingCard: {
    backgroundColor: '#fff',
    margin: 15,
    marginTop: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  trackingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trackingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  trackingSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  currentStore: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    padding: 15,
    backgroundColor: '#e8f8f5',
    borderRadius: 8,
  },
  currentStoreInfo: {
    marginLeft: 12,
    flex: 1,
  },
  currentStoreName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  currentStoreDistance: {
    fontSize: 14,
    color: '#2ecc71',
    marginTop: 2,
  },
  noStoreText: {
    marginTop: 15,
    textAlign: 'center',
    color: '#999',
    fontSize: 14,
  },
  fridgeButton: {
    backgroundColor: '#3498db',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    margin: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  fridgeButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  kpiRow: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    gap: 10,
    marginBottom: 15,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  kpiValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  kpiLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  favoriteStore: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff5f5',
    borderRadius: 8,
  },
  favoriteStoreName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#e74c3c',
    marginLeft: 15,
  },
  nearbyStoreItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  nearbyStoreInfo: {
    flex: 1,
  },
  nearbyStoreName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  nearbyStoreType: {
    fontSize: 13,
    color: '#999',
    marginTop: 2,
  },
  nearbyStoreDistance: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3498db',
  },
  visitItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  visitInfo: {
    flex: 1,
  },
  visitStore: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  visitDate: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
  visitDuration: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3498db',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#e8f4fd',
    margin: 15,
    padding: 15,
    borderRadius: 8,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 13,
    color: '#3498db',
    lineHeight: 18,
  },
});

export default StatsScreenV2;
