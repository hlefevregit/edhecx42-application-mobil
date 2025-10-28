import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const GamificationPanel = ({ profile, navigation }) => {
  const achievements = [
    { id: 1, icon: '🔥', name: 'Série en cours', value: profile?.currentStreak || 0, unit: 'jours' },
    { id: 2, icon: '🎯', name: 'Défis complétés', value: profile?.completedChallenges || 0, unit: 'défis' },
    { id: 3, icon: '⭐', name: 'XP total', value: profile?.knorrXP || 0, unit: 'XP' },
    { id: 4, icon: '🏆', name: 'Classement', value: profile?.leaderboardRank || '-', unit: '' },
  ];

  const challenges = [
    { id: 1, name: 'Cuisinier du jour', description: 'Publie 1 recette', progress: 0.6, reward: 50 },
    { id: 2, name: 'Social butterfly', description: 'Like 10 posts', progress: 0.3, reward: 30 },
    { id: 3, name: 'Chef étoilé', description: 'Obtiens 100 likes', progress: 0.85, reward: 100 },
  ];

  return (
    <View style={styles.container}>
      {/* Header avec points */}
      <LinearGradient colors={['#f39c12', '#e67e22']} style={styles.pointsHeader}>
        <View style={styles.pointsContent}>
          <Ionicons name="gift" size={32} color="#fff" />
          <View style={styles.pointsInfo}>
            <Text style={styles.pointsValue}>{profile?.rewardPoints || 0}</Text>
            <Text style={styles.pointsLabel}>Points Knorr</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.shopButton}
          onPress={() => navigation.navigate('KnorrShop')}
        >
          <Ionicons name="cart" size={20} color="#f39c12" />
          <Text style={styles.shopButtonText}>Boutique</Text>
        </TouchableOpacity>
      </LinearGradient>

      {/* Achievements rapides */}
      <View style={styles.achievementsGrid}>
        {achievements.map((achievement) => (
          <View key={achievement.id} style={styles.achievementCard}>
            <Text style={styles.achievementIcon}>{achievement.icon}</Text>
            <Text style={styles.achievementValue}>
              {achievement.value}
              <Text style={styles.achievementUnit}> {achievement.unit}</Text>
            </Text>
            <Text style={styles.achievementName}>{achievement.name}</Text>
          </View>
        ))}
      </View>

      {/* Défis en cours */}
      <View style={styles.challengesSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🎮 Défis en cours</Text>
          <TouchableOpacity onPress={() => navigation.navigate('KnorrChallenges')}>
            <Text style={styles.seeAllText}>Voir tout</Text>
          </TouchableOpacity>
        </View>

        {challenges.map((challenge) => (
          <View key={challenge.id} style={styles.challengeCard}>
            <View style={styles.challengeInfo}>
              <Text style={styles.challengeName}>{challenge.name}</Text>
              <Text style={styles.challengeDescription}>{challenge.description}</Text>
              
              {/* Progress bar */}
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: `${challenge.progress * 100}%` }]} />
                </View>
                <Text style={styles.progressText}>{Math.round(challenge.progress * 100)}%</Text>
              </View>
            </View>
            
            <View style={styles.challengeReward}>
              <Ionicons name="gift" size={20} color="#f39c12" />
              <Text style={styles.rewardText}>+{challenge.reward}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Leaderboard preview */}
      <TouchableOpacity
        style={styles.leaderboardCard}
        onPress={() => navigation.navigate('KnorrLeaderboard')}
      >
        <LinearGradient colors={['#8e44ad', '#9b59b6']} style={styles.leaderboardGradient}>
          <View style={styles.leaderboardContent}>
            <View style={styles.leaderboardLeft}>
              <Ionicons name="trophy" size={32} color="#fff" />
              <View style={styles.leaderboardInfo}>
                <Text style={styles.leaderboardTitle}>Classement Knorr</Text>
                <Text style={styles.leaderboardSubtitle}>
                  Tu es #{profile?.leaderboardRank || '-'} cette semaine
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#fff" />
          </View>
        </LinearGradient>
      </TouchableOpacity>

      {/* Daily streak */}
      <View style={styles.streakCard}>
        <View style={styles.streakHeader}>
          <Text style={styles.streakTitle}>🔥 Série quotidienne</Text>
          <Text style={styles.streakValue}>{profile?.currentStreak || 0} jours</Text>
        </View>
        <View style={styles.streakDays}>
          {[...Array(7)].map((_, index) => {
            const isActive = index < (profile?.currentStreak || 0);
            return (
              <View
                key={index}
                style={[styles.streakDay, isActive && styles.streakDayActive]}
              >
                <Text style={[styles.streakDayText, isActive && styles.streakDayTextActive]}>
                  {['L', 'M', 'M', 'J', 'V', 'S', 'D'][index]}
                </Text>
              </View>
            );
          })}
        </View>
        <Text style={styles.streakHint}>
          Reviens demain pour maintenir ta série ! +10 XP
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
  },
  pointsHeader: {
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pointsContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pointsInfo: {
    marginLeft: 15,
  },
  pointsValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  pointsLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
  },
  shopButton: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    gap: 6,
  },
  shopButtonText: {
    color: '#f39c12',
    fontWeight: '600',
    fontSize: 14,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingHorizontal: 20,
    marginTop: 20,
  },
  achievementCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 15,
    width: '48%',
    alignItems: 'center',
  },
  achievementIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  achievementValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  achievementUnit: {
    fontSize: 12,
    color: '#999',
  },
  achievementName: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  challengesSection: {
    marginTop: 25,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAllText: {
    fontSize: 14,
    color: '#006e3e',
    fontWeight: '600',
  },
  challengeCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  challengeInfo: {
    flex: 1,
  },
  challengeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  challengeDescription: {
    fontSize: 13,
    color: '#999',
    marginBottom: 10,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  progressBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#006e3e',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
    width: 40,
  },
  challengeReward: {
    alignItems: 'center',
    marginLeft: 10,
  },
  rewardText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#f39c12',
    marginTop: 4,
  },
  leaderboardCard: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  leaderboardGradient: {
    padding: 20,
  },
  leaderboardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leaderboardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  leaderboardInfo: {
    marginLeft: 15,
    flex: 1,
  },
  leaderboardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  leaderboardSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
  },
  streakCard: {
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    borderWidth: 2,
    borderColor: '#ff6b6b',
  },
  streakHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  streakTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  streakValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ff6b6b',
  },
  streakDays: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  streakDay: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  streakDayActive: {
    backgroundColor: '#ff6b6b',
    borderColor: '#ff6b6b',
  },
  streakDayText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
  },
  streakDayTextActive: {
    color: '#fff',
  },
  streakHint: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
});

export default GamificationPanel;