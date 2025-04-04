import AsyncStorage from '@react-native-async-storage/async-storage';
import { showNotification } from '@/utils/code/server/notifService';
import { DeviceEventEmitter } from 'react-native';

// Storage keys
const STORAGE_KEY_THRESHOLDS = 'weather_thresholds';
const STORAGE_KEY_ENABLED = 'weather_alerts_enabled';
const STORAGE_KEY_LAST_ALERT = 'weather_last_alert';

// Default threshold values
const DEFAULT_THRESHOLDS = {
  maxTemperature: 30, // Celsius
  minTemperature: 0,  // Celsius
  maxPrecipitation: 70, // Percentage
  maxTempEnabled: true,
  minTempEnabled: true,
  precipEnabled: true
};


// Check weather against saved thresholds
export const checkWeatherAlertsNow = async (location: { latitude: number; longitude: number }) => {
  try {
    // Check if alerts are enabled
    const alertsEnabled = await AsyncStorage.getItem(STORAGE_KEY_ENABLED);
    if (alertsEnabled !== 'true') {
      return false;
    }
    
    // Get thresholds from storage
    const savedThresholds = await AsyncStorage.getItem(STORAGE_KEY_THRESHOLDS);
    const thresholds = savedThresholds ? JSON.parse(savedThresholds) : DEFAULT_THRESHOLDS;
    
    // Get weather data
    const apiKey = '79ad386f53a3310e170159865d9c6448';
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${location.latitude}&lon=${location.longitude}&units=metric&appid=${apiKey}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    // Check if we need to alert (and prevent alert spam with cooldown)
    await checkTempHighAlert(data, thresholds);
    await checkTempLowAlert(data, thresholds);
    await checkPrecipitationAlert(data, thresholds);
    
    return true;
  } catch (error) {
    console.error("Error checking weather alerts:", error);
    return false;
  }
};

// Register the weather alert task
export const registerWeatherAlertTask = () => {
  console.log('Weather alert service initialized');
  // We're not using background tasks, so this is just a placeholder
  // The actual checks are triggered from the WeatherCard component and global context
};

// Check for high temperature alerts
const checkTempHighAlert = async (weatherData: any, thresholds: any) => {
  if (!thresholds.maxTempEnabled) return;
  
  const currentTemp = weatherData.main.temp;
  const maxTemp = thresholds.maxTemperature;
  
  if (currentTemp > maxTemp) {
    // Check cooldown to prevent alert spam
    if (await canSendAlert('temp-high')) {
      showNotification(
        'High Temperature Alert',
        `Current temperature (${Math.round(currentTemp)}°C) has exceeded your threshold of ${maxTemp}°C.`
      );
      
      // Save notification info for in-app alerts
      saveAlertInfo('temperature-high', {
        message: `Temperature has exceeded your threshold`,
        value: Math.round(currentTemp),
        threshold: maxTemp,
        unit: '°C'
      });
    }
  }
};

// Check for low temperature alerts
const checkTempLowAlert = async (weatherData: any, thresholds: any) => {
  if (!thresholds.minTempEnabled) return;
  
  const currentTemp = weatherData.main.temp;
  const minTemp = thresholds.minTemperature;
  
  if (currentTemp < minTemp) {
    if (await canSendAlert('temp-low')) {
      showNotification(
        'Low Temperature Alert',
        `Current temperature (${Math.round(currentTemp)}°C) has dropped below your threshold of ${minTemp}°C.`
      );
      
      saveAlertInfo('temperature-low', {
        message: `Temperature has dropped below your threshold`,
        value: Math.round(currentTemp),
        threshold: minTemp,
        unit: '°C'
      });
    }
  }
};

// Check for precipitation alerts
const checkPrecipitationAlert = async (weatherData: any, thresholds: any) => {
  if (!thresholds.precipEnabled) return;
  
  // Use clouds.all as precipitation chance if precipitation data isn't available
  const precipitation = weatherData.clouds?.all || 0;
  const maxPrecipitation = thresholds.maxPrecipitation;
  
  if (precipitation > maxPrecipitation) {
    if (await canSendAlert('precip')) {
      showNotification(
        'Precipitation Alert',
        `Current precipitation chance (${precipitation}%) has exceeded your threshold of ${maxPrecipitation}%.`
      );
      
      saveAlertInfo('precipitation', {
        message: `Precipitation chance has exceeded your threshold`,
        value: precipitation,
        threshold: maxPrecipitation,
        unit: '%'
      });
    }
  }
};

// Check if we can send an alert (prevent spam)
const canSendAlert = async (alertType: string): Promise<boolean> => {
  try {
    const lastAlertString = await AsyncStorage.getItem(STORAGE_KEY_LAST_ALERT);
    if (!lastAlertString) return true;
    
    const lastAlerts = JSON.parse(lastAlertString);
    const now = Date.now();
    
    // If no record for this alert type or cooldown expired (30 minutes)
    if (!lastAlerts[alertType] || now - lastAlerts[alertType] > 30 * 60 * 1000) { // Fixed: 30 minutes in milliseconds
      // Update last alert time
      lastAlerts[alertType] = now;
      await AsyncStorage.setItem(STORAGE_KEY_LAST_ALERT, JSON.stringify(lastAlerts));
      return true;
    }
    
    return false;
  } catch (error) {
    console.error("Error checking alert cooldown:", error);
    return false;
  }
};

// Save alert info for in-app display
export const saveAlertInfo = async (alertType: string, alertInfo: any) => {
  try {
    // Save last alert time to prevent spam
    const lastAlertString = await AsyncStorage.getItem(STORAGE_KEY_LAST_ALERT);
    const lastAlerts = lastAlertString ? JSON.parse(lastAlertString) : {};
    lastAlerts[alertType] = Date.now();
    await AsyncStorage.setItem(STORAGE_KEY_LAST_ALERT, JSON.stringify(lastAlerts));
    
    // Save alert info
    await AsyncStorage.setItem(`active_alert_${alertType}`, JSON.stringify(alertInfo));
    
    // Use React Native's DeviceEventEmitter instead of CustomEvent
    DeviceEventEmitter.emit('weatherAlertUpdated', { type: alertType });
  } catch (error) {
    console.error("Error saving alert info:", error);
  }
};

// Get active alerts
export const getActiveAlerts = async () => {
  try {
    const alerts = [];
    
    // Check for active alerts
    const alertTypes = ['temperature-high', 'temperature-low', 'precipitation'];
    
    for (const type of alertTypes) {
      const alertInfoString = await AsyncStorage.getItem(`active_alert_${type}`);
      if (alertInfoString) {
        const alertInfo = JSON.parse(alertInfoString);
        alerts.push({
          type,
          ...alertInfo
        });
      }
    }
    
    return alerts;
  } catch (error) {
    console.error("Error getting active alerts:", error);
    return [];
  }
};

// Clear active alert
export const clearActiveAlert = async (alertType: string) => {
  try {
    await AsyncStorage.removeItem(`active_alert_${alertType}`);
    // Emit event to notify components that an alert has been cleared
    DeviceEventEmitter.emit('weatherAlertUpdated', { type: alertType, cleared: true });
  } catch (error) {
    console.error("Error clearing active alert:", error);
  }
};