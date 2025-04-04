import * as React from 'react';
import { TouchableOpacity, View, Text, Image, StyleSheet, BackHandler, KeyboardAvoidingView, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/utils/components/themeUI/ThemedText';
import Button from '@/utils/components/buttons/button';
import Input from '@/utils/components/textbox/input';
import AlertModal from '@/utils/components/modals/Alert';
import { useFocusEffect } from '@react-navigation/native';
import AlertChooseModal from '@/utils/components/modals/AlertChoose';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const AppIcon = require("@/assets/images/shaft_logo.png")

const ResetPassword = () =>{

    const router = useRouter();
    const colorScheme = useColorScheme();

    //Inputs handler
    const [inputs, setInputs] = React.useState({
        password: "",
        confirm_password: "",
    })
    const [error, setError] = React.useState({
        password: "",
        confirm_password: "",
    });
    const handleOnChange = (text: string, input: string) => {
        setInputs((prevState) => ({ ...prevState, [input]: text.trim() }));
    };
    const handleError = (text: string | null, input: string) => {
        setError((prevState) => ({ ...prevState, [input]: text }));
    };

    // Check Textboxes
    const checkAuth = () =>{
        let isValid = false
        if(!inputs.confirm_password){
            handleError("Confirm Password is required", "confirm_password")
            isValid = false
        } else{
            handleError("", "confirm_password")

        }

        if (inputs.password.length < 8 || !/\d/.test(inputs.password)) {
            handleError("Password must be at least 8 characters and contain a number", "password");
            isValid = false;
        }
        else if(inputs.password != inputs.confirm_password){
            handleError("Password does not match", "confirm_password")
            isValid = false
        } else{
            handleError("", "confirm_password")
            isValid = true
        }

        return isValid;
    }

    const [backAlert, setBackAlert] = React.useState({
        visible: false,
        message: "Are you sure you want to go back?",
        icon: "help",
        iconColor: "danger"
    });

        // HARDWARE BACK
    useFocusEffect(
        React.useCallback(() => {
            const onBackPress = () => {
                setBackAlert(prev => ({ ...prev, visible: true }));
                return true; // Prevents default back action
            };

            BackHandler.addEventListener('hardwareBackPress', onBackPress);

            return () => {
                BackHandler.removeEventListener('hardwareBackPress', onBackPress);
            };
        }, [])
    );

    // Handle back alert responses
    const handleBackConfirm = () => {
        setBackAlert(prev => ({ ...prev, visible: false }));
        router.back(); // Navigate back
    };

    const handleBackCancel = () => {
        setBackAlert(prev => ({ ...prev, visible: false }));
    };


    const [resetAlert, setResetAlert] = React.useState({
        visible: false,
        message: "",
        icon: "",
        iconColor: ""
    });

    // Add this function to handle reset password results
    const handleResetPassword = async () => {
        if (checkAuth()) {
            try {
                // Simulate API call
                const success = true; // Replace with actual API response
                
                if (success) {
                    setResetAlert({
                        visible: true,
                        message: "Password has been successfully reset! You can now login with your new password.",
                        icon: "checkmark-circle",
                        iconColor: "success"
                    });
                } else {
                    setResetAlert({
                        visible: true,
                        message: "Failed to reset password. Please try again later.",
                        icon: "close-circle",
                        iconColor: "danger"
                    });
                }
            } catch (error) {
                setResetAlert({
                    visible: true,
                    message: "An error occurred while resetting your password. Please try again.",
                    icon: "alert-circle",
                    iconColor: "danger"
                });
            }
        }
    };

    // Add this handler for closing the alert
    const handleResetAlert = () => {
        setResetAlert(prev => ({ ...prev, visible: false }));
        if (resetAlert.iconColor === "success") {
            router.replace("./login"); // Navigate to login on success
        }
    };

    return(
        <GestureHandlerRootView style={{ flex: 1 }}>
            <KeyboardAvoidingView style={{ flex: 1 }}>
                <SafeAreaView style={[style.container, {backgroundColor: colorScheme === 'dark' ? '#151718' : '#ffffff'}] }>
                    <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                    <View style={style.top}>
                        <View style={style.logocontainer}>
                            <Image source={AppIcon} style={style.logo}/>
                        </View>
                    </View>
                    <View style={style.middle}>
                        <View style={style.msg}>
                            <ThemedText type="fade">
                                Create your new password to login into your SHAFT account.
                            </ThemedText>
                        </View>
                        <View style={style.form}>
                            <View style={style.input}>
                                <Input label="Password" iconName='key-outline' password onChangeText={(text) => handleOnChange(text, "password")} error={error.password}/>
                            </View>
                            <View style={style.input}>
                                <Input label="Confirm Password" iconName='key-outline' password onChangeText={(text) => handleOnChange(text, "confirm_password")} error={error.confirm_password}/>
                            </View>
                        </View>
                        <View style={style.btn}>
                            <Button title="Reset Password" onPress={handleResetPassword}/>
                        </View>
                    </View>
                    </ScrollView>
                    <AlertModal
                        visible={resetAlert.visible}
                        onConfirm={handleResetAlert}
                        message={resetAlert.message}
                        icon={resetAlert.icon}
                        iconColor={resetAlert.iconColor}
                    />

                    <AlertChooseModal
                        visible={backAlert.visible}
                        onConfirm={handleBackConfirm}
                        onCancel={handleBackCancel}
                        message={backAlert.message}
                        icon={backAlert.icon}
                        iconColor={backAlert.iconColor}
                    />
                </SafeAreaView>
            </KeyboardAvoidingView>
        </GestureHandlerRootView>
    )
}

const style = StyleSheet.create({
    container:{
        paddingHorizontal: 20,
        flex: 1,
        alignContent: "center",
    },
    top:{
        marginTop: 5,
    },
    logocontainer:{
        flexDirection: "column",
        justifyContent: "center",
        alignContent: "center",
        alignItems: "center"
    },
    logo:{
        height: 175,
        width: 175,
    },
    title:{
        margin: 10,
        alignContent: "center",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center"
    },
    middle:{
        flexDirection: "column",
        justifyContent: "center",
        alignContent: "center",
        marginTop: 20,
    },
    form:{
        marginVertical: 10,
    },
    input:{
        justifyContent: "center",
        alignItems: "center",
        marginVertical: 13,
    },
    msg:{
        marginVertical: 15,
        marginHorizontal: 10,
        justifyContent: "flex-start",
        flexDirection: "row",
        alignContent: "center",
    },
    btn:{
        justifyContent: "center",
        alignItems: "center",
        marginVertical: 10,
    },

});

export default ResetPassword;