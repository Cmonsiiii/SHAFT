// services/notificationService.ts
import { database } from '@/constants/firebase';
import { ref, onValue, off, DataSnapshot } from 'firebase/database';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Notification } from '@/utils/components/cards/notif'; // Using your existing Notification type

const NOTIFICATIONS_STORAGE_KEY = 'app_notifications';

// Register for push notifications
export async function registerForPushNotificationsAsync() {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    console.log('Failed to get push token for push notification!');
    return;
  }
  
  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }
}

// Configure notifications
export function configureNotifications() {
  // Set notification handler
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
}

// Listen for history changes
let historyListener: any = null;

export function startHistoryListener() {
  if (historyListener) {
    stopHistoryListener();
  }

  const historyRef = ref(database, 'History');

  let lastNotifiedId: string | null = null; // Track the last sent notification

  historyListener = onValue(historyRef, (snapshot: DataSnapshot) => {
    const data = snapshot.val();
    if (!data) return;

    // Convert to an array and sort by timestamp
    const historyArray = Object.values(data)
      .filter(item => item !== null)
      .sort((a: any, b: any) => new Date(a.date_updated).getTime() - new Date(b.date_updated).getTime());

    // Get the latest entry
    const newestEntry = historyArray[historyArray.length - 1] as any;

    // Ensure it's a truly new entry (not a duplicate update)
    if (newestEntry && newestEntry.id !== lastNotifiedId) {
      lastNotifiedId = newestEntry.id; // Store the last notified entry

      // Format date
      const formattedDate = new Date(newestEntry.date_updated).toLocaleString();

      // Show a notification
      showNotification(
        'Status Update',
        `${newestEntry.slot_name} is now ${newestEntry.status}`,
        newestEntry
      );

      // Save notification
      saveNotification({
        id: Date.now().toString(),
        title: 'Status Update',
        subtitle: `${newestEntry.slot_name} is ${newestEntry.status}`,
        date: formattedDate,
        read: false,
        icon: 'information-circle',
      });
    }
  });
}

export function stopHistoryListener() {
  if (historyListener) {
    const historyRef = ref(database, 'History');
    off(historyRef, 'value', historyListener);
    historyListener = null;
  }
}

// Show a notification
export async function showNotification(title: string, body: string, data?: any) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: data || {},
    },
    trigger: null, // Show immediately
  });
}

// Array to store notifications in memory
let notificationsStore: Notification[] = [];

// Save notification to memory and AsyncStorage
export async function saveNotification(notification: Notification) {
  // Add to memory store
  notificationsStore = [notification, ...notificationsStore];
  
  // Save to AsyncStorage
  try {
    const existingNotifications = await getNotificationsFromStorage();
    const updatedNotifications = [notification, ...existingNotifications];
    await AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updatedNotifications));
  } catch (error) {
    console.error('Error saving notification:', error);
  }
}

// Get notifications from memory
export function getNotifications(): Notification[] {
  return notificationsStore;
}

// Get notifications from AsyncStorage
export async function getNotificationsFromStorage(): Promise<Notification[]> {
  try {
    const data = await AsyncStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting notifications from storage:', error);
    return [];
  }
}

// Mark notification as read
export async function markNotificationAsRead(id: string) {
  // Update in memory
  notificationsStore = notificationsStore.map(notification => 
    notification.id === id ? { ...notification, read: true } : notification
  );
  
  // Update in AsyncStorage
  try {
    const existingNotifications = await getNotificationsFromStorage();
    const updatedNotifications = existingNotifications.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    );
    await AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updatedNotifications));
  } catch (error) {
    console.error('Error updating notification read status:', error);
  }
}

// Initialize notifications by loading from storage
export async function initializeNotifications() {
  try {
    const savedNotifications = await getNotificationsFromStorage();
    notificationsStore = savedNotifications;
    return savedNotifications;
  } catch (error) {
    console.error('Error initializing notifications:', error);
    return [];
  }
}