import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification behavior for background notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Notification service using expo-notifications for background notifications
// This works even when app is suspended or phone is locked

export class NotificationService {
  private static instance: NotificationService;

  private constructor() {}

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Initialize notifications (background notifications)
  public async initialize(): Promise<string | null> {
    try {
      console.log('=== INITIALIZING BACKGROUND NOTIFICATIONS ===');
      
      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('Notification permissions not granted');
        return null;
      }

      console.log('Notification permissions granted');

      // Setup notification channel for Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('fala-notifications', {
          name: 'Fala Notifications',
          description: 'Notificações da app Fala',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
          sound: 'default',
        });
      }

      console.log('Background notifications configured successfully');
      return 'background-notifications';
    } catch (error) {
      console.error('Error initializing notifications:', error);
      return null;
    }
  }

  // Send notification using expo-notifications (works in background)
  public async sendLocalNotification(title: string, body: string, data?: any) {
    try {
      console.log('=== SENDING BACKGROUND NOTIFICATION ===');
      console.log('Title:', title);
      console.log('Body:', body);
      console.log('Data:', data);

      // Send notification that works even when app is in background
      await Notifications.scheduleNotificationAsync({
        content: {
          title: title,
          body: body,
          data: data,
          sound: 'default',
        },
        trigger: null, // Show immediately
        channelId: 'fala-notifications',
      });

      console.log('Background notification sent successfully');
    } catch (error) {
      console.error('Error sending background notification:', error);
    }
  }

  // Send talker request notification
  public async sendTalkerRequestNotification(talkerName: string, topic: string, duration: string) {
    const title = "💙 Alguém precisa de ti";
    const body = `${talkerName} está a precisar de ser ouvido sobre "${topic}" (${duration})`;
    
    await this.sendLocalNotification(title, body, {
      type: 'talker_request',
      talkerName,
      topic,
      duration,
    });
  }

  // Get push token
  public getPushToken(): string | null {
    return 'background-notifications';
  }

  // Add notification listener
  public addNotificationListener(listener: any) {
    return Notifications.addNotificationReceivedListener(listener);
  }

  // Add notification response listener
  public addNotificationResponseListener(listener: any) {
    return Notifications.addNotificationResponseReceivedListener(listener);
  }
}

export default NotificationService;
