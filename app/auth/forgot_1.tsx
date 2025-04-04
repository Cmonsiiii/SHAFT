import * as React from 'react';
import { TouchableOpacity, View, Text, Image, StyleSheet, BackHandler, KeyboardAvoidingView, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/utils/components/themeUI/ThemedText';
import Input from '@/utils/components/textbox/input';
import Button from '@/utils/components/buttons/button';
import OTPInput from '@/utils/components/textbox/otpInput';
import OTPButton from '@/utils/components/buttons/otpbutton';
import AlertModal from '@/utils/components/modals/Alert';
import { useFocusEffect } from '@react-navigation/native';
import AlertChooseModal from '@/utils/components/modals/AlertChoose';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const AppIcon = require("@/assets/images/shaft_logo.png")

const ForgotPassword = () =>{

    const router = useRouter();
    const colorScheme = useColorScheme();

    const [inputs, setInputs] = React.useState({
        email: "",
        otp_code: "",
    })
    
    const [error, setError] = React.useState({
        email: "",
        otp_code: "",
    });

    const handleOnChange = (text: string, input: string) => {
        setInputs((prevState) => ({ ...prevState, [input]: text.trim() }));
    };

    const handleError = (text: string | null, input: string) => {
        setError((prevState) => ({ ...prevState, [input]: text }));
    };

    const [otpBtnTxt, setOTPBtnTxt] = React.useState("Send Code"); // OTP BUTTON TEXT
    const [otpBtn, setOTPBtn] = React.useState(false); // ENABLE OR DISABLE BUTTON

    const [otpAlert, setOTPAlert] = React.useState({
        visible: false,
        message: "",
        icon: "checkmark-circle",
        iconColor: "success"
    });

    const [verificationAlert, setVerificationAlert] = React.useState({
        visible: false,
        message: "",
        icon: "checkmark-circle",
        iconColor: "success"
    });

    const OTPCodeBtn = () =>{
        let countdown = 60;
        setOTPBtn(true);

        const interval = setInterval(() => {
            if (countdown > 0) {
                setOTPBtnTxt(`Resend in ${countdown}s`);
                countdown -= 1;
            } else {
                clearInterval(interval);
                setOTPBtnTxt("Send Code");
                setOTPBtn(false);
            }
        }, 1000);
    }

    const sendCode = async () => {
        if (!inputs.email) {
            handleError("Email is required", "email");
            return;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inputs.email)) {
            handleError("Enter a valid email address", "email");
            return;
        }

        handleError("", "email");
        
        try {
            // Simulate API call to check email existence and send code
            const emailExists = true; // Replace with actual API call
            
            if (!emailExists) {
                setOTPAlert({
                    visible: true,
                    message: "Email address not found. Please check your email.",
                    icon: "close-circle",
                    iconColor: "danger"
                });
            } else {
                setOTPAlert({
                    visible: true,
                    message: "Verification code has been sent to your email",
                    icon: "checkmark-circle",
                    iconColor: "success"
                });
            }
        } catch (error) {
            setOTPAlert({
                visible: true,
                message: "Failed to send verification code. Please try again.",
                icon: "alert-circle",
                iconColor: "danger"
            });
        }
    };

    // Handle OTP alert confirmation
    const handleOTPAlert = () => {
        setOTPAlert(prev => ({ ...prev, visible: false }));
        if (otpAlert.iconColor === "success") {
            OTPCodeBtn(); // Start countdown only if code was sent successfully
        }
    };

    const verifyEmail = async () => {
        if (!inputs.email || !inputs.otp_code) {
            if (!inputs.email) handleError("Email is required", "email");
            if (!inputs.otp_code) handleError("OTP code is required", "otp_code");
            return;
        }

        try {
            // Simulate API call to verify OTP
            const isVerified = true; // Replace with actual API call
            
            if (isVerified) {
                setVerificationAlert({
                    visible: true,
                    message: "Email verified successfully!",
                    icon: "checkmark-circle",
                    iconColor: "success"
                });
            } else {
                setVerificationAlert({
                    visible: true,
                    message: "Invalid verification code. Please try again.",
                    icon: "close-circle",
                    iconColor: "danger"
                });
            }
        } catch (error) {
            setVerificationAlert({
                visible: true,
                message: "Verification failed. Please try again later.",
                icon: "alert-circle",
                iconColor: "danger"
            });
        }
    };

     // Handle verification alert confirmation
    const handleVerificationAlert = () => {
        setVerificationAlert(prev => ({ ...prev, visible: false }));
        if (verificationAlert.iconColor === "success") {
            router.replace('./forgot_2');
        }
    };

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

    return(
         <GestureHandlerRootView style={{ flex: 1 }}>
            <KeyboardAvoidingView style={{ flex: 1 }}>
                <SafeAreaView style={[style.container, {backgroundColor: colorScheme === 'dark' ? '#151718' : '#F6F6F6'}] }>
                    <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                    <View style={style.top}>

                        <View style={style.logocontainer}>
                            <Image source={AppIcon} style={style.logo}/>
                        </View>

                    </View>
                    <View style={style.middle}>
                        <View style={style.msg}>
                            <ThemedText type="fade">
                                Please enter your email address associated in your account and we'll send an email verification to reset your password.
                            </ThemedText>
                        </View>
                        <View style={style.form}>
                            <View style={style.input}>
                                <Input label="Email Address" iconName='mail-outline' onChangeText={(text) => handleOnChange(text, "email")} error={error.email}/>
                            </View>
                            <View style={style.otp}>
                                <OTPInput label="OTP Code" iconName='keypad-outline' onChangeText={(text) => handleOnChange(text, "otp_code")} error={error.otp_code}/>
                                <OTPButton title={otpBtnTxt} onPress={sendCode} disabled={otpBtn}/>
                            </View>
                        </View>

                        <View style={style.btn}>
                            <Button title="Verify Email Address" onPress={verifyEmail}/>
                        </View>
                    
                    </View>
                    </ScrollView>
                    <AlertModal
                        visible={otpAlert.visible}
                        onConfirm={handleOTPAlert}
                        message={otpAlert.message}
                        icon={otpAlert.icon}
                        iconColor={otpAlert.iconColor}
                    />
                    <AlertModal
                        visible={verificationAlert.visible}
                        onConfirm={handleVerificationAlert}
                        message={verificationAlert.message}
                        icon={verificationAlert.icon}
                        iconColor={verificationAlert.iconColor}
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
    otp:{
        flexDirection: "row",
        marginVertical: 13, // Same as the input margin
        justifyContent: "space-evenly"
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

export default ForgotPassword;