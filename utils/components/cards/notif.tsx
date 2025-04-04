import React from 'react';
import { View, StyleSheet, useColorScheme } from 'react-native';
import { ThemedText } from '@/utils/components/themeUI/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { CardsColors, secondaryColor } from '@/constants/Colors';
import { ThemedView } from '@/utils/components/themeUI/ThemedView';

// Define the notification type
export type Notification = {
    id: string;
    title: string;
    subtitle: string;
    date: string;
    read: boolean;
    icon?: string;
};

type NotificationCardProps = {
    notification: Notification;
    isLastItem?: boolean;
    cardStyle?: object;
};

const NotificationCard: React.FC<NotificationCardProps> = ({
    notification,
    isLastItem = false,
  cardStyle,
}) => {
    const colorScheme = useColorScheme();
    const themeColors = CardsColors[colorScheme || 'light'];

    return (
        <ThemedView style={[styles.card, cardStyle]}>
            <View style={[styles.notificationItem, !isLastItem && styles.borderBottom]}>
                <View style={[
                styles.iconContainer,
                { backgroundColor: `${secondaryColor}15` }
                ]}>
                <Ionicons
                    name={notification.icon || "notifications"}
                    size={24} 
                    color={secondaryColor}
                />
                </View>
                <View style={styles.notificationContent}>
                <View style={styles.headerContainer}>
                    <ThemedText style={styles.notificationTitle}>
                        
                        {notification.subtitle}
                    </ThemedText>
                    <ThemedText style={[styles.dateLabel, { color: secondaryColor }]}>
                        {notification.title}
                    </ThemedText>
                </View>
                <ThemedText style={[styles.notificationSubtitle, { color: themeColors.color }]}>
                    
                    {notification.date}
                </ThemedText>
                </View>
            </View>
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    card: {
        marginHorizontal: 16,
    },
    notificationItem: {
        flexDirection: 'row',
        paddingVertical: 16,
        alignItems: 'center',
    },
    borderBottom: {
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        marginRight: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    notificationContent: {
        flex: 1,
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    notificationTitle: {
        fontSize: 15,
        fontFamily: "CeraPro_Bold",
    },
    dateLabel: {
        fontSize: 13,
        fontFamily: "CeraPro_Medium",
    },
    notificationSubtitle: {
        fontSize: 13,
        fontFamily: "CeraPro_Light",
    },
});

export default NotificationCard;