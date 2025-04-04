import * as React from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator, SafeAreaView } from 'react-native';
import { useColorScheme } from 'react-native';
import * as Location from "expo-location";
import { GestureHandlerRootView, ScrollView } from 'react-native-gesture-handler';
import { PaperProvider, Card, Title, Divider } from 'react-native-paper';
import WeatherCard from '@/utils/components/cards/WeatherCard';
import ForecastCard from '@/utils/components/cards/forecastCard';
import UmbrellaSlot from '@/utils/components/cards/umbrellaSlot';
import AlertModal from '@/utils/components/modals/Alert';
import AlertChooseModal from '@/utils/components/modals/AlertChoose';
import { database } from '@/constants/firebase';
import { ref, push, set, get, child } from 'firebase/database';
import { useRouter } from 'expo-router';


interface AlertState {
    visible: boolean;
    message: string;
    icon: string;
    iconColor: string;
    onClose?: () => void;
}

const Home = () => { 
    const router = useRouter()
    const colorScheme = useColorScheme();
    const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
    const [isLocationLoading, setIsLocationLoading] = React.useState<boolean>(true);

    const [location, setLocation] = React.useState<{
        latitude: number;
        longitude: number;
    } | null>(null);


    const [verificationAlert, setVerificationAlert] = React.useState<AlertState>({
        visible: false,
        message: '',
        icon: '',
        iconColor: '',
    });
    
    const [confirmationModal, setConfirmationModal] = React.useState({
        visible: false,
        message: '',
        onConfirm: () => {},
        onCancel: () => {}
    });

    React.useEffect(() => {
        const getLocationPermission = async () => {
            try {
                setIsLocationLoading(true);
                const { status } = await Location.requestForegroundPermissionsAsync();
                
                if (status !== 'granted') {
                    setErrorMsg('Permission to access location was denied');
                    return;
                }

                const currentLocation = await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.Highest,
                });
                
                setLocation({
                    latitude: 14.6500,
                    longitude: 120.9667
                });
            } catch (error) {
                console.error("Error getting location:", error);
                setErrorMsg('Failed to get location');
            } finally {
                setIsLocationLoading(false);
            }
        };

        getLocationPermission();
    }, []);

    const handleAlertClose = () => {
        setVerificationAlert({
            visible: false,
            message: '',
            icon: '',
            iconColor: '',
        });
    };


    return (
        <GestureHandlerRootView style={{flex: 1}}>
            <PaperProvider>
                <SafeAreaView style={[styles.container, {backgroundColor: colorScheme === 'dark' ? '#151718' : '#f5f5f5'}]}>
                    <ScrollView 
                        contentContainerStyle={{ flexGrow: 1 }} 
                        showsVerticalScrollIndicator={false} 
                        keyboardShouldPersistTaps="handled"
                        >
                        <View style={styles.weatherCard}>
                            <WeatherCard 
                                location={location} 
                                isLocationLoading={isLocationLoading} 
                                locationError={errorMsg} 
                                setNotif={() => router.navigate('/main/profile/setWeather')}
                            />
                        </View>
                        <View style={styles.umbrellaCard}>
                            <UmbrellaSlot setNotif={() => router.navigate('/main/profile/setTime')}/>
                        </View>
                        <View style={styles.forecastCard}>
                            <ForecastCard 
                                location={location} 
                                isLocationLoading={isLocationLoading} 
                                locationError={errorMsg} 
                            />
                        </View>
                    </ScrollView>
                </SafeAreaView>

                <AlertModal 
                    visible={verificationAlert.visible} 
                    onConfirm={handleAlertClose} 
                    icon={verificationAlert.icon} 
                    iconColor={verificationAlert.iconColor} 
                    message={verificationAlert.message}
                />
                
                <AlertChooseModal
                    visible={confirmationModal.visible}
                    message={confirmationModal.message}
                    onConfirm={confirmationModal.onConfirm}
                    onCancel={confirmationModal.onCancel}
                />
            </PaperProvider>
        </GestureHandlerRootView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    weatherCard:{
        marginBottom: 20,
        marginTop: 10,
    },
    umbrellaCard:{
        marginBottom: 10,
        marginTop: 10,
    },
    forecastCard:{
        marginBottom: 20,
    }
});

export default Home;