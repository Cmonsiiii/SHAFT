
import React from "react";
import { useColorScheme } from "react-native";
import { Stack} from 'expo-router';

const LoginLayout = () =>{

    const colorScheme = useColorScheme();
    
    return(
        <Stack>
            <Stack.Screen name="index" options={{ headerBackButtonMenuEnabled: false, headerShown: false }} />
            <Stack.Screen name="title" options={{ headerBackButtonMenuEnabled: false, headerShown: false }} />
        </Stack>
    );
}

export default LoginLayout;