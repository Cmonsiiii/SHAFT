import * as React from 'react';
import { SafeAreaView, View, Text, Image, StyleSheet, KeyboardAvoidingView, ScrollView } from 'react-native';
import { useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/utils/components/themeUI/ThemedText';
import Button from '@/utils/components/buttons/button';
import Input from '@/utils/components/textbox/input';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AlertModal from '@/utils/components/modals/Alert';
import AlertChooseModal from '@/utils/components/modals/AlertChoose';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firebaseService, { Profile } from '@/utils/code/server/firebaseServices';

const SignUp_P2 = () =>{

    const router = useRouter();
    const colorScheme = useColorScheme();
    
    const [temporaryProfileData, setTemporaryProfileData] = React.useState<{
        first_name: string;
        middle_name?: string;
        last_name: string;
        gender: string;
        birthdate: { day: number; month: number; year: number };
    } | null>(null);

    React.useEffect(() => {
        const loadTemporaryData = async () => {
            try {
                const storedData = await AsyncStorage.getItem('TEMPORARY_PROFILE_DATA');
                if (storedData) {
                    setTemporaryProfileData(JSON.parse(storedData));
                }
            } catch (error) {
                console.error('Error loading temporary profile data:', error);
            }
        };

        loadTemporaryData();
    }, []);

    //Inputs handler
    const [inputs, setInputs] = React.useState({
        username: "",
        password: "",
        confirm_password: "",
        email: "",
    })
    
    const [error, setError] = React.useState({
        username: "",
        password: "",
        confirm_password: "",
        email: "",
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
        
        if(!inputs.username){
            handleError("Username is required!", "username")
            isValid = false
        } else{
            handleError("", "username")
        }

        if(!inputs.password){
            handleError("Password is required", "password")
            isValid = false
        } else{
            handleError("", "password")
        }

        if(!inputs.confirm_password){
            handleError("Confirm Password is required", "confirm_password")
            isValid = false
        } else{
            handleError("", "confirm_password")

        }


        if(!inputs.email){
            handleError("Enail is required", "email")
            isValid = false
        }  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inputs.email)) {
            handleError("Enter a valid email address", "email");
            isValid = false;
        } else{
            handleError("", "email")
        }

        if (inputs.password.length < 8) {
            handleError("Password must be at least 8 characters", "password");
            isValid = false;
        } else if(!/\d/.test(inputs.password)) {
            handleError("Password must be contain a number", "password");
        } else if(!/[!@#$%^&*(),.?":{}|<>]/.test(inputs.password)) {
            handleError("Password must be contain a special character", "password");
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


    const [confirmationAlert, setConfirmationAlert] = React.useState({
        visible: false,
        message: "Are you sure all the details are correct?",
        icon: "help",
        iconColor: "danger"
    });

    const [resultAlert, setResultAlert] = React.useState({
        visible: false,
        message: "",
        icon: "",
        iconColor: ""
    });

    // Modified Validate function to show confirmation alert
    const Validate = () => {
        const isValid = checkAuth();
        if (isValid) {
            setConfirmationAlert(prev => ({ ...prev, visible: true }));
        }
    };

    // Handle confirmation alert responses
    const handleConfirmation = async () => {
        setConfirmationAlert(prev => ({ ...prev, visible: false }));
        
        try {
            // Simulate API call for account creation
            const accountCreated = true; // Replace with actual API call
            const profileData: Profile = {
                first_name: temporaryProfileData.first_name,
                middle_name: temporaryProfileData.middle_name || '',
                last_name: temporaryProfileData.last_name,
                gender: temporaryProfileData.gender,
                birthdate: {
                    day: temporaryProfileData.birthdate.day.toString(),
                    month: temporaryProfileData.birthdate.month.toString(),
                    year: temporaryProfileData.birthdate.year.toString()
                },
                notifications:{
                    hours: 0,
                    minutes: 0,
                }
            };

            const userId = await firebaseService.registerUser(
                inputs.email, 
                inputs.password, 
                inputs.username, 
                profileData
            );

            await AsyncStorage.removeItem('TEMPORARY_PROFILE_DATA');

            
            setResultAlert({
                visible: true,
                message: "Account created successfully!",
                icon: "checkmark-circle",
                iconColor: "success"
            });
        } catch (error: any) {
            setResultAlert({
                visible: true,
                message: "An error occurred. Please try again later. " + (error.message || ""),
                icon: "alert-circle",
                iconColor: "danger"
            });
        }
    };

    const handleConfirmationCancel = () => {
        setConfirmationAlert(prev => ({ ...prev, visible: false }));
    };

    // Handle final result alert
    const handleResultAlert = () => {
        setResultAlert(prev => ({ ...prev, visible: false }));
        if (resultAlert.iconColor === "success") {
            router.navigate("./login"); // Navigate to login on success
        }
    };


    return(
        <GestureHandlerRootView style={{ flex: 1 }}>
            <KeyboardAvoidingView style={{ flex: 1 }}>
                <SafeAreaView style={[style.container, {backgroundColor: colorScheme === 'dark' ? '#151718' : '#f6f6f6'}] }>
                    <ScrollView style={{flex: 1}} contentContainerStyle={{ flexGrow: 1 }}  showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                        <View style={style.top}>
                            <ThemedText type='title'>Account Setup</ThemedText>
                            <ThemedText type='fade'>Enter your account details and we will verify your email to finish setting up your account</ThemedText>
                        </View>
                        <View style={style.middle}>
                            <View style={style.form}>
                                <View style={style.input}>
                                    <Input label="Username" iconName='person-outline' onChangeText={(text) => handleOnChange(text, "username")} error={error.username}/>
                                </View>
                                <View style={style.input}>
                                    <Input label="Password" iconName='key-outline' password onChangeText={(text) => handleOnChange(text, "password")} error={error.password}/>
                                </View>

                                <View style={style.input}>
                                    <Input label="Confirm Password" iconName='key-outline' password onChangeText={(text) => handleOnChange(text, "confirm_password")} error={error.confirm_password}/>
                                </View>

                                <View style={style.input}>
                                    <Input label="Email Address" iconName='mail-outline' onChangeText={(text) => handleOnChange(text, "email")} error={error.email}/>
                                </View>
                            </View>

                            <View style={style.btn}>
                                <Button title="Create Account" onPress={Validate}/>
                            </View>
                        </View>
                    </ScrollView>
                </SafeAreaView>
            </KeyboardAvoidingView>
            <AlertChooseModal
                visible={confirmationAlert.visible}
                onConfirm={handleConfirmation}
                onCancel={handleConfirmationCancel}
                message={confirmationAlert.message}
                icon={confirmationAlert.icon}
                iconColor={confirmationAlert.iconColor}
            />
            <AlertModal
                visible={resultAlert.visible}
                onConfirm={handleResultAlert}
                message={resultAlert.message}
                icon={resultAlert.icon}
                iconColor={resultAlert.iconColor}
            />
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
        paddingHorizontal: 10,
        marginBottom: 10,
        marginTop: 25,
    },
    back:{
        marginVertical: 20,
        left: 0,
        flexDirection: "row"
    },
    backBtn:{
        justifyContent: "center",
        alignContent: "center"
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
    otp:{
        flexDirection: "row",
        marginVertical: 13, // Same as the input margin
        justifyContent: "space-evenly"
    },
    otpIn:{
        
    },
    forgotlink:{
        marginTop: 3,
        marginBottom: 15,
        marginHorizontal: 10,
        justifyContent: "flex-start",
        flexDirection: "row",
        alignContent: "center",
    },
    btn:{
        justifyContent: "center",
        alignItems: "center",
        marginTop: 10,
        marginBottom: 20,
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 30,
        marginHorizontal: 10,
    },
    divider: {
        flex: 1,
        height: 1,
        backgroundColor: '#B3B4BA',
    },
    dividerText: {
        marginHorizontal: 10,
        color: '#B3B4BA',
        fontFamily: "CeraPro"
    },
    create:{
        flexDirection: "row",
        justifyContent: "center",
        alignContent: "center",
        alignItems: "center"
    },

    createAccountText: {
        color: '#277CA5',
        textDecorationLine: 'underline',
        fontFamily: "CeraPro"
    },

});

export default SignUp_P2;