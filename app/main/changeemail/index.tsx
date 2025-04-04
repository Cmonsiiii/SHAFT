import * as React from 'react';
import { TouchableOpacity, View, Text, Image, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/utils/components/themeUI/ThemedText';

import Button from '@/utils/components/buttons/button';
import OTPInputLong from '@/utils/components/textbox/OTPInputlong';
import OTPInput from '@/utils/components/textbox/otpInput';
import OTPButton from '@/utils/components/buttons/otpbutton';
import AlertModal from '@/utils/components/modals/Alert';

interface AlertState {
    visible: boolean;
    message: string;
    icon: string;
    iconColor: string;
}

const AppIcon = require("@/assets/images/shaft_logo.png")

const VerifyEmail = () =>{

    const router = useRouter();
    const colorScheme = useColorScheme();
    
    const [inputs, setInputs] = React.useState({
        OTPCode: "",
    });

    const [error, setError] = React.useState({
        OTPCode: "",
    });

    const [otpModalAlert, setotpModalAlert] = React.useState(false);
    const [otpBtnTxt, setOTPBtnTxt] = React.useState("Send Code");
    const [otpBtn, setOTPBtn] = React.useState(false);
    
    const [otpAlert, setOTPAlert] = React.useState<AlertState>({
        visible: false,
        message: "",
        icon: "checkmark-circle",
        iconColor: "success"
    });

    const [verificationAlert, setVerificationAlert] = React.useState<AlertState>({
        visible: false,
        message: "",
        icon: "checkmark-circle",
        iconColor: "success"
    });

    const handleOnChange = (text: string, input: string) => {
        setInputs((prevState) => ({ ...prevState, [input]: text.trim() }));
    };

    const handleError = (text: string | null, input: string) => {
        setError((prevState) => ({ ...prevState, [input]: text }));
    };

    const OTPCodeBtn = () => {
        let countdown = 60;
        setotpModalAlert(false);
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
    };

    const sendCode = async () => {
        try {
            // // Simulate API call to send OTP
            // const response = await fetch('YOUR_API_ENDPOINT/send-otp', {
            //     method: 'POST',
            //     // Add your API configuration here
            // });

            // if (!response.ok) {
            //     throw new Error('Network response was not ok');
            // }

            setOTPAlert({
                visible: true,
                message: "The One-Time Pin code has been sent to your email",
                icon: "checkmark-circle",
                iconColor: "success"
            });
        } catch (error) {
            setOTPAlert({
                visible: true,
                message: "Unable to send verification code. Please check your connection and try again.",
                icon: "alert-circle",
                iconColor: "danger"
            });
        }
    };

    const verifyOTPCode = async () => {
        try {
            // // Add your OTP verification API call here
            // const response = await fetch('YOUR_API_ENDPOINT/verify-otp', {
            //     method: 'POST',
            //     // Add your API configuration here
            // });

            // if (!response.ok) {
            //     throw new Error('Invalid OTP');
            // }

            setVerificationAlert({
                visible: true,
                message: "OTP verification successful",
                icon: "checkmark-circle",
                iconColor: "success"
            });
        } catch (error) {
            setVerificationAlert({
                visible: true,
                message: "Invalid OTP code. Please try again.",
                icon: "close-circle",
                iconColor: "danger"
            });
        }
    };

    const handleOTPAlert = () => {
        setOTPAlert(prev => ({ ...prev, visible: false }));
        if (otpAlert.iconColor === "success") {
            OTPCodeBtn();
        }
    };

    const handleVerificationAlert = () => {
        setVerificationAlert(prev => ({ ...prev, visible: false }));
        if (verificationAlert.iconColor === "success") {
            router.replace("./changeEmail");
        }
    };

    const Validate = () => {
        if (!inputs.OTPCode) {
            handleError("Please enter the OTP code", "OTPCode");
            return;
        }
        
        if (inputs.OTPCode.length !== 6) {
            handleError("Please enter a valid 6-digit OTP code", "OTPCode");
            return;
        }

        handleError("", "OTPCode");
        verifyOTPCode();
    };

    return(
        <SafeAreaView style={[style.container, {backgroundColor: colorScheme === 'dark' ? '#151718' : '#F6F6F6'}] }>
            <View style={style.top}>

                <View style={style.logocontainer}>
                    <Image source={AppIcon} style={style.logo}/>
                </View>

            </View>
            <View style={style.middle}>
                <View style={style.msg}>
                    <ThemedText type="fade">
                        To update your email address in your account, you need to verify your identity first. Click "Send Verification Code" to receive a One-Time PIN password at your email.
                    </ThemedText>
                </View>
                <View style={style.form}>
                    <View style={style.otp}>
                        <OTPInput label="OTP Code" iconName='keypad-outline' onChangeText={(text) => handleOnChange(text, "OTPCode")} error={error.OTPCode}/>
                        <OTPButton title={otpBtnTxt} onPress={sendCode} disabled={otpBtn} type='secondary'/>
                    </View>
                </View>

                <View style={style.btn}>
                    <Button title="Verify Email Address" onPress={Validate}/>
                </View>
            
            </View>
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
        </SafeAreaView>
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
    otp:{
        flexDirection: "row",
        marginVertical: 13, // Same as the input margin
        justifyContent: "space-evenly"
    },
    form:{
        marginVertical: 10,
    },
    input:{
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 10,
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
    pinCodeContainer:{
        borderColor: "#808080",
        width: 50,
        height: 50,
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        alignContent: "center"
    },
    activePinCodeContainer:{
        borderColor: '#3377DC'
    },
    forgotlink:{
        marginTop: 3,
        marginHorizontal: 10,
        justifyContent: "flex-start",
        flexDirection: "row",
        alignContent: "center",
    },
});

export default VerifyEmail;