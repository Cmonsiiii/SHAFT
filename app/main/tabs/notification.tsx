import Button from "@/utils/components/buttons/button";
import NotificationCard from "@/utils/components/cards/notif";
import { ThemedText } from "@/utils/components/themeUI/ThemedText";
import { ThemedView } from "@/utils/components/themeUI/ThemedView";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { View, SafeAreaView, useColorScheme, StyleSheet, ScrollView, RefreshControl } from "react-native";
import { 
  getNotifications, 
  getNotificationsFromStorage,
  markNotificationAsRead,
} from "@/utils/code/server/notifService";

const NotificationPage = () => {
    const colorScheme = useColorScheme();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    // Load notifications when the page loads
    useEffect(() => {
        loadNotifications();
        
        // Set up periodic refresh
        const interval = setInterval(() => {
            loadNotifications();
        }, 5000); // Check for new notifications every 5 seconds
        
        return () => clearInterval(interval);
    }, []);

    // Load notifications from storage and memory
    const loadNotifications = async () => {
        try {
            // First try to get from memory for speed
            let notifs = getNotifications();
            
            // If empty, try to get from storage
            if (notifs.length === 0) {
                notifs = await getNotificationsFromStorage();
            }
            
            setNotifications(notifs);
        } catch (error) {
            console.error("Error loading notifications:", error);
        }
    };

    // Handle manual refresh
    const handleRefresh = async () => {
        setRefreshing(true);
        await loadNotifications();
        setRefreshing(false);
    };

    // Handle notification press
    const handleNotificationPress = (id: string) => {
        markNotificationAsRead(id);
        // Update the UI
        setNotifications(prev => 
            prev.map(notif => 
                notif.id === id ? { ...notif, read: true } : notif
            )
        );
    };

    return (
       <SafeAreaView style={[style.container, {backgroundColor: colorScheme === 'dark' ? '#151718' : '#F6F6F6'}]}>
            <ScrollView 
                contentContainerStyle={style.contentContainer}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                    />
                }
            >
                {notifications.length > 0 ? (
                    notifications.map((notification, index) => (
                        <NotificationCard
                            key={notification.id}
                            notification={notification}
                            isLastItem={index === notifications.length - 1}
                        />
                    ))
                ) : (
                    <ThemedView style={style.emptyContainer}>
                        <Ionicons 
                            name="information-circle-outline" 
                            size={24} 
                            color={colorScheme === 'dark' ? '#ffffff' : '#000000'} 
                        />
                        <ThemedText style={style.emptyText}>
                            No recent notifications
                        </ThemedText>
                    </ThemedView>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const style = StyleSheet.create({
    container:{
        flex: 1,
    },
    contentContainer: {
        flexGrow: 1,
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

export default NotificationPage;