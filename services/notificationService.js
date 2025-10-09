import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

// Configuration du comportement des notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class NotificationService {
  constructor() {
    this.expoPushToken = null;
    this.notificationListener = null;
    this.responseListener = null;
  }

  // Initialiser les notifications
  async initialize(userId) {
    if (!Device.isDevice) {
      console.log('Notifications disponibles uniquement sur device physique');
      return null;
    }

    // Demander permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Permission notifications refusée');
      return null;
    }

    // Obtenir le token Expo Push
    const token = await Notifications.getExpoPushTokenAsync({
      projectId: 'votre-project-id', // À remplacer
    });

    this.expoPushToken = token.data;

    // Sauvegarder le token dans Firestore
    if (userId) {
      try {
        await updateDoc(doc(db, 'users', userId), {
          pushToken: this.expoPushToken,
        });
      } catch (error) {
        console.error('Erreur sauvegarde token:', error);
      }
    }

    // Configuration Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#2ecc71',
      });
    }

    // Listeners
    this.setupListeners();

    return this.expoPushToken;
  }

  // Configurer les listeners
  setupListeners() {
    // Notification reçue en foreground
    this.notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification reçue:', notification);
    });

    // Notification cliquée
    this.responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification cliquée:', response);
      // TODO: Navigation vers l'écran approprié
    });
  }

  // Nettoyer les listeners
  cleanup() {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
    }
  }

  // Envoyer une notification locale immédiate
  async sendLocalNotification(title, body, data = {}) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
      },
      trigger: null, // Immédiat
    });
  }

  // Programmer une notification
  async scheduleNotification(title, body, triggerDate, data = {}) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
      },
      trigger: triggerDate,
    });
  }

  // Notification péremption aliment
  async notifyExpiringFood(foodItem, daysLeft) {
    const title = '⚠️ Aliment bientôt périmé';
    const body = `${foodItem.name} expire dans ${daysLeft} jour${daysLeft > 1 ? 's' : ''} !`;

    await this.sendLocalNotification(title, body, {
      type: 'expiry',
      itemId: foodItem.id,
      screen: 'Fridge',
    });
  }

  // Notification level up
  async notifyLevelUp(newLevel) {
    const title = '🎉 Level Up !';
    const body = `Félicitations ! Vous êtes maintenant niveau ${newLevel}`;

    await this.sendLocalNotification(title, body, {
      type: 'levelup',
      level: newLevel,
      screen: 'Community',
    });
  }

  // Notification nouveau badge
  async notifyNewBadge(badgeName) {
    const title = '🏆 Nouveau Badge !';
    const body = `Vous avez débloqué : ${badgeName}`;

    await this.sendLocalNotification(title, body, {
      type: 'badge',
      screen: 'Community',
    });
  }

  // Notification défi complété
  async notifyChallengeCompleted(challengeName, xpGained) {
    const title = '✅ Défi Complété !';
    const body = `${challengeName} - Vous gagnez ${xpGained} XP !`;

    await this.sendLocalNotification(title, body, {
      type: 'challenge',
      screen: 'Community',
    });
  }

  // Notification visite magasin terminée
  async notifyStoreVisitEnd(storeName, duration) {
    const title = '📊 Visite enregistrée';
    const body = `${storeName} - ${duration} minutes`;

    await this.sendLocalNotification(title, body, {
      type: 'store_visit',
      screen: 'Stats',
    });
  }

  // Notification économies réalisées
  async notifySavings(amount) {
    const title = '💰 Économies réalisées';
    const body = `Vous avez économisé ${amount.toFixed(2)}€ ce mois-ci !`;

    await this.sendLocalNotification(title, body, {
      type: 'savings',
      screen: 'Stats',
    });
  }

  // Rappel quotidien
  async scheduleDailyReminder(hour = 20, minute = 0) {
    const trigger = {
      hour,
      minute,
      repeats: true,
    };

    await this.scheduleNotification(
      '📱 FoodApp',
      'Avez-vous vérifié votre frigo aujourd\'hui ?',
      trigger,
      { type: 'daily_reminder' }
    );
  }

  // Vérifier les aliments périmés (à appeler périodiquement)
  async checkExpiringItems(fridgeItems) {
    const today = new Date();
    
    for (const item of fridgeItems) {
      if (!item.expiryDate) continue;

      const expiryDate = new Date(item.expiryDate);
      const daysLeft = Math.floor((expiryDate - today) / (1000 * 60 * 60 * 24));

      // Notifier 3 jours avant
      if (daysLeft === 3 || daysLeft === 1) {
        await this.notifyExpiringFood(item, daysLeft);
      }

      // Notifier le jour J
      if (daysLeft === 0) {
        await this.sendLocalNotification(
          '❌ Aliment périmé',
          `${item.name} est périmé aujourd'hui`,
          {
            type: 'expired',
            itemId: item.id,
            screen: 'Fridge',
          }
        );
      }
    }
  }

  // Annuler toutes les notifications programmées
  async cancelAllNotifications() {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  // Obtenir toutes les notifications programmées
  async getScheduledNotifications() {
    return await Notifications.getAllScheduledNotificationsAsync();
  }
}

export default new NotificationService();