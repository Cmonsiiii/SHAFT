import React from "react";
import { useColorScheme, View, StyleSheet, Text, Alert } from "react-native";
import { Stack, router } from 'expo-router';
import { HeaderColors } from "@/constants/Colors";
import Svg, { Circle } from "react-native-svg";
import { ThemedText } from "@/utils/components/themeUI/ThemedText";
import AlertChooseModal from '@/utils/components/modals/AlertChoose';
import { Ionicons } from "@expo/vector-icons";

// Circular progress indicator component
const CircularProgress = ({ step }) => {
  const size = 32;
  const strokeWidth = 3;
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = ((step) / 2) * circumference;
  
  return (
    <View style={styles.progressContainer}>
      <Svg width={size} height={size}>
        {/* Background circle */}
        <Circle
          stroke="#E0E0E0"
          fill="none"
          cx={center}
          cy={center}
          r={radius}
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <Circle
          stroke="#007AFF"
          fill="none"
          cx={center}
          cy={center}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={circumference - progress}
          strokeLinecap="round"
          transform={`rotate(-90 ${center} ${center})`}
        />
      </Svg>
      {/* Fraction text in the center */}
      <View style={styles.fractionContainer}>
        <ThemedText style={styles.fractionText}>{`${step}/2`}</ThemedText>
      </View>
    </View>
  );
};

const LoginLayout = () => {
    const colorScheme = useColorScheme();
    const themeColors = HeaderColors[colorScheme || 'light'];
    const [alertModal, setAlertModal] = React.useState(false);

    const handleConfirmBack = () => {
        setAlertModal(false);
        router.back();
    };

    const handleCancelBack = () => {
        setAlertModal(false);
    };

    return (
        <>
            <Stack
                screenOptions={{
                    headerShadowVisible: false,
                    headerStyle: {
                        elevation: 0,
                        borderBottomWidth: 0,
                        backgroundColor: themeColors.background,
                        color: themeColors.text,
                    },
                    headerTintColor: themeColors.text
                }}
            >
                <Stack.Screen 
                    name="login" 
                    options={{ headerShown: false }} 
                />
                <Stack.Screen 
                    name="signup_1" 
                    options={{
                        headerTitle: "",
                        headerRight: () => <CircularProgress step={1} />,
                        headerBackVisible: false,
                        headerBackButtonMenuEnabled: false,
                        gestureEnabled: false,
                        headerLeft: () => (
                            <ThemedText 
                                onPress={() => setAlertModal(true)}
                                style={styles.backButton}
                            >
                                <Ionicons name="arrow-back" size={24} />
                            </ThemedText>
                        ),
                    }} 
                />
                <Stack.Screen 
                    name="signup_2" 
                    options={{
                        headerTitle: "",
                        gestureEnabled: false,
                        headerRight: () => <CircularProgress step={2} />,
                    }} 
                />
                <Stack.Screen 
                    name="forgot_1" 
                    options={{
                        headerTitle: "",
                        headerBackVisible: false,
                        headerBackButtonMenuEnabled: false,
                        gestureEnabled: false,
                        headerLeft: () => (
                            <ThemedText 
                                onPress={() => setAlertModal(true)}
                                style={styles.backButton}
                            >
                                <Ionicons name="arrow-back" size={24} />
                            </ThemedText>
                        ),
                    }}
                />
                <Stack.Screen 
                    name="forgot_2" 
                    options={{
                        headerTitle: "",
                        headerBackVisible: false,
                        headerBackButtonMenuEnabled: false,
                        gestureEnabled: false,
                        headerLeft: () => (
                            <ThemedText 
                                onPress={() => setAlertModal(true)}
                                style={styles.backButton}
                            >
                                <Ionicons name="arrow-back" size={24} />
                            </ThemedText>
                        ),
                    }}
                />
            </Stack>
            
            <AlertChooseModal 
                visible={alertModal}
                icon="help"
                iconColor="danger"
                message="Are you sure you want to go back to login page?"
                onConfirm={handleConfirmBack}
                onCancel={handleCancelBack}
            />
        </>
    );
}

const styles = StyleSheet.create({
    progressContainer: {
        width: 32,
        height: 32,
        marginRight: 16,
        position: 'relative',
    },
    fractionContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
    },
    fractionText: {
        fontSize: 12,
        fontFamily: "CeraPro_Bold",
    },
    backButton: {
        fontSize: 16,
        fontFamily: "CeraPro",
    }
});

export default LoginLayout;

