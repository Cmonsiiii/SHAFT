import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Switch, TextInput, TouchableOpacity, SafeAreaView, useColorScheme } from 'react-native';
import { ThemedText } from '@/utils/components/themeUI/ThemedText';
import { ThemedView } from '@/utils/components/themeUI/ThemedView';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { showNotification } from '@/utils/code/server/notifService';
import { secondaryColor } from '@/constants/Colors';
import { useRouter } from 'expo-router';
import Button from '@/utils/components/buttons/button';
import { GestureHandlerRootView, ScrollView } from 'react-native-gesture-handler';
import { PaperProvider, Snackbar } from 'react-native-paper';
import AlertSnack from '@/utils/components/snackbar/alertSnack';

// Default threshold values
const DEFAULT_THRESHOLDS = {
    maxTemperature: 30, // Celsius
    minTemperature: 0,  // Celsius
    maxPrecipitation: 70, // Percentage
};

// Storage keys
const STORAGE_KEY_THRESHOLDS = 'weather_thresholds';
const STORAGE_KEY_ENABLED = 'weather_alerts_enabled';

export default function WeatherThresholdSettings({ }) {
  // State for threshold values
    const router = useRouter()
    const colorScheme = useColorScheme()
    const [maxTemperature, setMaxTemperature] = useState(DEFAULT_THRESHOLDS.maxTemperature.toString());
    const [minTemperature, setMinTemperature] = useState(DEFAULT_THRESHOLDS.minTemperature.toString());
    const [maxPrecipitation, setMaxPrecipitation] = useState(DEFAULT_THRESHOLDS.maxPrecipitation.toString());
    
    // Switches for enabling/disabling specific alerts
    const [maxTempEnabled, setMaxTempEnabled] = useState(true);
    const [minTempEnabled, setMinTempEnabled] = useState(true);
    const [precipEnabled, setPrecipEnabled] = useState(true);
    
    // Master switch for all alerts
  const [alertsEnabled, setAlertsEnabled] = useState(true);

  // Load saved settings on component mount
    useEffect(() => {
        loadSettings();
    }, []);

    // Save settings whenever they change
    useEffect(() => {
        saveSettings();
    }, [maxTemperature, minTemperature, maxPrecipitation, maxTempEnabled, minTempEnabled, precipEnabled, alertsEnabled]);

  // Load settings from AsyncStorage
    const loadSettings = async () => {
        try {
        // Load threshold values
            const savedThresholds = await AsyncStorage.getItem(STORAGE_KEY_THRESHOLDS);
            if (savedThresholds) {
                const thresholds = JSON.parse(savedThresholds);
                setMaxTemperature(thresholds.maxTemperature.toString());
                setMinTemperature(thresholds.minTemperature.toString());
                setMaxPrecipitation(thresholds.maxPrecipitation.toString());
                setMaxTempEnabled(thresholds.maxTempEnabled);
                setMinTempEnabled(thresholds.minTempEnabled);
                setPrecipEnabled(thresholds.precipEnabled);
            }
        
        // Load master switch state
            const enabledString = await AsyncStorage.getItem(STORAGE_KEY_ENABLED);
            if (enabledString !== null) {
                setAlertsEnabled(enabledString === 'true');
            }
        } catch (error) {
            console.error("Error loading weather threshold settings:", error);
            // If there's an error, use defaults
            resetToDefaults();
        }
    };

  // Save settings to AsyncStorage
    const saveSettings = async () => {
        try {
            const thresholds = {
                maxTemperature: parseFloat(maxTemperature) || DEFAULT_THRESHOLDS.maxTemperature,
                minTemperature: parseFloat(minTemperature) || DEFAULT_THRESHOLDS.minTemperature,
                maxPrecipitation: parseFloat(maxPrecipitation) || DEFAULT_THRESHOLDS.maxPrecipitation,
                maxTempEnabled,
                minTempEnabled,
                precipEnabled
            };
        
            await AsyncStorage.setItem(STORAGE_KEY_THRESHOLDS, JSON.stringify(thresholds));
            await AsyncStorage.setItem(STORAGE_KEY_ENABLED, alertsEnabled.toString());
        } catch (error) {
            console.error("Error saving weather threshold settings:", error);
        }
    };

    const [snackAlert, setSnackAlert] = React.useState({
        visible: false,
        message: '',
    });


  // Reset to default values
    const resetToDefaults = () => {
        setSnackAlert({
            visible: true,
            message: 'Successfully reset to default',
        })
        setMaxTemperature(DEFAULT_THRESHOLDS.maxTemperature.toString());
        setMinTemperature(DEFAULT_THRESHOLDS.minTemperature.toString());
        setMaxPrecipitation(DEFAULT_THRESHOLDS.maxPrecipitation.toString());
        setMaxTempEnabled(true);
        setMinTempEnabled(true);
        setPrecipEnabled(true);
        setAlertsEnabled(true);
    };

    const dismissSnack = () =>{
        setSnackAlert({
            visible: false,
            message: '',
        })
    }

  // Test notification for each type
    const testMaxTempNotification = () => {
        showNotification(
            'High Temperature Alert', 
            `Temperature has exceeded your maximum threshold of ${maxTemperature}°C.`
        );
    };

    const testPrecipNotification = () => {
        showNotification(
            'Precipitation Alert', 
            `Precipitation chance has exceeded your threshold of ${maxPrecipitation}%.`
        );
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
            <ThemedText type="title" style={styles.title}>Weather Alert Settings</ThemedText>
        
        {/* Master switch */}
            <View style={styles.switchContainer}>
                <ThemedText type="defaultSemiBold" style={styles.switchLabel}>Enable Weather Alerts</ThemedText>
                <Switch
                    value={alertsEnabled}
                    onValueChange={setAlertsEnabled}
                    trackColor={{ false: '#767577', true: secondaryColor }}
                />
            </View>
        
        <View style={styles.divider} />
        
        {/* Settings are disabled if master switch is off */}
            <View style={{ opacity: alertsEnabled ? 1 : 0.5 }}>
                {/* Max Temperature */}
                <View style={styles.settingGroup}>
                <View style={styles.settingHeader}>
                    <ThemedText type="defaultSemiBold" style={styles.settingTitle}>High Temperature Alert</ThemedText>
                    <Switch
                    value={maxTempEnabled && alertsEnabled}
                    onValueChange={setMaxTempEnabled}
                    disabled={!alertsEnabled}
                    trackColor={{ false: '#767577', true: secondaryColor }}
                    />
                </View>
                <View style={styles.inputRow}>
                    <ThemedText style={styles.description} >Notify when temperature exceeds:</ThemedText>
                    <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        value={maxTemperature}
                        onChangeText={setMaxTemperature}
                        keyboardType="numeric"
                        editable={alertsEnabled && maxTempEnabled}
                    />
                    <ThemedText style={styles.unit}>°C</ThemedText>
                    </View>
                </View>
                {alertsEnabled && maxTempEnabled && (
                    <TouchableOpacity style={styles.testButton} onPress={testMaxTempNotification}>
                        <ThemedText type="fade" style={styles.testButtonText}>Test Notification</ThemedText>
                    </TouchableOpacity>
                )}
                </View>
                
                {/* Precipitation */}
                <View style={styles.settingGroup}>
                <View style={styles.settingHeader}>
                    <ThemedText type="defaultSemiBold" style={styles.settingTitle}>Precipitation Alert</ThemedText>
                    <Switch
                    value={precipEnabled && alertsEnabled}
                    onValueChange={setPrecipEnabled}
                    disabled={!alertsEnabled}
                    trackColor={{ false: '#767577', true: secondaryColor }}
                    />
                </View>
                <View style={styles.inputRow}>
                    <ThemedText style={styles.description}>Notify when precipitation exceeds:</ThemedText>
                    <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        value={maxPrecipitation}
                        onChangeText={setMaxPrecipitation}
                        keyboardType="numeric"
                        editable={alertsEnabled && precipEnabled}
                    />
                    <ThemedText style={styles.unit}>%</ThemedText>
                    </View>
                </View>
                {alertsEnabled && precipEnabled && (
                    <TouchableOpacity style={styles.testButton} onPress={testPrecipNotification}>
                        <ThemedText type="fade" style={styles.testButtonText}>Test Notification</ThemedText>
                    </TouchableOpacity>
                )}
                </View>
            </View>
            <View style={styles.buttonsContainer}>
                <Button type='primary' title='Save & Close' onPress={() => {router.back()}}/>
            </View>
            <View style={styles.buttonsContainer}>
                <Button type='danger' title='Reset to default' onPress={resetToDefaults}/>
            </View>
            </ScrollView>
            <AlertSnack 
                visible={snackAlert.visible}
                message={snackAlert.message}
                onDismissSnackBar={dismissSnack}
                onIconPress={dismissSnack}
            />
        </SafeAreaView>
        </PaperProvider>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    title: {
        fontSize: 20,
        marginBottom: 20,
    },
    switchContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    switchLabel: {
        fontSize: 18,
    },
    divider: {
        height: 1,
        backgroundColor: '#ddd',
        marginBottom: 20,
    },
    settingGroup: {
        marginBottom: 25,
    },
    settingHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    settingTitle: {
        fontSize: 16,
    },
    inputRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 5,
        padding: 8,
        width: 60,
        textAlign: 'center',
    },
    unit: {
        marginLeft: 5,
    },
    testButton: {
        backgroundColor: secondaryColor,
        padding: 8,
        borderRadius: 5,
        alignSelf: 'flex-end',
    },
    testButtonText: {
        fontSize: 12,
        color: "white",
    },
    buttonsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        paddingTop: 20,
    },

    description:{
        fontSize: 14,
    }
});