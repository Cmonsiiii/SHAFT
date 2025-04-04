import React, { createContext, useState, useContext, useEffect } from 'react';
import { getActiveAlerts, clearActiveAlert } from '@/utils/code/server/weatherAlertService';

// Define the alert type
export interface AlertInfo {
  type: 'temperature-high' | 'temperature-low' | 'precipitation';
  message: string;
  value: number;
  threshold: number;
  unit: string;
}

// Context type definition
interface WeatherAlertContextType {
  activeAlerts: AlertInfo[];
  showAlert: (alert: AlertInfo) => void;
  dismissAlert: (alertType: string) => void;
  refreshAlerts: () => Promise<void>;
}

// Create the context
export const WeatherAlertContext = createContext<WeatherAlertContextType>({
  activeAlerts: [],
  showAlert: () => {},
  dismissAlert: () => {},
  refreshAlerts: async () => {},
});

// Provider component
export const WeatherAlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeAlerts, setActiveAlerts] = useState<AlertInfo[]>([]);

  // Function to refresh alerts from storage
  const refreshAlerts = async () => {
    try {
      const alerts = await getActiveAlerts();
      setActiveAlerts(alerts);
    } catch (error) {
      console.error('Error refreshing alerts:', error);
    }
  };

  // Show a new alert
  const showAlert = (alert: AlertInfo) => {
    setActiveAlerts((prevAlerts) => {
      // Replace existing alert of same type or add new one
      const filteredAlerts = prevAlerts.filter((a) => a.type !== alert.type);
      return [...filteredAlerts, alert];
    });
  };

  // Dismiss an alert
  const dismissAlert = async (alertType: string) => {
    await clearActiveAlert(alertType);
    setActiveAlerts((prevAlerts) => prevAlerts.filter((a) => a.type !== alertType));
  };

  // Load initial alerts on mount
  useEffect(() => {
    refreshAlerts();
    
    // Set up periodic refresh (every 60 seconds)
    const intervalId = setInterval(refreshAlerts, 60000);
    
    return () => clearInterval(intervalId);
  }, []);

  return (
    <WeatherAlertContext.Provider value={{ activeAlerts, showAlert, dismissAlert, refreshAlerts }}>
      {children}
    </WeatherAlertContext.Provider>
  );
};

// Custom hook for using the weather alert context
export const useWeatherAlerts = () => useContext(WeatherAlertContext);