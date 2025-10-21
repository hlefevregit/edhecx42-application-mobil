import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  doc,
  getDoc,
  updateDoc,
  increment,
  arrayUnion
} from 'firebase/firestore';
import { db } from '../../firebaseConfig'; // garde si tu utilises encore Firestore ici
import { useAuth } from '../../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export default function KnorrChallengesScreen({ navigation }) {
  const { user } = useAuth();
  const userId = user?.id;

  const [userChallenges, setUserChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [knorrProfile, setKnorrProfile] = useState(null);

  // Définition des défis (à stocker en BDD en prod)
  const ALL_CHALLENGES = [
    {
      id: 'weekly_1',
      name: '🔥 Créateur Actif',
      description: 'Publier 3 posts cette semaine',
      type: 'weekly',
      target: 3,
      xpReward: 50,
      pointsReward: 20,
      category: 'creation',
      icon: '✍️',
      color: '#e74c3c'
    },
    {
      id: 'weekly_2',
      name: '❤️ Engagé',
      description: 'Liker 20 posts cette semaine',
      type: 'weekly',
      target: 20,
      xpReward: 30,
      pointsReward: 10,
      category: 'engagement',
      icon: '❤️',
      color: '#e91e63'
    },
    {
      id: 'weekly_3',
      name: '👥 Social',
      description: 'Suivre 5 nouveaux créateurs',
      type: 'weekly',
      target: 5,
      xpReward: 40,
      pointsReward: 15,
      category: 'social',
      icon: '👥',
      color: '#9c27b0'
    },
    {
      id: 'weekly_4',
      name: '🎥 Vidéaste',
      description: 'Publier 1 vidéo de recette Knorr',
      type: 'weekly',
      target: 1,
      xpReward: 60,
      pointsReward: 25,
      category: 'creation',
      icon: '🎥',
      color: '#673ab7'
    },
    {
      id: 'monthly_1',
      name: '🏆 Influenceur',
      description: 'Obtenir 100 likes ce mois-ci',
      type: 'monthly',
      target: 100,
      xpReward: 200,
      pointsReward: 80,
      category: 'influence',
      icon: '🏆',
      color: '#f39c12'
    },
    {
      id: 'monthly_2',
      name: '🔝 Top Chef',
      description: 'Publier 12 recettes ce mois',
      type: 'monthly',
      target: 12,
      xpReward: 250,
      pointsReward: 100,
      category: 'creation',
      icon: '👨‍🍳',
      color: '#ff9800'
    },
    {
      id: 'daily_1',
      name: '⚡ Quotidien',
      description: 'Se connecter tous les jours',
      type: 'daily',
      target: 1,
      xpReward: 5,
      pointsReward: 2,
      category: 'daily',
      icon: '⚡',
      color: '#4caf50'
    },
    {
      id: 'special_1',
      name: '🌟 Première Vidéo',
      description: 'Publier votre première vidéo',
      type: 'special',
      target: 1,
      xpReward: 100,
      pointsReward: 40,
      category: 'milestone',
      icon: '🌟',
      color: '#2196f3'
    },
  ];

  useEffect(() => {
    loadChallenges();
  }, []);

  const loadChallenges = async () => {
    try {
      // Charger profil Knorr
      const knorrDoc = await getDoc(doc(db, 'knorr_user_profiles', userId));
      if (knorrDoc.exists()) {
        setKnorrProfile(knorrDoc.data());
      }

      // Charger progression défis
      const challengesDoc = await getDoc(doc(db, 'user_challenges', userId));
      
      if (challengesDoc.exists()) {
        setUserChallenges(challengesDoc.data().challenges || []);
      } else {
        // Initialiser les défis
        const initialChallenges = ALL_CHALLENGES.map(challenge => ({
          challengeId: challenge.id,
          progress: 0,
          completed: false,
          completedAt: null,
          startedAt: new Date()
        }));
        setUserChallenges(initialChallenges);
      }

    } catch (error) {
      console.error('Erreur chargement défis:', error);
    } finally {
      setLoading(false);
    }
  };

  const getChallengeProgress = (challengeId) => {
    const userChallenge = userChallenges.find(c => c.challengeId === challengeId);
    return userChallenge || { progress: 0, completed: false };
  };

  const completeChallenge = async (challenge) => {
    const userChallenge = getChallengeProgress(challenge.id);

    if (userChallenge.completed) {
      Alert.alert('Déjà complété', 'Vous avez déjà terminé ce défi !');
      return;
    }

    if (userChallenge.progress < challenge.target) {
      Alert.alert(
        'Défi en cours',
        `Progression : ${userChallenge.progress}/${challenge.target}`,
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      // Marquer défi comme complété
      const challengesRef = doc(db, 'user_challenges', userId);
      const updatedChallenges = userChallenges.map(c => 
        c.challengeId === challenge.id 
          ? { ...c, completed: true, completedAt: new Date() }
          : c
      );

      await updateDoc(challengesRef, {
        challenges: updatedChallenges
      });

      // Récompenser l'utilisateur
      const userRef = doc(db, 'knorr_user_profiles', userId);
      await updateDoc(userRef, {
        knorrXP: increment(challenge.xpReward),
        rewardPoints: increment(challenge.pointsReward),
        'stats.challengesCompleted': increment(1)
      });

      // Vérifier badge "Champion"
      const completedCount = updatedChallenges.filter(c => c.completed).length;
      if (completedCount >= 5 && !knorrProfile?.badges?.includes('champion')) {
        await updateDoc(userRef, {
          badges: arrayUnion('champion')
        });
        Alert.alert('🏆 Nouveau Badge !', 'Champion - Compléter 5 défis');
      }

      setUserChallenges(updatedChallenges);

      Alert.alert(
        '🎉 Défi Complété !',
        `Récompenses :\n+${challenge.xpReward} XP\n+${challenge.pointsReward} Points Knorr`,
        [
          { text: 'Super !', onPress: () => loadChallenges() }
        ]
      );

    } catch (error) {
      console.error('Erreur complétion défi:', error);
      Alert.alert('Erreur', 'Impossible de valider le défi');
    }
  };

  const getWeekNumber = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const diff = now - start;
    const oneWeek = 1000 * 60 * 60 * 24 * 7;
    return Math.floor(diff / oneWeek);
  };

  const renderChallenge = (challenge) => {
    const userProgress = getChallengeProgress(challenge.id);
    const progressPercent = (userProgress.progress / challenge.target) * 100;
    const isCompleted = userProgress.completed;
    const isCompletable = userProgress.progress >= challenge.target && !isCompleted;

    return (
      <TouchableOpacity
        key={challenge.id}
        style={[
          styles.challengeCard,
          isCompleted && styles.challengeCardCompleted
        ]}
        onPress={() => isCompletable && completeChallenge(challenge)}
        disabled={isCompleted}
      >
        <LinearGradient
          colors={isCompleted ? ['#2ecc71', '#27ae60'] : [challenge.color, challenge.color + 'dd']}
          style={styles.challengeGradient}
        >
          {/* Icon */}
          <View style={styles.challengeIcon}>
            <Text style={styles.challengeEmoji}>{challenge.icon}</Text>
          </View>

          {/* Info */}
          <View style={styles.challengeInfo}>
            <Text style={styles.challengeName}>{challenge.name}</Text>
            <Text style={styles.challengeDesc}>{challenge.description}</Text>

            {/* Progress */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${Math.min(progressPercent, 100)}%` }]} />
              </View>
              <Text style={styles.progressText}>
                {userProgress.progress}/{challenge.target}
              </Text>
            </View>

            {/* Rewards */}
            <View style={styles.rewards}>
              <View style={styles.reward}>
                <Ionicons name="star" size={14} color="#f39c12" />
                <Text style={styles.rewardText}>+{challenge.xpReward} XP</Text>
              </View>
              <View style={styles.reward}>
                <Ionicons name="gift" size={14} color="#e63946" />
                <Text style={styles.rewardText}>+{challenge.pointsReward} pts</Text>
              </View>
            </View>
          </View>

          {/* Status */}
          {isCompleted && (
            <View style={styles.completedBadge}>
              <Ionicons name="checkmark-circle" size={32} color="#fff" />
            </View>
          )}

          {isCompletable && (
            <View style={styles.claimBadge}>
              <Text style={styles.claimText}>Réclamer !</Text>
            </View>
          )}

          {/* Type Badge */}
          <View style={styles.typeBadge}>
            <Text style={styles.typeBadgeText}>{challenge.type}</Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#e63946" />
        <Text style={styles.loadingText}>Chargement des défis...</Text>
      </View>
    );
  }

  const weeklyChallenges = ALL_CHALLENGES.filter(c => c.type === 'weekly');
  const monthlyChallenges = ALL_CHALLENGES.filter(c => c.type === 'monthly');
  const dailyChallenges = ALL_CHALLENGES.filter(c => c.type === 'daily');
  const specialChallenges = ALL_CHALLENGES.filter(c => c.type === 'special');

  const completedCount = userChallenges.filter(c => c.completed).length;

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#e63946', '#c1121f']}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>🏆 Défis Knorr</Text>
          <Text style={styles.headerSubtitle}>
            {completedCount}/{ALL_CHALLENGES.length} complétés
          </Text>
        </View>

        <View style={{ width: 24 }} />
      </LinearGradient>

      {/* Stats rapides */}
      <View style={styles.quickStats}>
        <View style={styles.quickStat}>
          <Ionicons name="flame" size={24} color="#f39c12" />
          <Text style={styles.quickStatValue}>{knorrProfile?.knorrXP || 0}</Text>
          <Text style={styles.quickStatLabel}>XP Total</Text>
        </View>

        <View style={styles.quickStat}>
          <Ionicons name="trophy" size={24} color="#e63946" />
          <Text style={styles.quickStatValue}>{completedCount}</Text>
          <Text style={styles.quickStatLabel}>Défis réussis</Text>
        </View>

        <View style={styles.quickStat}>
          <Ionicons name="gift" size={24} color="#9b59b6" />
          <Text style={styles.quickStatValue}>{knorrProfile?.rewardPoints || 0}</Text>
          <Text style={styles.quickStatLabel}>Points</Text>
        </View>
      </View>

      {/* Section Quotidiens */}
      {dailyChallenges.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚡ Défis Quotidiens</Text>
          {dailyChallenges.map(renderChallenge)}
        </View>
      )}

      {/* Section Hebdomadaires */}
      {weeklyChallenges.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🔥 Défis Hebdomadaires</Text>
            <Text style={styles.sectionSubtitle}>Semaine {getWeekNumber()}</Text>
          </View>
          {weeklyChallenges.map(renderChallenge)}
        </View>
      )}

      {/* Section Mensuels */}
      {monthlyChallenges.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🏆 Défis Mensuels</Text>
            <Text style={styles.sectionSubtitle}>
              {new Date().toLocaleDateString('fr-FR', { month: 'long' })}
            </Text>
          </View>
          {monthlyChallenges.map(renderChallenge)}
        </View>
      )}

      {/* Section Spéciaux */}
      {specialChallenges.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🌟 Défis Spéciaux</Text>
          {specialChallenges.map(renderChallenge)}
        </View>
      )}

      <View style={{ height: 40 }} />
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
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  quickStats: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    margin: 15,
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickStat: {
    flex: 1,
    alignItems: 'center',
  },
  quickStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  quickStatLabel: {
    fontSize: 11,
    color: '#666',
    marginTop: 4,
  },
  section: {
    marginBottom: 20,
    paddingHorizontal: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  challengeCard: {
    marginBottom: 15,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  challengeCardCompleted: {
    opacity: 0.7,
  },
  challengeGradient: {
    flexDirection: 'row',
    padding: 15,
    position: 'relative',
  },
  challengeIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  challengeEmoji: {
    fontSize: 32,
  },
  challengeInfo: {
    flex: 1,
  },
  challengeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  challengeDesc: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 10,
  },
  progressContainer: {
    marginBottom: 10,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 5,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fff',
  },
  progressText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  rewards: {
    flexDirection: 'row',
    gap: 15,
  },
  reward: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  rewardText: {
    marginLeft: 5,
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  completedBadge: {
    position: 'absolute',
    top: 15,
    right: 15,
  },
  claimBadge: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: '#f39c12',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  claimText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  typeBadge: {
    position: 'absolute',
    bottom: 15,
    right: 15,
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  typeBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});