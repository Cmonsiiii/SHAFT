import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { ThemedText } from '@/utils/components/themeUI/ThemedText';
import { ThemedView } from '@/utils/components/themeUI/ThemedView';
import { Ionicons } from '@expo/vector-icons';
import { database } from '@/constants/firebase';
import { onValue, ref, update, push, set, get } from 'firebase/database';
import WeatherCardLoader from './WeatherCardLoading';
import { secondaryColor } from '@/constants/Colors';

// Interface for the stand data structure from Firebase
interface Stand {
    id: string;
    name: string;
    slot_number: string;
    status: 'Empty' | 'Occupied';
    date_updated: string;
}

interface UmbrellaSlotProps {
  isLoading?: boolean;
  setNotif: () => void;
}

const UmbrellaSlot = ({ isLoading: initialLoading = false, setNotif }: UmbrellaSlotProps) => {
    const [slots, setSlots] = useState<Stand[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(initialLoading);
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
    const previousSlotsRef = useRef<Stand[]>([]);

    // Function to add entry to History when status changes
    const updateHistory = async (slot: Stand, previousStatus: string | null) => {
        // Only update if there's a previous status and it's different from the current one
        if (previousStatus !== null && previousStatus !== slot.status) {
            try {
                // Get the next history ID using the same approach as your getNextUserId function
                const nextId = await getNextHistoryId();
                
                const newHistoryEntry = {
                    id: nextId,
                    status: slot.status,
                    date_updated: Date.now(),
                    slot_name: slot.name
                };

                // Use the auto-incremented ID as the key
                const historyItemRef = ref(database, `History/${nextId}`);
                await set(historyItemRef, newHistoryEntry);
                
                console.log(`History updated for ${slot.name}: ${slot.status} with ID: ${nextId}`);
                
                // After logging the history, update the stand status
                updateStandStatus(slot.id, slot.status);
                
            } catch (error) {
                console.error("Error updating history:", error);
            }
        }
    };

// Function to get the next history ID based on existing entries
    const getNextHistoryId = async (): Promise<number> => {
        try {
            // Get all existing history entries
            const historyRef = ref(database, 'History');
            const snapshot = await get(historyRef);
            
            // If no history entries exist, return 1 as the first ID
            if (!snapshot.exists()) {
                return 1;
            }
            
            // Otherwise find the highest existing history ID and increment by 1
            let highestId = 0;
            snapshot.forEach((childSnapshot) => {
                const historyId = childSnapshot.key;
                // Parse the history ID to a number (ignoring non-numeric keys)
                if (historyId && /^\d+$/.test(historyId)) {
                    const numericId = parseInt(historyId, 10);
                    if (numericId > highestId) {
                        highestId = numericId;
                    }
                }
            });
            
            return highestId + 1;
        } catch (error) {
            console.error('Error generating history ID:', error);
            throw error;
        }
    };

    useEffect(() => {
        // Reference to the Stands node in Firebase
        const standsRef = ref(database, 'Stands');
        
        // Set up listener for real-time updates
        const unsubscribe = onValue(standsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            // Convert Firebase array-like object to array, filtering out null entries
            const standsArray = Object.entries(data)
            .filter(([key, value]) => value !== null)
            .map(([key, value]) => ({
                id: key,
                ...(value as any)
            }));
            
            // Check for status changes and update History
            standsArray.forEach(currentSlot => {
            const previousSlot = previousSlotsRef.current.find(slot => slot.id === currentSlot.id);
            if (previousSlot) {
                updateHistory(currentSlot, previousSlot.status);
            }
            });
            
            // Update the state and ref
            setSlots(standsArray);
            previousSlotsRef.current = standsArray;
        } else {
            setSlots([]);
        }
        setIsLoading(false);
        }, (error) => {
        console.error("Error fetching stands data:", error);
        setIsLoading(false);
        });

        // Clean up listener on component unmount
        return () => unsubscribe();
    }, []);

  // Rest of your component remains the same...

  // Get color based on slot status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Occupied':
        return '#4CAF50'; // Green for empty (available)
      case 'Empty':
        return '#F44336'; // Red for occupied
      default:
        return '#9E9E9E'; // Default gray
    }
  };

    // Get icon based on slot status
    const getStatusIcon = (status: string) => {
        switch (status) {
        case 'Empty':
            return <Ionicons name="umbrella-outline" size={24} color={getStatusColor(status)} />;
        case 'Occupied':
            return <Ionicons name="umbrella" size={24} color={getStatusColor(status)} />;
        default:
            return <Ionicons name="help-circle-outline" size={24} color={getStatusColor(status)} />;
        }
    };

    // Function to format timestamp to readable format
    const formatTimestamp = (timestamp: string) => {
        if (!timestamp) return 'Never used';
            const date = new Date(timestamp);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const updateStandStatus = async (standId: string, newStatus: 'Empty' | 'Occupied') => {
        const standRef = ref(database, `Stands/${standId}`);
        
        try {
            // Fetch the stand's current details
            const snapshot = await get(standRef);
            if (snapshot.exists()) {
                const standData = snapshot.val();
                const standName = standData.name; // Assuming 'name' field exists

                // Update the stand's status and timestamp
                await update(standRef, {
                    status: newStatus,
                    date_updated: Date.now() // Store timestamp as a number
                });

                console.log(`Stand ${standId} (${standName}) status updated to ${newStatus}`);

                // Call updateHistory with the updated stand data
                updateHistory({ ...standData, status: newStatus, date_updated: Date.now() }, standData.status);
            } else {
                console.error(`Stand ${standId} not found`);
            }
        } catch (error) {
            console.error("Error updating stand status:", error);
        }
    };

  // Loading state
    if (isLoading) {
        return (
            <WeatherCardLoader />
        );
    }

    return (
        <ThemedView style={styles.container}>
            <View style={styles.header}>
                <ThemedText type='med' style={styles.title}>Umbrella Slots</ThemedText>
            </View>
            <ScrollView 
                horizontal={true} 
                showsHorizontalScrollIndicator={false} 
                contentContainerStyle={styles.scrollViewContent}
            >
                {slots.map((slot) => (
                <TouchableOpacity
                    key={slot.id}
                    style={[
                    styles.slotCard,
                    selectedSlot === slot.id && styles.selectedSlot
                    ]}
                    onPress={() => setSelectedSlot(slot.id)}
                >
                    <View style={styles.slotHeader}>
                    <ThemedText style={styles.slotName}>{slot.name}</ThemedText>
                    <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(slot.status) }]} />
                    </View>
                    
                    <View style={styles.slotIconContainer}>
                    {getStatusIcon(slot.status)}
                    </View>
                    
                    <View style={styles.slotDetails}>
                    <ThemedText style={styles.statusText}>
                        Status: <ThemedText style={{ color: getStatusColor(slot.status) }}>
                        {slot.status}
                    </ThemedText>
                    </ThemedText>
                    
                    <ThemedText style={styles.lastUsedText}>
                        Last updated:{`\n${formatTimestamp(slot.date_updated)}`}
                    </ThemedText>
                    </View>
                </TouchableOpacity>
                ))}
            </ScrollView>
            <TouchableOpacity style={styles.linkBtn} onPress={setNotif}>
                <ThemedText style={styles.link} type='link'>Set Timer</ThemedText>
                <Ionicons name="arrow-forward" size={14} color={secondaryColor}/>
            </TouchableOpacity>
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 15,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    header:{
        marginBottom: 10,
        marginRight: 10,
        flexDirection: "row",
        justifyContent: "space-between"
    },
    addBtn:{
        flexDirection: "row",
        alignItems: "center", // Ensures vertical alignment
        justifyContent: "center", // Centers content horizontally
    },
    scrollViewContent: {
        flexDirection: 'row',
        paddingRight: 15, // Add some padding at the end for better UX
    },
    title:{
    },
    statusDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    slotCard: {
        width: 160, // Fixed width for horizontal cards
        marginRight: 12, // Spacing between cards
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 12,
    },
    selectedSlot: {
        borderColor: '#4CAF50',
        borderWidth: 2,
    },
    slotHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    slotName: {
        fontSize: 16,
        fontFamily: 'CeraPro_Medium',
    },
    statusIndicator: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    slotIconContainer: {
        alignItems: 'center',
        marginVertical: 10,
    },
    slotDetails: {
        marginTop: 8,
    },
    statusText: {
        fontSize: 14,
        marginBottom: 5,
    },
    lastUsedText: {
        fontSize: 12,
        color: '#666',
        marginTop: 5,
    },
    actionButtons: {
        marginTop: 10,
        flexDirection: 'row',
        justifyContent: 'center',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 5,
        minWidth: 100,
    },
    rentButton: {
        backgroundColor: '#4CAF50',
    },
    returnButton: {
        backgroundColor: '#2196F3',
    },
    buttonText: {
        color: 'white',
        marginLeft: 5,
        fontSize: 14,
    },
    linkBtn:{
        flexDirection: "row",
        alignItems: "center"
    },
    link:{
        fontSize: 12,
    }
});

export default UmbrellaSlot;