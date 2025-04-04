import React from 'react';
import { View, Modal, TouchableOpacity, Image, StyleSheet, Text, Dimensions } from 'react-native';
import { ThemedText } from '@/utils/components/themeUI/ThemedText';
import IconButton from '@/utils/components/buttons/iconBtn';
import { ThemedView } from '../themeUI/ThemedView';

const { width } = Dimensions.get('window');

interface MapTypeModalProps {
    visible: boolean;
    onClose: () => void;
    onSelectMapType: (type: 'standard' | 'satellite' | 'terrain') => void;
    currentMapType: string;
}

const MapTypeModal = ({ visible, onClose, onSelectMapType, currentMapType }: MapTypeModalProps) => {
    const mapTypes = [
        { id: 'standard', label: 'Standard', image: require('@/assets/images/maps/standard.png') },
        { id: 'satellite', label: 'Satellite', image: require('@/assets/images/maps/satellite.png') },
        { id: 'terrain', label: 'Terrain', image: require('@/assets/images/maps/terrain.png') },
    ];

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <ThemedView style={styles.modalContent}>
                    <View style={styles.header}>
                        <ThemedText style={styles.title}>Select Map Type</ThemedText>
                        <IconButton iconName="close" onPress={onClose} size={24} />
                    </View>

                    <View style={styles.mapTypesContainer}>
                        {mapTypes.map((type) => (
                            <TouchableOpacity
                                key={type.id}
                                onPress={() => {
                                    onSelectMapType(type.id as 'standard' | 'satellite' | 'terrain');
                                    onClose();
                                }}
                            >
                                <View style={styles.mapTypeWrapper}>
                                    <View style={[
                                        styles.mapTypeOption,
                                        currentMapType === type.id && styles.selectedOption
                                    ]}>
                                        <Image
                                            source={type.image}
                                            style={styles.mapTypeImage}
                                            resizeMode="cover"
                                        />
                                        {currentMapType === type.id && (
                                            <View style={styles.overlay}>
                                                <IconButton iconName="checkmark-circle" size={28} />
                                            </View>
                                        )}
                                    </View>
                                    <ThemedText style={[
                                        styles.mapTypeLabel,
                                        currentMapType === type.id && styles.selectedLabel
                                    ]}>
                                        {type.label}
                                    </ThemedText>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                </ThemedView>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        maxHeight: '80%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 18,
        fontFamily: "CeraPro_Bold"
    },
    mapTypesContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 10,
    },
    mapTypeWrapper: {
        alignItems: 'center',
        width: (width - 60) / 3,
    },
    mapTypeOption: {
        width: '100%',
        borderRadius: 10,
        overflow: 'hidden',
        position: 'relative',
    },
    selectedOption: {
        borderWidth: 2,
        borderColor: '#4CAF50',
    },
    mapTypeImage: {
        width: '100%',
        height: 100,
        borderRadius: 10,
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(76, 175, 80, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    mapTypeLabel: {
        textAlign: 'center',
        paddingTop: 8,
        fontSize: 14,
        fontFamily: "CeraPro_Medium"
    },
    selectedLabel: {
        color: '#4CAF50',
        fontFamily: "CeraPro_Bold"
    }
});

export default MapTypeModal;