import React from 'react';
import { StyleSheet, Text, TouchableOpacity, GestureResponderEvent } from "react-native";

interface ButtonProps {
    title: string;
    onPress?: (event: GestureResponderEvent) => void; 
    type?: 'primary' | 'secondary' | 'danger';
    disabled?: boolean;
}

const OTPButton: React.FC<ButtonProps> = ({
    title,
    onPress = () => {},
    type = 'primary',
    disabled = false,
}) => {
    return (
        <TouchableOpacity
            style={[
                style.button,
                type === 'primary' && style.primary,
                type === 'secondary' && style.secondary,
                type === 'danger' && style.danger,
                disabled && style.disabled
            ]}
            onPress={onPress}
            activeOpacity={0.7}
            disabled={disabled}
            >
            <Text style={style.btnTitle}>
                {title}
            </Text>
        </TouchableOpacity>
    );
};

const style = StyleSheet.create({
    button: {
        width: "40%",
        height: 47,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 10,
    },
    primary: {
        backgroundColor: "#113547", // Primary color (blue)
    },
    secondary: {
        backgroundColor: "#277CA5", // Secondary color (light blue/gray)
    },
    btnTitle: {
        color: "white",
        fontSize: 16,
        fontFamily: "CeraPro_Medium",
    },
    danger: {
        backgroundColor: "#cc0000", // Danger color (red)
    },
    disabled: {
        opacity: 0.7, // Disabled button opacity
    },
});

export default OTPButton;
