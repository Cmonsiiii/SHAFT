import React from 'react';
import { View, StyleSheet, useColorScheme } from 'react-native';
import { ThemedText } from '../themeUI/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { accentColorLight, CardsColors, danger, lightAccent, primaryColor, secondaryColor, warning } from '@/constants/Colors';
import Button from '../buttons/button';

const STATUS_CONFIG = {
    pending: {
        icon: 'alert-circle',
        color: warning,
        text: 'Request Pending'
    },
    accepted: {
        icon: 'checkmark-circle',
        color: secondaryColor,
        text: 'Request Accepted'
    },
    inProgress: {
        icon: 'time',
        color: accentColorLight,
        text: 'In Progress'
    },
    completed: {
        icon: 'checkbox',
        color: secondaryColor,
        text: 'Completed'
    },
    cancelled: {
        icon: 'close-circle',
        color: danger,
        text: 'Cancelled'
    }
};

interface RequestData {
    timestamp?: string;
    type?: string;
    location?: string;
    address?: string;
    description?: string;
}

interface CurrentStatusCardProps {
    status: keyof typeof STATUS_CONFIG;
    requestData: RequestData;
    onCancelRequest?: () => void;
    showCancelButton?: boolean;
    cardStyle?: object;
    textColor?: string;
}

const CurrentStatusCard: React.FC<CurrentStatusCardProps> = ({
    status = 'pending',
    requestData,
    onCancelRequest,
    showCancelButton = true,
    cardStyle,
    textColor = lightAccent
}) => {
    const colorScheme = useColorScheme();
    const statusConfig = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
    const isUrgent = requestData.type?.toLowerCase().includes('urgent');

    const renderDetail = (label: string, value?: string) => {
        if (!value) return null;
        return (
            <View style={styles.detailsContainer}>
                <ThemedText style={[styles.detailText, { color: textColor }]}>{label}:</ThemedText>
                <ThemedText style={[styles.details, { color: textColor }]}>{value}</ThemedText>
            </View>
        );
    };

    return (
        <View style={[
            styles.card,
            { backgroundColor: isUrgent ? primaryColor : primaryColor },
            isUrgent && styles.urgentCard,
            cardStyle
        ]}>
            {isUrgent && (
                <View style={styles.urgentBanner}>
                    <Ionicons name="warning" size={16} color="#FFF" />
                    <ThemedText style={styles.urgentText}>EMERGENCY REQUEST</ThemedText>
                </View>
            )}
            
            <View style={[
                styles.cardContent,
                isUrgent && styles.urgentContent
            ]}>
                <View style={styles.statusContainer}>
                    <Ionicons 
                        name={statusConfig.icon} 
                        size={24} 
                        color={isUrgent ? danger : statusConfig.color} 
                    />
                    <ThemedText 
                        style={[
                            styles.statusText, 
                            { color: isUrgent ? danger : statusConfig.color }
                        ]}
                    >
                        {statusConfig.text}
                    </ThemedText>
                </View>

                <View style={styles.detailsWrapper}>
                    {renderDetail('Date Requested', requestData.timestamp)}
                    {renderDetail('Type', requestData.type)}
                    {renderDetail('Address', requestData.address)}
                    {renderDetail('Description', requestData.description)}
                </View>

                {showCancelButton && status === 'pending' && (
                    <View style={styles.btnCancel}>
                        <Button 
                            title="Cancel Request" 
                            type="danger" 
                            onPress={onCancelRequest}
                        />
                    </View>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.15,
        shadowRadius: 5,
        elevation: 5,
        overflow: 'hidden',
    },
    urgentCard: {
        borderWidth: 2,
        borderColor: danger,
    },
    urgentBanner: {
        backgroundColor: danger,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 8,
        gap: 8,
    },
    urgentText: {
        color: '#FFF',
        fontFamily: "CeraPro_Bold",
        fontSize: 14,
    },
    cardContent: {
        padding: 20,
    },
    urgentContent: {
        backgroundColor: primaryColor,
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    statusText: {
        marginLeft: 8,
        fontSize: 18,
        fontFamily: "CeraPro_Bold"
    },
    detailsWrapper: {
        backgroundColor: 'rgba(0,0,0,0.02)',
        borderRadius: 10,
        padding: 12,
        marginBottom: 10,
    },
    detailsContainer: {
        gap: 6,
        flexDirection: "row",
        width: "auto",
        marginBottom: 10
    },
    detailText: {
        fontSize: 14,
        fontFamily: "CeraPro_Bold",
        minWidth: 110,
    },
    details: {
        fontSize: 14,
        flex: 1,
    },
    btnCancel: {
        marginVertical: 10,
        justifyContent: "center",
        alignContent: "center",
        alignItems: "center",
    }
});

export default CurrentStatusCard;