import React, { useState, useEffect } from 'react';
import {
    View,
    SafeAreaView,
    StyleSheet,
    useColorScheme,
    TouchableOpacity,
    Alert,
    Dimensions,
    AppState,
    AppStateStatus
} from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ref, update, get } from 'firebase/database';
import { auth, database } from '@/constants/firebase';
import { ThemedText } from "@/utils/components/themeUI/ThemedText";
import Button from "@/utils/components/buttons/button";
import AlertModal from "@/utils/components/modals/Alert";
import { showNotification } from "@/utils/code/server/notifService";
import { accentColorDark, darkAccent, lightAccent, primaryColor, secondaryColor, tintColorDark } from '@/constants/Colors';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    priority: Notifications.AndroidNotificationPriority.HIGH,
  }),
});

interface AlertState {
    visible: boolean;
    message: string;
    icon: string;
    iconColor: string;
    onClose?: () => void;
}

interface Stand {
    name: string;
    slot_number: string;
    status: string;
    date_updated: string | number;
}

const TIME_ALERT_STORAGE_KEY = 'time_alert_settings';
const NOTIFICATION_ID = 'daily-time-alert';

const TimeAlertPage = () => {
    const colorScheme = useColorScheme();
    const [hours, setHours] = useState(12);
    const [minutes, setMinutes] = useState(0);
    const [isAM, setIsAM] = useState(true);
    const [alertSet, setAlertSet] = useState(false);
    const [appState, setAppState] = useState(AppState.currentState);
    const windowWidth = Dimensions.get('window').width;
    const [loading, setLoading] = useState(false);

    const [alert, setAlert] = useState<AlertState>({
        visible: false,
        message: '',
        icon: '',
        iconColor: '',
    });

    // Load alert settings from storage and Firebase when component mounts
    useEffect(() => {
        loadAlertSettings();
        
        // Setup app state change listener
        const subscription = AppState.addEventListener('change', handleAppStateChange);
        
        // Set up notification listener
        const notificationListener = Notifications.addNotificationReceivedListener(handleNotification);
        
        return () => {
            subscription.remove();
            Notifications.removeNotificationSubscription(notificationListener);
        };
    }, []);

    // Handle incoming notifications and check stand status
    const handleNotification = async (notification: Notifications.Notification) => {
        if (notification.request.content.data.type === 'daily-alert') {
            const hasEmptyStands = await checkForEmptyStands();
            if (!hasEmptyStands) {
                // If no empty stands, cancel this notification instance
                await Notifications.dismissNotificationAsync(notification.request.identifier);
            }
        }
    };

    // Check if any stands are empty
    const checkForEmptyStands = async (): Promise<boolean> => {
        try {
            const standsRef = ref(database, 'Stands');
            const snapshot = await get(standsRef);
            
            if (snapshot.exists()) {
                const standsData = snapshot.val();
                // Filter out null values and check if any stand has "Empty" status
                const stands: Stand[] = Object.values(standsData).filter(Boolean);
                return stands.some(stand => stand.status === "Empty");
            }
            
            return false;
        } catch (error) {
            console.error('Error checking stands status:', error);
            return false;
        }
    };

    // Handle app state changes
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
        // If app is coming back to foreground
        if (appState.match(/inactive|background/) && nextAppState === 'active') {
            // Refresh alert status
            loadAlertSettings();
        }
        
        setAppState(nextAppState);
    };

    // Load alert settings from AsyncStorage and Firebase
    const loadAlertSettings = async () => {
        try {
            // First try local storage
            const settingsJson = await AsyncStorage.getItem(TIME_ALERT_STORAGE_KEY);
            
            if (settingsJson) {
                const settings = JSON.parse(settingsJson);
                setHours(settings.hours);
                setMinutes(settings.minutes);
                setIsAM(settings.isAM);
                setAlertSet(settings.alertSet);
            }
            
            // Then check Firebase if user is logged in
            if (auth.currentUser) {
                const userId = auth.currentUser.uid;
                const userRef = ref(database, `Users`);
                const snapshot = await get(userRef);
                
                if (snapshot.exists()) {
                    const users = snapshot.val();
                    // Find the user with matching Firebase UID
                    const userArray = Object.values(users).filter(Boolean);
                    const currentUser = userArray.find(user => user.firebaseAuthUid === userId);
                    
                    if (currentUser && currentUser.profile && currentUser.profile.notifications) {
                        const { hours: dbHours, minutes: dbMinutes, setNotif } = currentUser.profile.notifications;
                        
                        // Only set the alert if setNotif is true
                        if (setNotif) {
                            // Convert from 24-hour to 12-hour format for UI
                            const is12HourAM = dbHours < 12;
                            const display12Hour = dbHours % 12 === 0 ? 12 : dbHours % 12;
                            
                            setHours(display12Hour);
                            setMinutes(dbMinutes);
                            setIsAM(is12HourAM);
                            setAlertSet(true);
                            
                            // Update local storage with Firebase data
                            saveAlertSettingsToStorage(display12Hour, dbMinutes, is12HourAM, true);
                        } else {
                            // Clear any existing alert if setNotif is false
                            setAlertSet(false);
                            setHours(12);
                            setMinutes(0);
                            setIsAM(true);
                            
                            // Cancel any scheduled notifications
                            Notifications.cancelScheduledNotificationAsync(NOTIFICATION_ID);
                            
                            // Update local storage
                            saveAlertSettingsToStorage(12, 0, true, false);
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Error loading alert settings:', error);
        }
    };

    // Save settings to AsyncStorage
    const saveAlertSettingsToStorage = async (h: number, m: number, am: boolean, set: boolean) => {
        try {
                const settings = {
                    hours: h,
                    minutes: m,
                    isAM: am,
                    alertSet: set
                };
                await AsyncStorage.setItem(TIME_ALERT_STORAGE_KEY, JSON.stringify(settings));
            } catch (error) {
                console.error('Error saving alert settings:', error);
            }
        };

        // Save settings to Firebase
        const saveAlertSettingsToFirebase = async (h: number, m: number, am: boolean) => {
        if (!auth.currentUser) {
            console.error('User not logged in');
            return false;
        }
        
        try {
            setLoading(true);
            const userId = auth.currentUser.uid;
            
            // Find user's record by Firebase UID
            const userRef = ref(database, `Users`);
            const snapshot = await get(userRef);
            
            if (snapshot.exists()) {
                const users = snapshot.val();
                const userArray = Object.values(users).filter(Boolean);
                const currentUser = userArray.find(user => user.firebaseAuthUid === userId);
                
                if (currentUser) {
                    // Convert to 24-hour format for storage
                    let hours24 = h;
                    if (!am && h !== 12) {
                        hours24 = h + 12;
                    } else if (am && h === 12) {
                        hours24 = 0;
                    }
                    
                    // Update the user's notification settings
                    const userIndex = currentUser.userId;
                    await update(ref(database, `Users/${userIndex}/profile/notifications`), {
                        hours: hours24,
                        minutes: m,
                        setNotif: true  // Set this flag to true when setting alert
                    });
                    
                    return true;
                }
            }
            
            return false;
        } catch (error) {
            console.error('Error saving to Firebase:', error);
            return false;
        } finally {
            setLoading(false);
        }
    };

    // Set up the alert for the specified time
    const setTimeAlert = async () => {
        try {
            setLoading(true);
            
            // Validate user is logged in
            if (!auth.currentUser) {
                setAlert({
                    visible: true,
                    icon: "information-circle",
                    iconColor: "danger",
                    message: "You must be logged in to set an alert time",
                    onClose: handleAlertClose
                });
                return;
            }
            
            // Cancel any existing notifications
            await Notifications.cancelScheduledNotificationAsync(NOTIFICATION_ID);
            
            // Convert selected time to 24-hour format
            let hours24 = hours;
            if (!isAM && hours !== 12) {
                hours24 = hours + 12;
            } else if (isAM && hours === 12) {
                hours24 = 0;
            }
            
            // Save to Firebase
            const saveToDB = await saveAlertSettingsToFirebase(hours, minutes, isAM);
            
            if (!saveToDB) {
                setAlert({
                    visible: true,
                    icon: "information-circle",
                    iconColor: "danger",
                    message: "Failed to save alert time to database",
                    onClose: handleAlertClose
                });
                return;
            }
            
            // Save to local storage
            await saveAlertSettingsToStorage(hours, minutes, isAM, true);
            
            // Schedule the notification
            const now = new Date();
            const alertTime = new Date();
            alertTime.setHours(hours24, minutes, 0);
            
            // If the time is already past today, schedule it for tomorrow
            if (alertTime <= now) {
                alertTime.setDate(alertTime.getDate() + 1);
            }
            
            // Schedule the notification with a custom trigger that will check stand status
            await Notifications.scheduleNotificationAsync({
                content: {
                    title: '🚨 Umbrella Check!',
                    body: `Don't leave your umbrella behind! Store it securely in the stand.`,
                    data: { type: 'daily-alert' },
                },
                identifier: NOTIFICATION_ID,
                trigger: {
                    hour: hours24,
                    minute: minutes,
                    repeats: true,
                },
            });
            
            setAlertSet(true);
            
            // Show confirmation
            setAlert({
                visible: true,
                icon: "checkmark-circle",
                iconColor: "success",
                message: `Alert set for ${formatTimeDisplay(hours, minutes, isAM)} daily (will only notify if stands are empty)`,
                onClose: handleAlertClose
            });
        } catch (error) {
            console.error('Error setting alert:', error);
            setAlert({
                visible: true,
                icon: "alert-circle",
                iconColor: "danger",
                message: "Failed to set the alert. Please try again.",
                onClose: handleAlertClose
            });
        } finally {
            setLoading(false);
        }
    };

    // Cancel the set alert
    const cancelAlert = async () => {
        try {
            setLoading(true);
            
            // Cancel the notification
            await Notifications.cancelScheduledNotificationAsync(NOTIFICATION_ID);
            
            // Reset Firebase if logged in
            if (auth.currentUser) {
                const userId = auth.currentUser.uid;
                const userRef = ref(database, `Users`);
                const snapshot = await get(userRef);
                
                if (snapshot.exists()) {
                    const users = snapshot.val();
                    const userArray = Object.values(users).filter(Boolean);
                    const currentUser = userArray.find(user => user.firebaseAuthUid === userId);
                    
                    if (currentUser) {
                        const userIndex = currentUser.userId;
                        await update(ref(database, `Users/${userIndex}/profile/notifications`), {
                            hours: 0,
                            minutes: 0,
                            setNotif: false  // Important: Set this to false when canceling
                        });
                    }
                }
            }
            
            // Reset local storage
            await saveAlertSettingsToStorage(12, 0, true, false);
            
            setAlertSet(false);
            setHours(12);
            setMinutes(0);
            setIsAM(true);
            
            setAlert({
                visible: true,
                icon: "information-circle",
                iconColor: "success",
                message: "Daily alert has been cancelled",
                onClose: handleAlertClose
            });
        } catch (error) {
            console.error('Error cancelling alert:', error);
            setAlert({
                visible: true,
                icon: "alert-circle",
                iconColor: "danger",
                message: "Failed to cancel the alert. Please try again.",
                onClose: handleAlertClose
            });
        } finally {
            setLoading(false);
        }
    };

    const handleAlertClose = () => {
        setAlert({
            visible: false,
            message: '',
            icon: '',
            iconColor: '',
        });
    };

    // Format time for display
    const formatTimeDisplay = (h: number, m: number, am: boolean) => {
        return `${h}:${m.toString().padStart(2, '0')} ${am ? 'AM' : 'PM'}`;
    };

    // Increment and decrement handlers for time values
    const incrementHours = () => {
        setHours(prev => prev === 12 ? 1 : prev + 1);
    };

    const decrementHours = () => {
        setHours(prev => prev === 1 ? 12 : prev - 1);
    };

    const incrementMinutes = () => {
        const newMinutes = minutes + 1;
        if (newMinutes >= 60) {
            setMinutes(0);
            incrementHours();
        } else {
            setMinutes(newMinutes);
        }
    };

    const decrementMinutes = () => {
        const newMinutes = minutes - 1;
        if (newMinutes < 0) {
            setMinutes(59);
            decrementHours();
        } else {
            setMinutes(newMinutes);
        }
    };

    const toggleAMPM = () => {
        setIsAM(prev => !prev);
    };

    // Improved responsive sizing logic with maximum sizes
    const getResponsiveFontSize = (baseSize : any) => {
        const scaleFactor = windowWidth / 375; // Normalize based on iPhone 8 width
        // More conservative scaling with lower maximum
        return Math.min(baseSize * scaleFactor, baseSize * 1.2); 
    };

    return (
        <SafeAreaView style={[styles.container, {backgroundColor: colorScheme === 'dark' ? '#151718' : '#F6F6F6'}]}>
            <ThemedText type="title" style={[styles.title, {fontSize: getResponsiveFontSize(28)}]}>
                {alertSet ? "Daily Stand Alert" : "Set Stand Alert Time"}
            </ThemedText>
        
            {alertSet ? (
                // Active alert display
                <View style={styles.alertContainer}>
                    <View style={styles.timeDisplay}>
                        <ThemedText type='title' style={[styles.alertTimeValue, {
                            fontSize: getResponsiveFontSize(40),
                            lineHeight: getResponsiveFontSize(42)
                        }]}>
                            {formatTimeDisplay(hours, minutes, isAM)}
                        </ThemedText>
                    </View>
                
                    <View style={styles.buttonContainer}>
                        <Button 
                            title="Cancel Alert" 
                            onPress={cancelAlert}
                            type="danger"
                            loading={loading}
                        />
                    </View>
                </View>
            ) : (
                // Time picker interface
                <>
                <View style={styles.timePickerContainer}>
                    {/* Hours */}
                    <View style={styles.pickerUnit}>
                        <TouchableOpacity onPress={incrementHours} style={styles.pickerButton}>
                            <Ionicons name="chevron-up" size={getResponsiveFontSize(24)} color={lightAccent} />
                        </TouchableOpacity>
                        <View style={styles.timeValueContainer}>
                            <ThemedText type='title' style={[styles.timeValue, {
                                fontSize: getResponsiveFontSize(32),
                                lineHeight: getResponsiveFontSize(34)
                            }]}>
                                {hours.toString().padStart(2, '0')}
                            </ThemedText>
                        </View>
                        <TouchableOpacity onPress={decrementHours} style={styles.pickerButton}>
                            <Ionicons name="chevron-down" size={getResponsiveFontSize(24)} color={lightAccent} />
                        </TouchableOpacity>
                        <ThemedText style={[styles.timeLabel, {fontSize: getResponsiveFontSize(14)}]}>Hours</ThemedText>
                    </View>
                    
                    <ThemedText type='title' style={[styles.timeSeparator, {fontSize: getResponsiveFontSize(32)}]}>:</ThemedText>
                    
                    {/* Minutes */}
                    <View style={styles.pickerUnit}>
                        <TouchableOpacity onPress={incrementMinutes} style={styles.pickerButton}>
                            <Ionicons name="chevron-up" size={getResponsiveFontSize(24)} color={lightAccent} />
                        </TouchableOpacity>
                        <View style={styles.timeValueContainer}>
                            <ThemedText type='title' style={[styles.timeValue, {
                                fontSize: getResponsiveFontSize(32),
                                lineHeight: getResponsiveFontSize(34)
                            }]}>
                                {minutes.toString().padStart(2, '0')}
                            </ThemedText>
                        </View>
                        <TouchableOpacity onPress={decrementMinutes} style={styles.pickerButton}>
                            <Ionicons name="chevron-down" size={getResponsiveFontSize(24)} color={lightAccent} />
                        </TouchableOpacity>
                        <ThemedText style={[styles.timeLabel, {fontSize: getResponsiveFontSize(14)}]}>Minutes</ThemedText>
                    </View>
                    
                    {/* AM/PM Toggle */}
                    <TouchableOpacity 
                        style={[styles.ampmToggle]} 
                        onPress={toggleAMPM}
                    >
                        <ThemedText type='title' style={[styles.ampmText, {
                            fontSize: getResponsiveFontSize(18),
                            color: isAM ? lightAccent : primaryColor
                        }]}>AM</ThemedText>
                        <ThemedText type='title' style={[styles.ampmText, {
                            fontSize: getResponsiveFontSize(18),
                            color: !isAM ? lightAccent : primaryColor
                        }]}>PM</ThemedText>
                    </TouchableOpacity>
                </View>
                
                
                <View style={styles.buttonContainer}>
                    <Button 
                        title="Set Stand Alert" 
                        onPress={setTimeAlert}
                        type="primary"
                        loading={loading}
                    />
                </View>
                </>
            )}
        
            <AlertModal 
                visible={alert.visible} 
                onConfirm={handleAlertClose} 
                icon={alert.icon} 
                iconColor={alert.iconColor} 
                message={alert.message}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        paddingTop: 20,
        paddingHorizontal: 20
    },
    title: {
        fontFamily: "CeraPro_Bold",
        marginBottom: 40,
        textAlign: 'center',
    },
    timePickerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        width: '100%',
        maxWidth: 500,
    },
    pickerUnit: {
        flexDirection: "column",
        alignItems: 'center',
        justifyContent: "space-between",
        width: '30%',
        maxWidth: 120
    },
    pickerButton: {
        padding: 15,
        margin: 10,
        borderRadius: 8,
        backgroundColor: secondaryColor,
        width: '70%',
        alignItems: 'center'
    },
    timeValueContainer: {
        width: '70%',
        justifyContent: 'center',
        alignItems: 'center',
        height: 60, // Fixed height to prevent resizing issues
    },
    timeValue: {
        fontFamily: "CeraPro_Bold",
        textAlign: 'center',
        padding: 10,
    },
    timeLabel: {
        fontFamily: "CeraPro_Regular",
        marginTop: 8,
    },
    timeSeparator: {
        marginHorizontal: 10,
        fontFamily: "CeraPro_Bold",
    },
    ampmToggle: {
        marginLeft: 15,
        borderRadius: 20,
        backgroundColor: secondaryColor,
        marginBottom: 30,
        padding: 10,
        width: 80,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    ampmText: {
        fontFamily: "CeraPro_Medium",
        padding: 5,
    },
    infoContainer: {
        marginBottom: 30,
        paddingHorizontal: 20,
    },
    infoText: {
        textAlign: 'center',
        fontFamily: "CeraPro_Regular",
        opacity: 0.8,
    },
    buttonContainer: {
        width: '80%',
        maxWidth: 300,
        alignSelf: 'center',
        justifyContent: "center",
        alignItems: "center",
        marginTop: 10
    },
    alertContainer: {
        alignItems: 'center',
        width: '100%',
        paddingHorizontal: 10,
    },
    timeDisplay: {
        alignItems: 'center',
        justifyContent: 'center',
        alignContent: "center",
        marginBottom: 50,
        borderRadius: 16,
        padding: 30,
        width: '100%',
        maxWidth: 500,
        backgroundColor: secondaryColor,
    },
    alertTimeValue: {
        fontFamily: "CeraPro_Bold",
        textAlign: 'center',
        color: "white",
        marginBottom: 10,
        textAlignVertical: "center"
    },
    alertLabel: {
        fontFamily: "CeraPro_Regular",
        marginBottom: 5,
    },
    alertSubLabel: {
        fontFamily: "CeraPro_Regular",
        opacity: 0.7,
        fontStyle: 'italic',
    }
});

export default TimeAlertPage;