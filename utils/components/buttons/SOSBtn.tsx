import { danger, warning } from '@/constants/Colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import * as React from 'react';
import { FloatingAction } from 'react-native-floating-action';
import { StyleSheet } from 'react-native';

interface SOSBtnProps {
    quickSOS: () => void;
    emergency: () => void;
}

const SOSBtn: React.FC<SOSBtnProps> = ({ quickSOS, emergency }) => {
    const actions = [
        {
            text: 'Quick SOS',
            icon: <MaterialCommunityIcons name="alert-decagram" size={24} color="white"/>,
            name: 'quick_sos', // Changed to snake_case as per FAB documentation
            position: 1,
            color: danger,
            textStyle: {fontFamily: "CeraPro"},
        },
        {
            text: 'Emergency Request',
            icon: <FontAwesome5 name="medkit" size={24} color="white"/>,
            name: "emergency_request", // Changed to snake_case
            position: 2,
            color: warning,
            textStyle: {fontFamily: "CeraPro"},
        },
    ];

    const handleActionPress = (name?: string) => {
        if (name === 'quick_sos') {
            quickSOS();
        } else if (name === 'emergency_request') {
            emergency();
        }
    };

    return (
        <FloatingAction 
            actions={actions}
            color={danger}
            floatingIcon={<MaterialIcons name="emergency" size={24} color="white" />}
            onPressItem={handleActionPress}
            animated={true}
            overlayColor="rgba(68, 68, 68, 0.6)"
            position='left'
        />
    );
};

const style = StyleSheet.create({
    actionLabel: {
        fontSize: 14,    
        fontFamily: "CeraPro"
    },
});

export default SOSBtn;