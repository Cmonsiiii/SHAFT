import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/utils/components/themeUI/ThemedText';

interface WeatherAlertProps {
  message: string;
  type: 'temperature-high' | 'temperature-low' | 'precipitation';
  value: number;
  threshold: number;
  unit: string;
  onDismiss: () => void;
}

const WeatherAlert: React.FC<WeatherAlertProps> = ({
  message,
  type,
  value,
  threshold,
  unit,
  onDismiss
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const { width } = Dimensions.get('window');

  useEffect(() => {
    // Animate in
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true
    }).start();
  }, []);

  const dismissAlert = () => {
    // Animate out
    Animated.timing(animatedValue, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true
    }).start(() => {
      onDismiss();
    });
  };

  // Get icon based on alert type
  const getIcon = () => {
    switch (type) {
      case 'temperature-high':
        return 'thermometer';
      case 'temperature-low':
        return 'snow';
      case 'precipitation':
        return 'rainy';
      default:
        return 'alert-circle';
    }
  };

  // Get color based on alert type
  const getColor = () => {
    switch (type) {
      case 'temperature-high':
        return '#FF4500'; // OrangeRed
      case 'temperature-low':
        return '#1E90FF'; // DodgerBlue
      case 'precipitation':
        return '#4169E1'; // RoyalBlue
      default:
        return '#FF9500';
    }
  };

    return (
        <Animated.View 
            style={[
                styles.container,
                {
                transform: [
                    {
                    translateY: animatedValue.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-100, 0]
                    })
                    }
                ],
                opacity: animatedValue
                }
            ]}
        >
        <View style={styles.content}>
            <Ionicons name={getIcon()} size={24} color={getColor()} style={styles.icon} />
            <View style={styles.textContainer}>
                <ThemedText style={styles.title}>Weather Alert</ThemedText>
                <ThemedText style={styles.message}>{message}</ThemedText>
                <View style={styles.valueContainer}>
                    <ThemedText style={styles.label}>Current:</ThemedText>
                    <ThemedText style={[styles.value, { color: getColor() }]}>{value}{unit}</ThemedText>
                    <ThemedText style={styles.label}>Threshold:</ThemedText>
                    <ThemedText style={styles.value}>{threshold}{unit}</ThemedText>
                </View>
            </View>
            <TouchableOpacity onPress={dismissAlert} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#777" />
            </TouchableOpacity>
        </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 30,
        left: 0,
        right: 0,
        zIndex: 999,
        padding: 10,
    },
    content: {
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 15,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
        width: 0,
        height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    icon: {
        marginRight: 10,
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: 4,
    },
    message: {
        fontSize: 14,
        marginBottom: 8,
    },
    valueContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
    },
    label: {
        fontSize: 12,
        color: '#555',
        marginRight: 4,
    },
    value: {
        fontSize: 14,
        fontWeight: 'bold',
        marginRight: 10,
    },
    closeButton: {
        padding: 5,
    }
});

export default WeatherAlert;