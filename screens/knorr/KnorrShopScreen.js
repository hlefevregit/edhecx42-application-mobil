import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  Modal,
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  addDoc,
  increment
} from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { useAuth } from '../../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';

export default function KnorrShopScreen({ navigation }) {
  const { user } = useAuth();
  const userId = user?.id;

  const [rewards, setRewards] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [userRewards, setUserRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReward, setSelectedReward] = useState(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showMyRewardsModal, setShowMyRewardsModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await Promise.all([
      loadUserProfile(),
      loadRewards(),
      loadUserRewards()
    ]);
    setLoading(false);
  };

  const loadUserProfile = async () => {
    if (!userId) return;

    try {
      const docRef = doc(db, 'knorr_user_profiles', userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setUserProfile(docSnap.data());
      }
    } catch (error) {
      console.error('Erreur profil:', error);
    }
  };

  const loadRewards = async () => {
    try {
      const q = query(
        collection(db, 'knorr_rewards'),
        where('active', '==', true)
      );

      const snapshot = await getDocs(q);
      const rewardsData = [];

      snapshot.forEach(doc => {
        const data = doc.data();
        // Vérifier si encore disponible
        if (data.remainingStock > 0) {
          rewardsData.push({
            id: doc.id,
            ...data
          });
        }
      });

      // Trier par pointsCost
      rewardsData.sort((a, b) => a.pointsCost - b.pointsCost);
      setRewards(rewardsData);
    } catch (error) {
      console.error('Erreur rewards:', error);
    }
  };

  const loadUserRewards = async () => {
    if (!userId) return;

    try {
      const q = query(
        collection(db, 'knorr_user_rewards'),
        where('userId', '==', userId),
        where('status', 'in', ['active', 'used'])
      );

      const snapshot = await getDocs(q);
      const userRewardsData = [];

      snapshot.forEach(doc => {
        userRewardsData.push({
          id: doc.id,
          ...doc.data()
        });
      });

      setUserRewards(userRewardsData);
    } catch (error) {
      console.error('Erreur user rewards:', error);
    }
  };

  const handlePurchaseReward = (reward) => {
    // Vérifications
    const userPoints = userProfile?.rewardPoints || 0;
    const userLevel = userProfile?.knorrLevel || 1;

    if (userPoints < reward.pointsCost) {
      Alert.alert(
        '❌ Points insuffisants',
        `Il vous manque ${reward.pointsCost - userPoints} points pour cette récompense.`,
        [{ text: 'OK' }]
      );
      return;
    }

    if (userLevel < reward.minLevel) {
      Alert.alert(
        '🔒 Niveau requis',
        `Vous devez atteindre le niveau ${reward.minLevel} pour cette récompense. (Vous êtes niveau ${userLevel})`,
        [{ text: 'OK' }]
      );
      return;
    }

    setSelectedReward(reward);
    setShowPurchaseModal(true);
  };

  const confirmPurchase = async () => {
    if (!selectedReward) return;

    try {
      // Générer code promo unique
      const promoCode = generatePromoCode();
      const barcodeEAN = generateEAN13();

      // Créer la récompense utilisateur
      await addDoc(collection(db, 'knorr_user_rewards'), {
        userId,
        rewardId: selectedReward.id,
        promoCode,
        barcode: barcodeEAN,
        status: 'active',
        acquiredAt: new Date(),
        usedAt: null,
        usedStore: null,
        rewardData: {
          title: selectedReward.title,
          discountType: selectedReward.discountType,
          discountValue: selectedReward.discountValue,
          validUntil: selectedReward.validUntil
        }
      });

      // Débiter les points
      const userRef = doc(db, 'knorr_user_profiles', userId);
      await updateDoc(userRef, {
        rewardPoints: increment(-selectedReward.pointsCost)
      });

      // Décrémenter stock
      const rewardRef = doc(db, 'knorr_rewards', selectedReward.id);
      await updateDoc(rewardRef, {
        remainingStock: increment(-1)
      });

      // Recharger données
      await loadData();

      setShowPurchaseModal(false);
      Alert.alert(
        '🎉 Récompense acquise !',
        'Votre code promo est disponible dans "Mes Récompenses"',
        [
          { text: 'Voir', onPress: () => setShowMyRewardsModal(true) },
          { text: 'Plus tard' }
        ]
      );
    } catch (error) {
      console.error('Erreur achat reward:', error);
      Alert.alert('Erreur', 'Impossible d\'acquérir cette récompense');
    }
  };

  const generatePromoCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'KNORR-';
    for (let i = 0; i < 6; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    code += '-';
    for (let i = 0; i < 6; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
  };

  const generateEAN13 = () => {
    let ean = '978'; // Préfixe
    for (let i = 0; i < 9; i++) {
      ean += Math.floor(Math.random() * 10);
    }
    // Checksum (simplifié)
    ean += '0';
    return ean;
  };

  const getRewardIcon = (type) => {
    switch (type) {
      case 'discount': return '💰';
      case 'freeProduct': return '🎁';
      case 'exclusive': return '⭐';
      default: return '🎫';
    }
  };

  const renderReward = (reward) => {
    const canAfford = (userProfile?.rewardPoints || 0) >= reward.pointsCost;
    const canAccess = (userProfile?.knorrLevel || 1) >= reward.minLevel;
    const isAvailable = canAfford && canAccess;

    return (
      <TouchableOpacity
        key={reward.id}
        style={[styles.rewardCard, !isAvailable && styles.rewardCardDisabled]}
        onPress={() => handlePurchaseReward(reward)}
        activeOpacity={isAvailable ? 0.7 : 1}
      >
        <Image
          source={{ uri: reward.imageUrl || 'https://via.placeholder.com/150' }}
          style={styles.rewardImage}
        />

        {!isAvailable && (
          <View style={styles.lockedOverlay}>
            <Ionicons name="lock-closed" size={40} color="#fff" />
          </View>
        )}

        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.rewardGradient}
        >
          <View style={styles.rewardInfo}>
            <Text style={styles.rewardIcon}>{getRewardIcon(reward.type)}</Text>
            <Text style={styles.rewardTitle} numberOfLines={2}>
              {reward.title}
            </Text>

            <View style={styles.rewardMeta}>
              <View style={styles.pointsCost}>
                <Ionicons name="gift" size={16} color="#f39c12" />
                <Text style={styles.pointsText}>{reward.pointsCost} pts</Text>
              </View>

              {reward.minLevel > 1 && (
                <View style={styles.levelRequirement}>
                  <Ionicons name="star" size={14} color="#3498db" />
                  <Text style={styles.levelText}>Niv. {reward.minLevel}</Text>
                </View>
              )}
            </View>

            <Text style={styles.stockText}>
              {reward.remainingStock} disponibles
            </Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const renderUserReward = (userReward) => {
    const isActive = userReward.status === 'active';

    return (
      <View key={userReward.id} style={styles.userRewardCard}>
        <View style={styles.userRewardHeader}>
          <Text style={styles.userRewardTitle}>
            {userReward.rewardData.title}
          </Text>
          <View style={[
            styles.statusBadge,
            { backgroundColor: isActive ? '#2ecc71' : '#95a5a6' }
          ]}>
            <Text style={styles.statusText}>
              {isActive ? 'Actif' : 'Utilisé'}
            </Text>
          </View>
        </View>

        <View style={styles.qrContainer}>
          <QRCode
            value={userReward.promoCode}
            size={150}
            backgroundColor="#fff"
          />
        </View>

        <Text style={styles.promoCode}>{userReward.promoCode}</Text>
        <Text style={styles.barcode}>Code-barres : {userReward.barcode}</Text>

        <Text style={styles.validUntil}>
          Valable jusqu'au {new Date(userReward.rewardData.validUntil).toLocaleDateString('fr-FR')}
        </Text>

        {isActive && (
          <Text style={styles.instructions}>
            💡 Présentez ce code en caisse pour bénéficier de votre réduction
          </Text>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#e63946" />
        <Text style={styles.loadingText}>Chargement de la boutique...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#e63946', '#c1121f']}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Boutique Knorr</Text>
          <Text style={styles.headerSubtitle}>Échangez vos points</Text>
        </View>

        <TouchableOpacity onPress={() => setShowMyRewardsModal(true)}>
          <View style={styles.myRewardsBadge}>
            <Ionicons name="ticket" size={20} color="#fff" />
            <Text style={styles.myRewardsBadgeText}>{userRewards.length}</Text>
          </View>
        </TouchableOpacity>
      </LinearGradient>

      {/* Points disponibles */}
      <View style={styles.pointsCard}>
        <View style={styles.pointsInfo}>
          <Ionicons name="gift" size={32} color="#f39c12" />
          <View style={styles.pointsDetails}>
            <Text style={styles.pointsLabel}>Vos points disponibles</Text>
            <Text style={styles.pointsValue}>{userProfile?.rewardPoints || 0}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.earnMoreButton}
          onPress={() => navigation.navigate('KnorrFeed')}
        >
          <Text style={styles.earnMoreText}>Gagner plus</Text>
        </TouchableOpacity>
      </View>

      {/* Liste récompenses */}
      <ScrollView style={styles.rewardsList} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>🎁 Récompenses disponibles</Text>

        <View style={styles.rewardsGrid}>
          {rewards.map(reward => renderReward(reward))}
        </View>

        {rewards.length === 0 && (
          <View style={styles.emptyContainer}>
            <Ionicons name="gift-outline" size={80} color="#ddd" />
            <Text style={styles.emptyText}>
              Aucune récompense disponible
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Modal confirmation achat */}
      <Modal
        visible={showPurchaseModal}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirmer l'échange</Text>

            {selectedReward && (
              <>
                <Image
                  source={{ uri: selectedReward.imageUrl || 'https://via.placeholder.com/200' }}
                  style={styles.modalImage}
                />

                <Text style={styles.modalRewardTitle}>
                  {selectedReward.title}
                </Text>

                <View style={styles.modalDetails}>
                  <View style={styles.modalDetailRow}>
                    <Text style={styles.modalDetailLabel}>Coût :</Text>
                    <Text style={styles.modalDetailValue}>
                      {selectedReward.pointsCost} points
                    </Text>
                  </View>

                  <View style={styles.modalDetailRow}>
                    <Text style={styles.modalDetailLabel}>Après échange :</Text>
                    <Text style={styles.modalDetailValue}>
                      {(userProfile?.rewardPoints || 0) - selectedReward.pointsCost} points
                    </Text>
                  </View>

                  <View style={styles.modalDetailRow}>
                    <Text style={styles.modalDetailLabel}>Valable jusqu'au :</Text>
                    <Text style={styles.modalDetailValue}>
                      {new Date(selectedReward.validUntil).toLocaleDateString('fr-FR')}
                    </Text>
                  </View>
                </View>

                <Text style={styles.modalWarning}>
                  ⚠️ Cet échange est définitif
                </Text>
              </>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowPurchaseModal(false)}
              >
                <Text style={styles.modalButtonText}>Annuler</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={confirmPurchase}
              >
                <Text style={styles.modalButtonText}>Confirmer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal mes récompenses */}
      <Modal
        visible={showMyRewardsModal}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.myRewardsHeader}>
              <Text style={styles.modalTitle}>Mes Récompenses</Text>
              <TouchableOpacity onPress={() => setShowMyRewardsModal(false)}>
                <Ionicons name="close" size={28} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.myRewardsScroll}>
              {userRewards.length > 0 ? (
                userRewards.map(userReward => renderUserReward(userReward))
              ) : (
                <View style={styles.emptyContainer}>
                  <Ionicons name="ticket-outline" size={80} color="#ddd" />
                  <Text style={styles.emptyText}>
                    Aucune récompense acquise
                  </Text>
                  <Text style={styles.emptySubtext}>
                    Échangez vos points dans la boutique !
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
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
    backgroundColor: '#f5f5f5',
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
  myRewardsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  myRewardsBadgeText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 6,
  },
  pointsCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 15,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pointsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pointsDetails: {
    marginLeft: 15,
  },
  pointsLabel: {
    fontSize: 14,
    color: '#666',
  },
  pointsValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#f39c12',
  },
  earnMoreButton: {
    backgroundColor: '#e63946',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  earnMoreText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  rewardsList: {
    flex: 1,
    paddingHorizontal: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  rewardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  rewardCard: {
    width: '48%',
    height: 220,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 15,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  rewardCardDisabled: {
    opacity: 0.6,
  },
  rewardImage: {
    width: '100%',
    height: '100%',
  },
  lockedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rewardGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
  },
  rewardInfo: {
    // Contenu
  },
  rewardIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  rewardTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  rewardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 5,
  },
  pointsCost: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(243, 156, 18, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  pointsText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  levelRequirement: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(52, 152, 219, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  levelText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
  stockText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
    marginTop: 20,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#bbb',
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalImage: {
    width: '100%',
    height: 150,
    borderRadius: 12,
    marginBottom: 15,
  },
  modalRewardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalDetails: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  modalDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  modalDetailLabel: {
    fontSize: 15,
    color: '#666',
  },
  modalDetailValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
  },
  modalWarning: {
    textAlign: 'center',
    color: '#e67e22',
    fontSize: 13,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#95a5a6',
  },
  confirmButton: {
    backgroundColor: '#e63946',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  myRewardsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  myRewardsScroll: {
    maxHeight: 500,
  },
  userRewardCard: {
    backgroundColor: '#f9f9f9',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    alignItems: 'center',
  },
  userRewardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 15,
  },
  userRewardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  qrContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  promoCode: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e63946',
    marginBottom: 5,
    textAlign: 'center',
  },
  barcode: {
    fontSize: 12,
    color: '#666',
    marginBottom: 10,
  },
  validUntil: {
    fontSize: 13,
    color: '#666',
    marginBottom: 10,
  },
  instructions: {
    fontSize: 13,
    color: '#2ecc71',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
