import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import { Ionicons } from '@expo/vector-icons';

const screenWidth = Dimensions.get('window').width;

const StatsScreen = ({ navigation }) => {
  const [stats, setStats] = useState(null);
  const userId = auth.currentUser?.uid;

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    if (!userId) return;
    
    try {
      const docRef = doc(db, 'stats', userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setStats(docSnap.data());
      } else {
        // Créer des stats par défaut pour la démo
        setStats({
          shopVisits: [
            { date: new Date('2025-09-15'), duration: 45, storeName: 'Carrefour' },
            { date: new Date('2025-09-22'), duration: 38, storeName: 'Leclerc' },
            { date: new Date('2025-09-29'), duration: 42, storeName: 'Carrefour' },
            { date: new Date('2025-10-01'), duration: 35, storeName: 'Auchan' }
          ],
          savings: {
            monthly: 45.50,
            total: 180.20
          },
          routines: {
            avgShoppingTime: 40,
            mostBoughtCategories: ['Fruits et légumes', 'Produits laitiers', 'Épicerie']
          }
        });
      }
    } catch (error) {
      console.error('Erreur chargement stats:', error);
    }
  };

  // Données pour le graphique
  const getChartData = () => {
    if (!stats?.shopVisits) {
      return {
        labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'],
        datasets: [{
          data: [45, 38, 42, 35]
        }]
      };
    }

    const labels = stats.shopVisits.map((visit, index) => `Visite ${index + 1}`);
    const data = stats.shopVisits.map(visit => visit.duration);

    return {
      labels,
      datasets: [{ data }]
    };
  };

  return (
    <ScrollView style={styles.container}>
      {/* Bouton Frigo en haut */}
      <TouchableOpacity
        style={styles.fridgeButton}
        onPress={() => navigation.navigate('Fridge')}
      >
        <Ionicons name="snow" size={32} color="#fff" />
        <Text style={styles.fridgeButtonText}>Mon Frigo</Text>
      </TouchableOpacity>

      {/* Titre */}
      <View style={styles.header}>
        <Text style={styles.title}>Mes Statistiques</Text>
      </View>

      {/* Temps passé en magasin */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>⏱️ Temps passé en magasin</Text>
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
            style: {
              borderRadius: 16
            },
            propsForDots: {
              r: '6',
              strokeWidth: '2',
              stroke: '#2ecc71'
            }
          }}
          bezier
          style={styles.chart}
        />
        <Text style={styles.chartCaption}>
          Temps moyen : {stats?.routines?.avgShoppingTime || 40} minutes
        </Text>
      </View>

      {/* Économies réalisées */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>💰 Économies réalisées</Text>
        <View style={styles.savingsContainer}>
          <View style={styles.savingItem}>
            <Text style={styles.savingLabel}>Ce mois-ci</Text>
            <Text style={styles.savingAmount}>
              {stats?.savings?.monthly?.toFixed(2) || '0.00'} €
            </Text>
          </View>
          <View style={styles.savingItem}>
            <Text style={styles.savingLabel}>Total</Text>
            <Text style={styles.savingAmount}>
              {stats?.savings?.total?.toFixed(2) || '0.00'} €
            </Text>
          </View>
        </View>
      </View>

      {/* Routines alimentaires */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🍽️ Catégories favorites</Text>
        {stats?.routines?.mostBoughtCategories?.map((category, index) => (
          <View key={index} style={styles.categoryItem}>
            <View style={styles.categoryDot} />
            <Text style={styles.categoryText}>{category}</Text>
          </View>
        ))}
      </View>

      {/* Visites récentes */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🏪 Visites récentes</Text>
        {stats?.shopVisits?.map((visit, index) => (
          <View key={index} style={styles.visitItem}>
            <View style={styles.visitInfo}>
              <Text style={styles.visitStore}>{visit.storeName}</Text>
              <Text style={styles.visitDate}>
                {new Date(visit.date).toLocaleDateString('fr-FR')}
              </Text>
            </View>
            <Text style={styles.visitDuration}>{visit.duration} min</Text>
          </View>
        ))}
      </View>

      {/* Info géolocalisation */}
      <View style={styles.infoCard}>
        <Ionicons name="location-outline" size={20} color="#3498db" />
        <Text style={styles.infoText}>
          Ces statistiques sont calculées grâce à la géolocalisation.
          Vous pouvez modifier vos préférences dans votre profil.
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
  fridgeButton: {
    backgroundColor: '#3498db',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    margin: 15,
    marginTop: 20,
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
  chartCaption: {
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
    marginTop: 10,
  },
  savingsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  savingItem: {
    alignItems: 'center',
  },
  savingLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  savingAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2ecc71',
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2ecc71',
    marginRight: 12,
  },
  categoryText: {
    fontSize: 16,
    color: '#555',
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

export default StatsScreen;