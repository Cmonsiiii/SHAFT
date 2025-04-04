import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import * as Network from 'expo-network';
import { ThemedText } from '@/utils/components/themeUI/ThemedText';

const NetworkAlert = ({ 
    offlineMessage = 'No Internet Connection' 
}) => {
    const [isConnected, setIsConnected] = useState(true);
    const translateY = new Animated.Value(-50);

    useEffect(() => {
        let intervalId;

        const checkConnection = async () => {
            try {
                const networkState = await Network.getNetworkStateAsync();
                const isCurrentlyConnected = networkState.isConnected;
                
                if (isConnected !== isCurrentlyConnected) {
                    setIsConnected(isCurrentlyConnected);
                    
                    // Animate based on connection state
                    Animated.spring(translateY, {
                        toValue: isCurrentlyConnected ? -50 : 0,
                        useNativeDriver: true,
                        bounciness: 8
                    }).start();
                }
            } catch (error) {
                console.log('Error checking network:', error);
            }
        };

        // Initial check
        checkConnection();

        // Set up interval to check connection status
        intervalId = setInterval(checkConnection, 3000);

        // Cleanup
        return () => {
            clearInterval(intervalId);
        };
    }, [isConnected]);

    return (
        <Animated.View 
            style={[
                styles.container,
                {
                    transform: [{ translateY }],
                    backgroundColor: isConnected ? '#4CAF50' : '#f44336'
                }
            ]}
        >
            <ThemedText style={styles.text}>
                {isConnected ? 'Back Online' : offlineMessage}
            </ThemedText>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999,
    },
    text: {
        color: '#fff',
        fontSize: 14,
        fontFamily: 'CeraPro'
    }
});

export default NetworkAlert;