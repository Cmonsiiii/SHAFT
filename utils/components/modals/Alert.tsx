import React from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Button from '../buttons/button';
import { HeaderColors, success } from '@/constants/Colors';
import { danger } from '@/constants/Colors';
import OTPButton from '../buttons/otpbutton';
import { ThemedText } from '../themeUI/ThemedText';
import { ThemedView } from '../themeUI/ThemedView';
const { width } = Dimensions.get('window');

type CustomModalProps = {
    visible: boolean; // Controls the visibility of the modal
    onConfirm: () => void; // Function to handle modal close
    message?: string; // Message displayed in the modal
    icon?: any; // Icon name from 
    iconColor?: string;
};

const AlertModal: React.FC<CustomModalProps> = ({
    visible,
    onConfirm,
    message = 'Are you sure?',
    icon = 'alert-circle-outline',
    iconColor,
}) => {
    const colorScheme = useColorScheme()
    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.overlay}>
                <ThemedView style={[styles.modalContainer]}>
                    <Ionicons name={icon} size={64} color={iconColor === "success" ? success : danger} style={styles.icon} />
                    <ThemedText style={styles.message}>{message}</ThemedText>
                    <View style={styles.buttonContainer}>
                        <OTPButton title='Confirm' onPress={onConfirm}/>
                    </View>
                </ThemedView>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: width * 0.8,
        borderRadius: 16,
        alignItems: 'center',
        paddingVertical: 20,
        paddingHorizontal: 10,
    },
    icon: {
        marginBottom: 10,
    },
    message: {
        fontSize: 16,
        textAlign: 'center',
        marginVertical: 10,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        width: '100%',
        marginTop: 20,
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 10,
        marginHorizontal: 5,
        borderRadius: 8,
    },
    cancelButtonText: {
        color: '#333',
        textAlign: 'center',
        fontSize: 16,
    },
    confirmButton: {
        flex: 1,
        paddingVertical: 10,
        marginHorizontal: 5,
        borderRadius: 8,
    },
    confirmButtonText: {
        color: '#fff',
        textAlign: 'center',
        fontSize: 16,
    },
});

export default AlertModal;
