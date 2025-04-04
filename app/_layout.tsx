import { loadFonts } from "@/utils/font/font";
import React from "react";
import { Alert, BackHandler, Platform, View } from "react-native";
import * as Location from "expo-location";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack, useRouter } from 'expo-router';
import SplashScreen from "@/utils/components/SplashScreen";
import { UserStorage } from "@/utils/code/async/saveInfo";
import * as Notifications from 'expo-notifications';

const App = () => {
    const [appIsReady, setAppIsReady] = React.useState(false);
    const [loading, setLoading] = React.useState(true);
    const router = useRouter();

    const requestPermissions = async () => {
        if (Platform.OS === 'android') {
            try {
                const permissions = [
                    Location.requestForegroundPermissionsAsync(),
                    Notifications.requestPermissionsAsync(),
                ];

                const results = await Promise.all(permissions);
                
                // Check location permission
                if (results[0].status !== 'granted') {
                    throw new Error('Location permission denied');
                }

                // We can continue even if notification permission is denied
                if (results[1].status !== 'granted') {
                    console.log('Notification permission denied');
                }

                return true;
            } catch (error) {
                Alert.alert(
                    'Permission Required',
                    'This app requires location to function. The app will now close.',
                    [{ 
                        text: 'OK', 
                        onPress: () => BackHandler.exitApp() 
                    }]
                );
                return false;
            }
        }
        return true;
    };
    
    const initializeApp = async() => {
        const [onboardingComplete, userData] = await Promise.all([
            AsyncStorage.getItem("onboardingComplete"),
            UserStorage.getUserData()
        ]);
        try {
            loadFonts();

            const permissionsGranted = await requestPermissions();
            
            if (!permissionsGranted) {
                return;
            }
            
            
            setAppIsReady(true);
            setLoading(false);

            if (userData) {
                // If user data exists, go to main page regardless of onboarding status
                router.replace("/main/tabs/");
            } else if (onboardingComplete) {
                // If no user data but onboarding is complete, go to title page
                router.replace("/onboard/title");
            } else {
                // If neither exists, start with onboarding
                router.replace("/onboard/");
            }
        } catch (e) {
            console.log(e);
        } finally {
            setAppIsReady(true);
        }
    };

    React.useEffect(() => {
        initializeApp();
    }, []);

    if(!appIsReady || loading){
        return <SplashScreen />;
    }

    return(     
        <Stack screenOptions={{headerShown: false}}>
            <Stack.Screen name="onboard" options={{ headerBackButtonMenuEnabled: false, headerShown: false }} />
            <Stack.Screen name="auth" options={{ headerBackButtonMenuEnabled: false, headerShown: false }} />
            <Stack.Screen name="main" options={{ headerBackButtonMenuEnabled: false, headerShown: false }} />
        </Stack>
    );
};

export default App;