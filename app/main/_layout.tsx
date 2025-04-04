import React from "react";
import { useColorScheme, View } from "react-native";
import { Stack} from 'expo-router';
import { WeatherAlertProvider } from "@/utils/components/context/weatherAlertContext";
import GlobalWeatherAlert from "@/utils/components/context/globalWeatherAlert";
import { configureNotifications, registerForPushNotificationsAsync, startHistoryListener, stopHistoryListener } from "@/utils/code/server/notifService";

const MainLayout = () => {
    const colorScheme = useColorScheme();
    
    // Initialize notification services
    React.useEffect(() => {
        const setupNotifications = async () => {
            // Configure notifications
            configureNotifications();
            
            // Register for push notifications
            await registerForPushNotificationsAsync();
            
            // Start listening for history changes
            startHistoryListener();
        };
        
        setupNotifications();
        
        // Clean up when unmounting
        return () => {
            // Stop the history listener when unmounting
            stopHistoryListener();
        };
    }, []);
    
    return(
        <WeatherAlertProvider>
            <View style={{ flex: 1 }}>
                <GlobalWeatherAlert />
                <Stack>
                    
                    <Stack.Screen name="tabs" options={{ headerBackButtonMenuEnabled: false, headerShown: false }} />
                    <Stack.Screen name="changeuser" options={{ headerBackButtonMenuEnabled: false, headerShown: false }} />
                    <Stack.Screen name="changepass" options={{ headerBackButtonMenuEnabled: false, headerShown: false }} />
                    <Stack.Screen name="changeemail" options={{ headerBackButtonMenuEnabled: false, headerShown: false }} />
                    <Stack.Screen name="profile" options={{ headerBackButtonMenuEnabled: false, headerShown: false }} />
                </Stack>
                <GlobalWeatherAlert />
            </View>
        </WeatherAlertProvider>
    );
}

export default MainLayout;