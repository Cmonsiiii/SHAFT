import React, { useState } from 'react';
import { View, Image, TouchableOpacity, Alert, StyleSheet, PermissionsAndroid, Platform } from 'react-native';
import { ThemedText } from '@/utils/components/themeUI/ThemedText';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import Ionicons from '@expo/vector-icons/Ionicons';
import EditProfileModal from '../modals/choose';

const ImageInput = ({ onImagesChange }) => {
    const [images, setImages] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const MAX_IMAGES = 3;
    const MAX_SIZE_MB = 5;
    const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

    const requestCameraPermission = async () => {
        if (Platform.OS === 'android') {
            try {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.CAMERA,
                    {
                        title: "Camera Permission",
                        message: "We need access to your camera to take photos.",
                        buttonNeutral: "Ask Me Later",
                        buttonNegative: "Cancel",
                        buttonPositive: "OK"
                    }
                );
                return granted === PermissionsAndroid.RESULTS.GRANTED;
            } catch (err) {
                console.error('Camera permission error:', err);
                return false;
            }
        }
        return true;
    };

    const requestStoragePermission = async () => {
        if (Platform.OS === 'android') {
            try {
                if (Platform.Version >= 33) {
                    const granted = await PermissionsAndroid.request(
                        PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
                        {
                            title: "Photo Permission",
                            message: "We need access to your photos to attach them to your request.",
                            buttonNeutral: "Ask Me Later",
                            buttonNegative: "Cancel",
                            buttonPositive: "OK"
                        }
                    );
                    return granted === PermissionsAndroid.RESULTS.GRANTED;
                } else {
                    const granted = await PermissionsAndroid.request(
                        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
                        {
                            title: "Photo Permission",
                            message: "We need access to your photos to attach them to your request.",
                            buttonNeutral: "Ask Me Later",
                            buttonNegative: "Cancel",
                            buttonPositive: "OK"
                        }
                    );
                    return granted === PermissionsAndroid.RESULTS.GRANTED;
                }
            } catch (err) {
                console.error('Storage permission error:', err);
                return false;
            }
        }
        return true;
    };

    const handleOpenGallery = async () => {
        setModalVisible(false);
        const hasPermission = await requestStoragePermission();
        if (!hasPermission) {
            Alert.alert('Permission Denied', 'Photo library access is required to select images');
            return;
        }

        const options = {
            mediaType: 'photo',
            quality: 1,
            selectionLimit: 1,
        };

        try {
            const result = await launchImageLibrary(options);
            
            if (result.didCancel) return;

            if (result.assets && result.assets[0]) {
                const image = result.assets[0];

                if (image.fileSize > MAX_SIZE_BYTES) {
                    Alert.alert('File Too Large', `Image must be smaller than ${MAX_SIZE_MB}MB`);
                    return;
                }

                const newImages = [...images, image];
                setImages(newImages);
                onImagesChange(newImages);
            }
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert('Error', 'Failed to pick image');
        }
    };

    const handleOpenCamera = async () => {
        setModalVisible(false);
        const hasPermission = await requestCameraPermission();
        if (!hasPermission) {
            Alert.alert('Permission Denied', 'Camera access is required to take photos');
            return;
        }

        const options = {
            mediaType: 'photo',
            quality: 1,
            saveToPhotos: true,
        };

        try {
            const result = await launchCamera(options);
            
            if (result.didCancel) return;

            if (result.assets && result.assets[0]) {
                const image = result.assets[0];

                if (image.fileSize > MAX_SIZE_BYTES) {
                    Alert.alert('File Too Large', `Image must be smaller than ${MAX_SIZE_MB}MB`);
                    return;
                }

                const newImages = [...images, image];
                setImages(newImages);
                onImagesChange(newImages);
            }
        } catch (error) {
            console.error('Error capturing image:', error);
            Alert.alert('Error', 'Failed to capture image');
        }
    };

    const showImagePicker = () => {
        if (images.length >= MAX_IMAGES) {
            Alert.alert('Limit Reached', `Maximum ${MAX_IMAGES} images allowed`);
            return;
        }
        setModalVisible(true);
    };

    const removeImage = (index: number) => {
        const newImages = images.filter((_, i) => i !== index);
        setImages(newImages);
        onImagesChange(newImages);
    };

    return (
        <View style={styles.container}>
            {images.map((image, index) => (
                <View key={index} style={styles.imageWrapper}>
                    <Image
                        source={{ uri: image.uri }}
                        style={styles.image}
                    />
                    <TouchableOpacity
                        style={styles.removeBtn}
                        onPress={() => removeImage(index)}
                    >
                        <Ionicons name="close-circle" size={20} color="white" />
                    </TouchableOpacity>
                </View>
            ))}

            {images.length < MAX_IMAGES && (
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={showImagePicker}
                >
                    <Ionicons name="add" size={32} color="#666" />
                    <ThemedText style={styles.addText}>
                        Add Photo
                    </ThemedText>
                </TouchableOpacity>
            )}

            <EditProfileModal
                modalVisible={modalVisible}
                onClose={() => setModalVisible(false)}
                openGallery={handleOpenGallery}
                openCamera={handleOpenCamera}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        paddingHorizontal: 10,
    },
    imageWrapper: {
        width: 100,
        height: 100,
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: '#f0f0f0',
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    removeBtn: {
        position: 'absolute',
        top: 5,
        right: 5,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 12,
        padding: 4,
    },
    addButton: {
        width: 100,
        height: 100,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ccc',
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.02)',
    },
    addText: {
        fontSize: 12,
        marginTop: 4,
    },
});

export default ImageInput;