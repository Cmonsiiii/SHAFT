import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { ThemedText } from '@/utils/components/themeUI/ThemedText';
import { ThemedView } from '@/utils/components/themeUI/ThemedView';
import { Ionicons } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';

import WeatherCardLoader from './WeatherCardLoading';
import { secondaryColor } from '@/constants/Colors';
import { checkWeatherAlertsNow } from '@/utils/code/server/weatherAlertService';
import { useWeatherAlerts } from '../context/weatherAlertContext';


interface WeatherData {
    main: {
        temp: number;
        temp_min: number;
        temp_max: number;
        humidity: number;
    };
    weather: {
        description: string;
        icon: string;
    }[];
    wind: {
        speed: number;
    };
    clouds: {
        all: number;
    };
    name: string; // City name from API
}

interface WeatherCardProps {
    location: {
        latitude: number;
        longitude: number;
    } | null;
    isLocationLoading: boolean;
    locationError: string | null;
    setNotif: () => void;
}

export default function WeatherCard({ location, isLocationLoading, setNotif }: WeatherCardProps) {
    const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
    const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);
    
    // Use our new weather alerts context
    const { refreshAlerts } = useWeatherAlerts();

    // Fetch weather data when location is available
    useEffect(() => {
        if (location) {
            fetchWeatherByCoords(location.latitude, location.longitude);
            startUpdateInterval();
        }
        
        // Clean up on unmount
        return () => {
            if (updateIntervalRef.current) {
                clearInterval(updateIntervalRef.current);
            }
        };
    }, [location]);

     // Check weather against thresholds whenever we have new weather data
    useEffect(() => {
        const checkAlerts = async () => {
            if (weatherData && location) {
                try {
                    // This will check the weather against saved thresholds and show notifications if needed
                    await checkWeatherAlertsNow(location);
                    // Refresh the global alerts after checking
                    await refreshAlerts();
                } catch (error) {
                    console.error("Error checking weather alerts:", error);
                }
            }
        };
        
        checkAlerts();
    }, [weatherData]);

    // Start the update interval
    const startUpdateInterval = () => {
        // Clear any existing interval
        if (updateIntervalRef.current) {
            clearInterval(updateIntervalRef.current);
        }

        // Create a new interval that runs every 10 seconds
        updateIntervalRef.current = setInterval(async () => {
            try {
                // Only set refreshing if we already have data
                if (weatherData && location) {
                    setIsRefreshing(true);
                    await fetchWeatherByCoords(location.latitude, location.longitude, true);
                }
            } catch (error) {
                console.error("Error in update interval:", error);
            } finally {
                setIsRefreshing(false);
            }
        }, 10000); // 10 seconds
    };

    // Fetch weather by coordinates
    const fetchWeatherByCoords = async (latitude: number, longitude: number, isUpdate = false) => {
        try {
            // Only set loading state for initial fetch, not for updates
            if (!isUpdate) {
                setIsLoading(true);
            }
            
            const apiKey = '79ad386f53a3310e170159865d9c6448';
            const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${apiKey}`;
            
            const response = await axios.get(url);
            setWeatherData(response.data);
            return response.data;
        } catch (error) {
            console.error("Error fetching weather by coords:", error);
            return null;
        } finally {
            // Only update loading state for initial fetch
            if (!isUpdate) {
                setIsLoading(false);
            }
        }
    };

    // Show loader only on initial load or when location is loading
    if ((isLocationLoading || isLoading) && !weatherData) {
        return <WeatherCardLoader />;
    }

    // If we have no data and aren't in the loading state, show the loader
    if (!weatherData && !isLoading) {
        return <WeatherCardLoader />;
    }

    // If we have data, show it (even during refresh)
    if (weatherData) {
        const weatherIcon = weatherData.weather[0].icon;
        const { temp, temp_min, temp_max, humidity } = weatherData.main;
        const { speed: windSpeed } = weatherData.wind;
        const precipitation = weatherData.clouds.all;
        const cityName = weatherData.name;
        const currentDate = new Date();
        const formattedDate = currentDate.toLocaleDateString('en-US', {
            weekday: 'short', 
            month: 'short',   
            day: '2-digit',  
        });
        const weatherPicture = WeatherCheck(weatherIcon);

        return (
            <ThemedView style={styles.container}>
                <View style={styles.top}>
                    <View style={styles.head}>
                    <ThemedText style={styles.date}>{formattedDate.toUpperCase()}</ThemedText>
                    <ThemedText style={styles.city}>{cityName}</ThemedText>
                    <ThemedText style={styles.temp}>{Math.round(temp_max)}°C / {Math.round(temp_min)}°C</ThemedText>
                    </View>
                    <View style={styles.mid}>
                    <ThemedText type="title" style={styles.tempMain}>{Math.round(temp)}°C</ThemedText>
                    <View>
                        <Image style={styles.image} source={weatherPicture} />
                    </View>
                    </View>
                </View>
                <View style={styles.details}>
                    <View style={styles.grp}>
                    <ThemedText>
                        <Ionicons style={styles.icondetails} name="cloud"/>
                    </ThemedText>
                    <ThemedText>Precipitation</ThemedText>
                    <ThemedText>{precipitation}%</ThemedText>
                    </View>
                    <View style={styles.grp}>
                    <ThemedText>
                        <Ionicons style={styles.icondetails} name="water"/>
                    </ThemedText>
                    <ThemedText>Humidity</ThemedText>
                    <ThemedText>{humidity}%</ThemedText>
                    </View>
                    <View style={styles.grp}>
                    <ThemedText>
                        <MaterialIcons style={styles.icondetails} name="air"/>
                    </ThemedText>
                    <ThemedText>Wind Speed</ThemedText>
                    <ThemedText>{windSpeed} m/s</ThemedText>
                    </View>
                </View>
                <TouchableOpacity style={styles.linkBtn} onPress={setNotif}>
                    <ThemedText style={styles.link} type='link'>Set Threshold</ThemedText>
                    <Ionicons name="arrow-forward" size={14} color={secondaryColor}/>
                </TouchableOpacity>
            </ThemedView>
        );
    }

    // Fallback loader (should not reach here due to conditions above)
    return <WeatherCardLoader />;
}

function WeatherCheck(weatherIcon: string | undefined){
    let weather;
    if(weatherIcon === "01d"){
        weather = require('@/assets/images/weather/sun.png');
    } else if(weatherIcon === "01n"){
        weather = require('@/assets/images/weather/night.png');
    } else if(weatherIcon === "02d"){
        weather = require('@/assets/images/weather/fewclouds_day.png');
    } else if(weatherIcon === "02n"){
        weather = require('@/assets/images/weather/fewclouds_night.png');
    } else if(weatherIcon === "03d" || weatherIcon === "03n"){
        weather = require('@/assets/images/weather/cloud_1.png');
    } else if(weatherIcon === "04d" || weatherIcon === "04n"){
        weather = require('@/assets/images/weather/cloud_2.png');
    } else if(weatherIcon === "09d"){
        weather = require('@/assets/images/weather/shower_day.png');
    } else if(weatherIcon === "09n"){
        weather = require('@/assets/images/weather/shower_night.png');
    } else if(weatherIcon === "10d" || weatherIcon === "10n"){
        weather = require('@/assets/images/weather/rain.png');
    } else if(weatherIcon === "11d" || weatherIcon === "11n"){
        weather = require('@/assets/images/weather/thunderstorm.png');
    }

    return weather;
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    top:{
        flexDirection: "row",
        paddingBottom: 20,
        justifyContent: "space-between",
        alignItems: "center",
    },
    head:{
        flexDirection: "column"
    },
    mid:{
        flexDirection: "row",
        alignItems: "center",  
        justifyContent: "center", 
        height: "auto",
        flexWrap: "nowrap",
        marginTop: 10,  
        
    },
    image:{
        marginLeft: 5, 
        height: 70,
        width: 70, 
    },
    tempMain:{  
        fontFamily: "CeraPro_Medium",
        marginTop: 0, 
        textAlign: "center",
        marginRight: 20,
    },
    date: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    city: {
        fontSize: 16,
    },
    temp:{
        fontFamily: "CeraPro_Light"
    },
    details: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    grp: {
        flexDirection: "column",
        justifyContent: "center",
        alignContent: "center",
        alignItems: "center"
    },
    icondetails:{
        fontSize: 20,
        marginBottom: 5,
    },
    linkBtn:{
        flexDirection: "row",
        alignItems: "center"
    },
    link:{
        fontSize: 12,
    },
    // Keep existing styles
    alertIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 15,
        padding: 8,
        backgroundColor: 'rgba(255, 149, 0, 0.1)',
        borderRadius: 8,
    },
    alertBadge: {
        backgroundColor: '#FF9500',
        borderRadius: 12,
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    alertBadgeText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    alertText: {
        marginLeft: 8,
        fontSize: 14,
    },
});