import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useWeatherAlerts } from './weatherAlertContext';
import WeatherAlert from '../cards/weatherAlert';

const GlobalWeatherAlert: React.FC = () => {
    const { activeAlerts, dismissAlert, refreshAlerts } = useWeatherAlerts();

    // Refresh alerts when component mounts
    useEffect(() => {
        refreshAlerts();
        
        // Set periodic refresh
        const intervalId = setInterval(refreshAlerts, 30000); // Check every 30 seconds
        
        return () => clearInterval(intervalId);
    }, []);

    // If no alerts, don't render anything
    if (activeAlerts.length === 0) {
        return null;
    }

  // Just show the first alert if there are multiple (to avoid cluttering the UI)
  const currentAlert = activeAlerts[0];

    return (
        <View style={styles.container}>
            <WeatherAlert
                message={currentAlert.message}
                type={currentAlert.type}
                value={currentAlert.value}
                threshold={currentAlert.threshold}
                unit={currentAlert.unit}
                onDismiss={() => dismissAlert(currentAlert.type)}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999, // Ensure it's on top of everything
    }
});

export default GlobalWeatherAlert;