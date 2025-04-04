// Updated ForecastCard.tsx
import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Image, ScrollView } from 'react-native';
import axios from 'axios';
import { ThemedText } from '@/utils/components/themeUI/ThemedText';
import { ThemedView } from '@/utils/components/themeUI/ThemedView';
import { Ionicons } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';

import WeatherCardLoader from './WeatherCardLoading';

interface ForecastItem {
    dt: number;
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
    dt_txt: string;
}

interface ForecastData {
    list: ForecastItem[];
    city: {
        name: string;
    };
}

interface ForecastCardProps {
    location: {
        latitude: number;
        longitude: number;
    } | null;
    isLocationLoading: boolean;
    locationError: string | null;
}

const ForecastCard = ({ location, isLocationLoading, locationError }: ForecastCardProps) => {
    const [forecastData, setForecastData] = useState<ForecastData | null>(null);
    const [dailyForecast, setDailyForecast] = useState<ForecastItem[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
    const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Fetch forecast data when location is available
    useEffect(() => {
        if (location) {
            fetchForecastByCoords(location.latitude, location.longitude);
            startUpdateInterval();
        }
        
        // Clean up on unmount
        return () => {
            if (updateIntervalRef.current) {
                clearInterval(updateIntervalRef.current);
            }
        };
    }, [location]);

    // Process forecast data to get one entry per day
    useEffect(() => {
        if (forecastData) {
            const dailyData = processDailyForecast(forecastData.list);
            setDailyForecast(dailyData);
        }
    }, [forecastData]);

    // Start the update interval
    const startUpdateInterval = () => {
        // Clear any existing interval
        if (updateIntervalRef.current) {
            clearInterval(updateIntervalRef.current);
        }

        // Create a new interval that runs every hour (3600000 ms)
        updateIntervalRef.current = setInterval(async () => {
            try {
                // Only set refreshing if we already have data
                if (forecastData && location) {
                    setIsRefreshing(true);
                    await fetchForecastByCoords(location.latitude, location.longitude);
                }
            } catch (error) {
                console.error("Error in update interval:", error);
            } finally {
                setIsRefreshing(false);
            }
        }, 3600000); // 1 hour (forecast doesn't need frequent updates)
    };

    // Fetch 5-day forecast by coordinates
    const fetchForecastByCoords = async (latitude: number, longitude: number) => {
        try {
            setIsLoading(true);
            const apiKey = '79ad386f53a3310e170159865d9c6448';
            const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=metric&appid=${apiKey}`;
            
            const response = await axios.get(url);
            setForecastData(response.data);
            return response.data;
        } catch (error) {
            console.error("Error fetching forecast by coords:", error);
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    // Process the forecast data to get one entry per day
    const processDailyForecast = (forecastList: ForecastItem[]): ForecastItem[] => {
        const dailyData: ForecastItem[] = [];
        const dailyMap = new Map<string, ForecastItem>();

        forecastList.forEach((item) => {
            const date = new Date(item.dt * 1000).toLocaleDateString();
            
            // For each day, use the forecast from around noon for the daily forecast
            const hour = new Date(item.dt * 1000).getHours();
            
            if (hour >= 11 && hour <= 14) {
                dailyMap.set(date, item);
            } else if (!dailyMap.has(date)) {
                // If we don't have an entry yet for this day, add this one temporarily
                dailyMap.set(date, item);
            }
        });

        // Convert map to array and take only the first 7 days
        dailyMap.forEach((value) => dailyData.push(value));
        return dailyData.slice(0, 7); // Limit to 7 days
    };

    // Get weather icon image based on icon code
    const getWeatherIcon = (weatherIcon: string): any => {
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
    };

    // Get day name from date
    const getDayName = (timestamp: number): string => {
        const date = new Date(timestamp * 1000);
        return date.toLocaleDateString('en-US', { weekday: 'short' });
    };

    // Show loader on initial load or when location is loading
    if (isLocationLoading || isLoading) {
        return <WeatherCardLoader />;
    }

    // If we have no data, show the loader
    if (!forecastData || dailyForecast.length === 0 || !location) {
        return <WeatherCardLoader />;
    }

    const cityName = forecastData.city.name;

    return (
        <ThemedView style={styles.container}>
            <View style={styles.header}>
                <ThemedText style={styles.title}>7-Day Forecast</ThemedText>
                <ThemedText style={styles.city}>{cityName}</ThemedText>
            </View>
        
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollView}>
                {dailyForecast.map((day, index) => (
                <ThemedView key={index} style={styles.dayCard}>
                    <ThemedText style={styles.dayName}>{getDayName(day.dt)}</ThemedText>
                    <Image 
                    source={getWeatherIcon(day.weather[0].icon)} 
                    style={styles.weatherIcon} 
                    />
                    <ThemedText style={styles.temperature}>
                    {Math.round(day.main.temp_max)}°/{Math.round(day.main.temp_min)}°
                    </ThemedText>
                    <View style={styles.detailsRow}>
                    <View style={styles.detailItem}>
                        <Ionicons name="water" size={16} />
                        <ThemedText style={styles.detailText}>{day.main.humidity}%</ThemedText>
                    </View>
                    <View style={styles.detailItem}>
                        <MaterialIcons name="air" size={16} />
                        <ThemedText style={styles.detailText}>{day.wind.speed}</ThemedText>
                    </View>
                    </View>
                </ThemedView>
                ))}
            </ScrollView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 15,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ddd',
        marginTop: 15,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    title: {
        fontSize: 18,
        fontFamily: 'CeraPro_Medium',
    },
    city: {
        fontSize: 16,
    },
    scrollView: {
        flexDirection: 'row',
    },
    dayCard: {
        alignItems: 'center',
        padding: 10,
        marginRight: 15,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#eee',
        width: 100,
    },
    dayName: {
        fontSize: 16,
        fontFamily: 'CeraPro_Medium',
        marginBottom: 5,
    },
    weatherIcon: {
        width: 50,
        height: 50,
        marginVertical: 10,
    },
    temperature: {
        fontSize: 16,
        fontFamily: 'CeraPro_Medium',
        marginBottom: 5,
    },
    detailsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 5,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    detailText: {
        fontSize: 12,
        marginLeft: 3,
    },
});

export default ForecastCard;