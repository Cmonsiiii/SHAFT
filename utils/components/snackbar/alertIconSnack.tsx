import * as React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Snackbar } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { secondaryColor } from '@/constants/Colors';

interface AlertSnackProps {
  visible: boolean;
  onDismissSnackBar: () => void;
  onIconPress: () => void;
  message?: string;
  actionLabel?: string;
  onActionPress?: () => void;
  color: string,
  icon_name: any
}

const AlertIconSnack: React.FC<AlertSnackProps> = ({
  visible,
  onDismissSnackBar,
  onIconPress,
  icon_name,
  color = secondaryColor,
  message,
}) => {

    return (
        <View style={styles.container}>
            <Snackbar
                visible={visible}
                onDismiss={onDismissSnackBar}
                duration={2000}
                onIconPress={onIconPress}
                >
                <Ionicons name={icon_name} size={24} color={color}/>
                {message}
            </Snackbar>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute', 
        bottom: 5, 
        left: 0, 
        right: 0,
        flex: 1,
        justifyContent: 'space-between',
        zIndex: 999999,
    },
});

export default AlertIconSnack;