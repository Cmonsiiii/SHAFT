// services/storageService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NotificationData } from '../server/notifService';

const NOTIFICATIONS_STORAGE_KEY = 'app_notifications';

// Save notifications to AsyncStorage
export async function saveNotificationsToStorage(notifications: NotificationData[]) {
  try {
    await AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
    return true;
  } catch (error) {
    console.error('Error saving notifications to storage:', error);
    return false;
  }
}

// Load notifications from AsyncStorage
export async function loadNotificationsFromStorage(): Promise<NotificationData[]> {
  try {
    const data = await AsyncStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading notifications from storage:', error);
    return [];
  }
}

// Clear all notifications
export async function clearNotifications() {
  try {
    await AsyncStorage.removeItem(NOTIFICATIONS_STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing notifications:', error);
    return false;
  }
}