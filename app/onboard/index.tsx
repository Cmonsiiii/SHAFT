import { onboardColors } from '@/constants/Colors';
import { ThemedText } from '@/utils/components/themeUI/ThemedText';
import { ThemedView } from '@/utils/components/themeUI/ThemedView';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, FlatList, Dimensions, useColorScheme, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


const { width, height } = Dimensions.get('window');

const slides = [
    {
        id: '1',
        title: 'Introducing SHAFT',
        description:
        "SHAFT is a smart umbrella system designed to help you never forget your umbrella again. Our IoT-powered stand ensures you're prepared for rain before you leave home.",
        image: require("@/assets/images/onboard/rain.jpg"), // Replace with your image path
    },
    {
        id: '2',
        title: 'Smart Weather Integration',
        description:
        "SHAFT connects to real-time weather forecasts and sends timely notifications when rain is expected, ensuring you're always prepared for changing weather conditions.",
        image: require("@/assets/images/onboard/car.jpg"), // Replace with your image path
    },
    {
        id: '3',
        title: 'Never Forget Your Umbrella',
        description:
        "Our smart stand uses weight detection to track your umbrella's presence and reminds you to take it when rain is forecast, and to return it when you're back home.",
        image: require("@/assets/images/onboard/umbrella.jpg"), // Replace with your image path
    },
];

const OnboardingScreen = ({ navigation }: { navigation: any }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const colorScheme = useColorScheme();
    const AppIcon = require("@/assets/images/shaft_logo.png")

    const router = useRouter()

    const currentTheme = onboardColors[colorScheme === 'dark' ? 'dark' : 'light'];
    StatusBar.setBarStyle(colorScheme === 'dark' ? 'light-content' : 'dark-content')
    StatusBar.setBackgroundColor(colorScheme === 'dark' ? onboardColors.dark.background : onboardColors.light.background);

    const handleSkip = async () => {
        await AsyncStorage.setItem("onboardingComplete", "true")
        router.replace("/onboard/title")
    };

    const onScroll = (event: any) => {
        const index = Math.round(event.nativeEvent.contentOffset.x / width);
        setCurrentIndex(index);
    };

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={slides}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={onScroll}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                <ThemedView style={styles.slide}>
                    <Image source={item.image} style={styles.image} />
                    <ThemedView style={styles.bottom}>
                        <View style={styles.content}>
                            <View style={styles.logoContainer}>
                                <Image source={AppIcon} style={styles.logo} />
                            </View>
                            <ThemedText style={styles.title}>{item.title}</ThemedText>
                            <ThemedText style={styles.description}>{item.description}</ThemedText>
                        </View>
                    </ThemedView>
                </ThemedView>
                )}
            />
            <View style={styles.pagination}>
                {slides.map((_, index) => (
                <View
                    key={index}
                    style={[
                            styles.dot,
                            {
                                backgroundColor:
                                    currentIndex === index
                                        ? currentTheme.activeDot
                                        : currentTheme.inactiveDot,
                            },
                        ]}
                />
                ))}
            </View>
            {currentIndex < slides.length - 1 && ( // Show "Skip" only if not on the last slide
                <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
                    <Text style={styles.skipText}>Skip</Text>
                </TouchableOpacity>
            )}
            <TouchableOpacity
                onPress={handleSkip}
                style={[
                    styles.getStartedButton,
                    { display: currentIndex === slides.length - 1 ? 'flex' : 'none' }, // Show only on the last slide
                ]}
            >
                <ThemedText style={[styles.getStartedText, { color: colorScheme === 'dark' ? currentTheme.text : currentTheme.text }]}>Get Started</ThemedText>
            </TouchableOpacity>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    slide: {
        width,
        alignItems: 'center',
        overflow: 'hidden',
    },
    image: {
        width: width * 1.1,
        height: height * 0.55,
        resizeMode: 'cover',
        zIndex: 1,
    },
    bottom:{
        zIndex: 10,
        width: width,
        height: "100%",
        bottom: 50,
        alignContent: "center",
        alignItems: "center",
        alignSelf: "center",
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
    },
    content: {
        width: width * 0.85,
        height: 220,
        paddingHorizontal: 20,
        paddingVertical: 20,
        borderRadius: 20,
        marginTop: 20,
        flexDirection: "column",
    },
    logoContainer:{
        marginBottom: 40,
        justifyContent: "center",
        alignSelf: "center",
    },
    logo:{
        width: width * .1,
        height: height * 0.05,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    description: {
        fontSize: 14,
        textAlign: 'center',
        marginTop: 10,
    },
    pagination: {
        flexDirection: 'row',
        position: 'absolute',
        bottom: 25,
        alignSelf: 'center',
    },
    dot: {
        height: 8,
        width: 8,
        borderRadius: 4,
        marginHorizontal: 5,
    },
    activeDot: {
        backgroundColor: '#B8F5FF',
    },
    inactiveDot: {
        backgroundColor: '#277CA5',
    },
    skipButton: {
        position: 'absolute',
        top: 70,
        right: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20, 
        justifyContent: "center",
        alignContent: "center",
        alignItems: "center"
    },
    skipText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: "white",
        fontFamily: "CeraPro",
        textAlign: "center"
    },
    getStartedButton: {
        position: 'absolute',
        bottom: 20, // Aligns with the pagination dots
        right: 20,  // Aligns to the right
        borderRadius: 25,
        zIndex: 10, // Ensures it appears above other elements
    },
    getStartedText: {
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        paddingHorizontal: 12,
    },
});

export default OnboardingScreen;
