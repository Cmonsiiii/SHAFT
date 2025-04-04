import * as React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { IconColors } from '@/constants/Colors';
import { useColorScheme } from 'react-native';

interface IconButtonProps {
    iconName: any; // Icon name for Ionicons
    onPress?: () => void; // Callback function for button press
    buttonStyle?: StyleProp<ViewStyle>; // Style for the button container
    iconStyle?: StyleProp<TextStyle>; // Style for the icon
}

export default function IconButton({
    iconName,
    onPress = () => {},
}: IconButtonProps) {
    const colorScheme = useColorScheme(); // Detect current theme (light/dark)
    const themeColors = IconColors[colorScheme || 'light'];
    return (
        <View style={style.container}>
            <TouchableOpacity onPress={onPress} style={[style.touchable]}>
                <View style={[style.button, { backgroundColor: themeColors.background }]}>
                    <Ionicons style={[style.icon, { color: themeColors.icon }]} name={iconName} />
                </View>
            </TouchableOpacity>
        </View>
  );
}

const style = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        marginBottom: 12,
    },
    touchable: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    button: {
        padding: 8,
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 5,
    },
    icon: {
        fontSize: 20,
    },
});
