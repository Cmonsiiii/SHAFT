import * as React from 'react';
import { TouchableOpacity, View, Text, Image, StyleSheet, BackHandler, KeyboardAvoidingView, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/utils/components/themeUI/ThemedText';

import Button from '@/utils/components/buttons/button';
import Input from '@/utils/components/textbox/input';
import AlertChooseModal from '@/utils/components/modals/AlertChoose';
import { useFocusEffect } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AlertModal from '@/utils/components/modals/Alert';

const AppIcon = require("@/assets/images/shaft_logo.png")

const ChangePassword = () =>{

    const router = useRouter();
    const colorScheme = useColorScheme();

    const [backAlert, setBackAlert] = React.useState({
        visible: false,
        message: "Are you sure you want to go back?",
        icon: "help",
        iconColor: "danger"
    });
    

    const [resetAlert, setResetAlert] = React.useState({
        visible: false,
        message: "",
        icon: "",
        iconColor: ""
    });

    // Handle back alert responses
    const handleBackConfirm = () => {
        setBackAlert(prev => ({ ...prev, visible: false }));
        router.back(); // Navigate back
    };

    const handleBackCancel = () => {
        setBackAlert(prev => ({ ...prev, visible: false }));
    };
    
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


    const handleOnChange = (text: string) => {
        setInput(prevState => ({ ...prevState, username: text.trim() }));
        // Clear error when user starts typing
        setError(prevState => ({ ...prevState, username: "" }));
    };

    // Handle error
    const handleError = (text: string | null) => {
        setError((prevState: any) => ({ ...prevState, username: text }));
    };
    
     // Input state
    const [input, setInput] = React.useState({
        username: ""
    });

    // Error state
    const [error, setError] = React.useState({
        username: ""
    });

    const validateUsername = (username: string): boolean => {
        // Username should be at least 3 characters long
        if (username.length < 3) {
            handleError("Username must be at least 3 characters long");
            return false;
        }

        // Username should only contain letters, numbers, and underscores
        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            handleError("Username can only contain letters, numbers, and underscores");
            return false;
        }

        return true;
    };

    const checkAuth = (): boolean => {
        if (!input.username) {
            handleError("Username is required");
            return false;
        }

        return validateUsername(input.username);
    };

    const handleChangeUsername = async () => {
        if (checkAuth()) {
            //setIsLoading(true);
            try {
                // Simulate API call - replace with your actual API call
                const success = true;

                if (success) {
                    setResetAlert({
                        visible: true,
                        message: "Username has been successfully updated!",
                        icon: "checkmark-circle",
                        iconColor: "success"
                    });
                } else {
                    setResetAlert({
                        visible: true,
                        message: "Failed to update username. Please try again later.",
                        icon: "close-circle",
                        iconColor: "danger"
                    });
                }
            } catch (error) {
                setResetAlert({
                    visible: true,
                    message: "An error occurred while updating your username. Please try again.",
                    icon: "alert-circle",
                    iconColor: "danger"
                });
            } finally {
                // LOADING
            }
        }
    };

    // Handle after success response
    const handleResetAlert = () => {
        setResetAlert(prev => ({ ...prev, visible: false }));
        if (resetAlert.iconColor === "success") {
            router.replace("../tabs/");
        }
    };

    return(
        <GestureHandlerRootView  style={{ flex: 1 }}>
            <KeyboardAvoidingView style={{ flex: 1 }}>
                <SafeAreaView style={[style.container, {backgroundColor: colorScheme === 'dark' ? '#151718' : '#F6F6F6'}] }>
                    <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                    <View style={style.top}>
                        <View style={style.logocontainer}>
                            <Image source={AppIcon} style={style.logo}/>
                        </View>
                    </View>
                    <View style={style.middle}>
                        <View style={style.msg}>
                            <ThemedText type="fade">
                            Please enter your new username. We recommend choosing a unique username that is easy to remember.
                            </ThemedText>
                        </View>
                        <View style={style.form}>
                            <View style={style.input}>
                                <Input label="New Username" iconName='person-outline' onChangeText={handleOnChange} error={error.username} returnKeyType="done"/>
                            </View>
                        </View>

                        <View style={style.btn}>
                            <Button title="Update New Username" onPress={handleChangeUsername}/>
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

export default ChangePassword;