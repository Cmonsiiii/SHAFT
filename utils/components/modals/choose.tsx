import { View, Text, StyleSheet, Modal, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import * as React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '../themeUI/ThemedText';
import { ThemedView } from '../themeUI/ThemedView';

interface EditProfileModalProps {
    modalVisible: boolean;
    onClose: () => void;
    openGallery: () => void;
    openCamera: () => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ modalVisible, onClose, openGallery, openCamera }) => {
    return (
        <Modal
            transparent={true}
            animationType="fade"
            visible={modalVisible}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={style.modalOverlay}>
                    <TouchableWithoutFeedback>
                        <ThemedView style={style.modalContainer}>
                            <ThemedText style={style.modalTitle}>Pick an Image</ThemedText>
                            <View style={style.buttonsContainer}>
                                <TouchableOpacity style={style.iconButton} onPress={openGallery}>
                                    <Ionicons name="image" style={style.icon} />
                                </TouchableOpacity>
                                <TouchableOpacity style={style.iconButton} onPress={openCamera}>
                                    <Ionicons name="camera" style={style.icon} />
                                </TouchableOpacity>
                            </View>
                        </ThemedView>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const style = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContainer: {
        width: '80%',
        paddingVertical: 30,
        paddingHorizontal: 20,
        backgroundColor: 'white',
        borderRadius: 10,
        alignItems: 'center', // Centers content horizontally
        justifyContent: 'center', // Centers content vertically
    },
    modalTitle: {
        fontSize: 20,
        marginBottom: 20,
        textAlign: 'center',
        color: '#000',
    },
    buttonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginTop: 20,
    },
    iconButton: {
        backgroundColor: '#113547',
        padding: 15,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        width: 60,
        height: 60,
    },
    icon: {
        fontSize: 24,
        color: 'white',
    },
});

export default EditProfileModal;
