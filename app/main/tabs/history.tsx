import React, { useCallback, useEffect, useState } from "react";
import {
    View,
    Text,
    ActivityIndicator,
    Image,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    useColorScheme
} from "react-native";
import * as Location from "expo-location";
import { PaperProvider } from "react-native-paper";
import { ThemedText } from "@/utils/components/themeUI/ThemedText";
import CurrentStatusCard from "@/utils/components/cards/currentStatus";
import RecentStatusCard from "@/utils/components/cards/recentStatus";
import { ThemedView } from "@/utils/components/themeUI/ThemedView";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import AlertChooseModal from "@/utils/components/modals/AlertChoose";
import { database } from "@/constants/firebase";
import { onValue, ref } from "firebase/database";

interface History {
    id: string;
    slot_name: string;
    status: 'Empty' | 'Occupied';
    date_updated: string;
}

const History = () => {
    const colorScheme = useColorScheme();
    const [history, setHistory] = React.useState<History[]>([]);
    React.useEffect(() =>{
        const standsRef = ref(database, 'History');

        const unsubscribe = onValue(standsRef, (snapshot : any) => {
            const data = snapshot.val();
            if (data) {
                // Convert Firebase array-like object to array, filtering out null entries
                const standsArray = Object.entries(data)
                .filter(([key, value]) => value !== null)
                .map(([key, value]) => ({
                    id: key,
                    ...(value as any)
                }));
                
                setHistory(standsArray);
            } else {
                setHistory([]);
            }

            }, (error) => {
                console.error("Error fetching stands data:", error);
            });
    
            // Clean up listener on component unmount
            return () => unsubscribe();
    }, [])

    return (
        <PaperProvider>
            <SafeAreaView style={[styles.container,{backgroundColor: colorScheme === 'dark' ? '#151718' : '#F6F6F6'}]}>
                <ScrollView contentContainerStyle={styles.contentContainer}>
                    {history.length > 0 ? (
                            history.slice().reverse().map((activity: any, index: any) => (
                                <RecentStatusCard
                                    key={index}
                                    activity={activity}
                                    isLastItem={index === history.length - 1}
                                    cardStyle={{ marginHorizontal: 16 }}
                                />
                            ))
                        ) : (
                            <ThemedView style={styles.emptyContainer}>
                                <Ionicons 
                                    name="information-circle-outline" 
                                    size={24} 
                                    color={colorScheme === 'dark' ? '#ffffff' : '#000000'} 
                                />
                                <ThemedText style={styles.emptyText}>
                                    No recent history
                                </ThemedText>
                            </ThemedView>
                        )}
                </ScrollView>
            </SafeAreaView>
        </PaperProvider>
    );
};

export default History;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    contentContainer: {
    },
    recent:{
        fontFamily: "CeraPro_Bold",
        fontSize: 24,
        marginBottom: 12,
        marginLeft: 12,
    },
    sectionTitle: {
        fontFamily: "CeraPro_Bold",
        fontSize: 24,
        marginBottom: 12,
        marginHorizontal: 16
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 32,
        flexDirection: 'row',
        gap: 8
    },
    emptyText: {
        fontSize: 16,
        fontFamily: "CeraPro_Medium",
    }
});
