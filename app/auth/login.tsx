import * as React from 'react';
import { TouchableOpacity, View, Text, Image, StyleSheet, Alert, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';

import Button from '@/utils/components/buttons/button';
import Input from '@/utils/components/textbox/input';

import { ref, get, child, onValue, set } from 'firebase/database';
import { database } from '@/constants/firebase';
import { GestureHandlerRootView, ScrollView } from 'react-native-gesture-handler';
import { ThemedText } from '@/utils/components/themeUI/ThemedText';
import AlertModal from '@/utils/components/modals/Alert';
import firebaseService from '@/utils/code/server/firebaseServices';
import { UserStorage } from '@/utils/code/async/saveInfo';
import CryptoJS from "crypto-js";

const AppIcon = require("@/assets/images/shaft_logo.png")

const LoginScreen = () =>{
    
    const router = useRouter();
    const colorScheme = useColorScheme();

    //input behaviors
    const [inputs, setInputs] = React.useState({ username: "", password: "" });
    const [errors, setErrors] = React.useState({ username: "", password: "" });
    const handleOnChange = (text: string, input: string) => {
        setInputs((prevState) => ({ ...prevState, [input]: text.trim() }));
    };
    const handleError = (text: string | null, input: string) => {
        setErrors((prevState) => ({ ...prevState, [input]: text }));
    };

    //validate components
    const CheckFields = async() => {
        let isValid = true

        if(!inputs.username){
            handleError("Username is required!", "username")
            isValid = false
        } else{
            handleError("", "username")
            isValid = true
        }

        if(!inputs.password){
            handleError("Password is required", "password")
            isValid = false
        } else{
            handleError("", "password")
            isValid = true
        }

        return isValid;
    }

    //reset inputs once logged in
    const LoginSuccess = () =>{
        setInputs({username: "", password: "",})
        router.replace("/main/tabs/")
    }

    // attempts
    const [attemptCount, setAttemptCount] = React.useState(0);
    const MAX_ATTEMPTS = 3;

    // Alert MODAL
    const [alertModal, setAlertModal] = React.useState(false);
    const [alertIcon, setAlertIcon] = React.useState<any>("");
    const [alertMsg, setAlertMsg] = React.useState("");
    const [alertIconColor, setAlertIconColor] = React.useState("");

    // Modal Behavior
    const [isLoginSuccessful, setIsLoginSuccessful] = React.useState(false);

    const handleAlertClose = () => {
        setAlertModal(false);
        if (isLoginSuccessful) {
            LoginSuccess();
            setAttemptCount(0);
        }
    }

        // Helper function to handle login errors
    const handleLoginError = (message: string) => {
        const newAttemptCount = attemptCount + 1;
        setAttemptCount(newAttemptCount);
        
        if (newAttemptCount >= MAX_ATTEMPTS) {
            setBtnDisable(true);
            setAlertIcon("alert-circle");
            setAlertMsg(`Maximum attempts reached. Please try again after 30 seconds.`);
            setAlertIconColor("danger");
        } else {
            setAlertIcon("alert-circle");
            setAlertMsg(`${message}. ${MAX_ATTEMPTS - newAttemptCount} attempts remaining`);
            setAlertIconColor("danger");
        }
        setAlertModal(true);
        setIsLoginSuccessful(false);
    };

    //validate from server
    const Validation = async () => {
        const isValid = await CheckFields();

        if (isValid) {
            try {
                const usersRef = ref(database, 'Users');
                const snapshot = await get(usersRef);

                if (!snapshot.exists()) {
                    handleLoginError("User not found");
                    return;
                }

                const usersData = snapshot.val();
                let foundUser = null;

                // Find user by username
                for (const key in usersData) {
                    if (usersData[key].username === inputs.username) {
                        foundUser = usersData[key];
                        break;
                    }
                }

                if (!foundUser) {
                    handleLoginError("User not found");
                    return;
                }

                // Decrypt stored password
                const hashedInputPassword = CryptoJS.SHA256(inputs.password).toString(CryptoJS.enc.Hex);
                if (foundUser.password !== hashedInputPassword) {
                    handleLoginError("Incorrect password");
                    return;
                }

                try {
                    const userCredential = await firebaseService.signIn(foundUser.email, inputs.password);

                    if (userCredential) {
                        const userDataToStore = {
                            username: foundUser.username,
                            email: foundUser.email,
                            firstName: foundUser.profile?.first_name || '',
                            lastName: foundUser.profile?.last_name || '',
                            middleName: foundUser.profile?.middle_name || '',
                            gender: foundUser.profile?.gender || '',
                            birthdate: foundUser.profile?.birthdate || { day: 0, month: 0, year: 0 },
                        };

                        await UserStorage.saveUserData(userDataToStore);

                        setAlertIcon("checkmark-circle");
                        setAlertMsg("Log in successfully");
                        setAlertIconColor("success");
                        setAlertModal(true);
                        setIsLoginSuccessful(true);
                    }
                } catch (authError: any) {
                    handleLoginError("Error! " + (authError.message || ""));
                }
            } catch (error: any) {
                console.error("Login error:", error);
                handleLoginError("An error occurred while logging in. " + (error.message || ""));
            }
        } else {
            const newAttemptCount = attemptCount + 1;
            setAttemptCount(newAttemptCount);

            if (newAttemptCount >= MAX_ATTEMPTS) {
                setBtnDisable(true);
                setAlertIcon("alert-circle");
                setAlertMsg("Maximum attempts reached. Please try again after 30 seconds.");
                setAlertIconColor("danger");
            } else {
                setAlertIcon("alert-circle");
                setAlertMsg(`Incorrect username or password. ${MAX_ATTEMPTS - newAttemptCount} attempts remaining`);
                setAlertIconColor("danger");
            }
            setAlertModal(true);
            setIsLoginSuccessful(false);
        }
    };
    

    // timers
    const [btnDisable, setBtnDisable] = React.useState(false);
    const [timeLeft, setTimeLeft] = React.useState(30);
    React.useEffect(() => {
        let timer: string | number | NodeJS.Timeout | undefined;
        if (btnDisable && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setBtnDisable(false);
            setTimeLeft(30);
            setAttemptCount(0);  // Reset attempt count
        }
        return () => clearInterval(timer);
    }, [btnDisable, timeLeft]);

    return(
        <GestureHandlerRootView style={{ flex: 1 }}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <KeyboardAvoidingView style={{ flex: 1 }}>
                <SafeAreaView style={[style.container, {backgroundColor: colorScheme === 'dark' ? '#151718' : '#F6F6F6'}] }>
                    <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                        <View style={style.top}>
                            <View style={style.logocontainer}>
                                <Image source={AppIcon} style={style.logo}/>
                            </View>
                        </View>
                        <View style={style.middle}>
                            <View style={style.form}>
                                <View style={style.input}>
                                    <Input label="Username" iconName='person-outline'  onChangeText={(text) => handleOnChange(text, "username")} error={errors.username}/>
                                </View>
                                <View style={style.input}>
                                    <Input label="Password" iconName='key-outline' password onChangeText={(text) => handleOnChange(text, "password")} error={errors.password}/>
                                </View>
                            </View>
                            {/* <View style={style.forgotlink}>
                                <TouchableOpacity onPress={() => {router.replace("./forgot_1")}}>
                                    <ThemedText style={{color: "#277CA5", fontSize: 14,}}>Forgot Password?</ThemedText>
                                </TouchableOpacity>
                            </View> */}

                            <View style={style.btn}>
                                <Button title={btnDisable ? `Try again in ${timeLeft}s` : "Login"} onPress={Validation} disabled={btnDisable}/>
                            </View>

                            <View style={style.dividerContainer}>
                                <View style={style.divider} />
                                <Text style={style.dividerText}>OR</Text>
                                <View style={style.divider} />
                            </View>

                            <View style={style.create}>
                                <ThemedText>Don't have an account? </ThemedText>
                                    <TouchableOpacity onPress={() => router.replace("/auth/signup_1")}>
                                        <ThemedText type='fade' style={style.createAccountText}>Sign Up</ThemedText>
                                    </TouchableOpacity>
                            </View>

                        </View>
                    </ScrollView>

                    {/* ALERT MODALS / SNACKBARS */}

                    <AlertModal visible={alertModal} onConfirm={handleAlertClose} icon={alertIcon} iconColor={alertIconColor} message={alertMsg}/>
                </SafeAreaView>
            </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
        </GestureHandlerRootView>
    )
}

const style = StyleSheet.create({
    container:{
        paddingHorizontal: 20,
        paddingVertical: 25,
        flex: 1,
        alignContent: "center",
    },
    top:{
        marginTop: 40,
        marginBottom: 10,
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
        marginTop: 30,
    },
    form:{
        marginVertical: 10,
    },
    input:{
        justifyContent: "center",
        alignItems: "center",
        marginVertical: 13,
    },
    forgotlink:{
        marginTop: 3,
        marginBottom: 15,
        marginHorizontal: 10,
        justifyContent: "flex-start",
        flexDirection: "row",
        alignContent: "center",
        fontSize: 12,
    },
    btn:{
        justifyContent: "center",
        alignItems: "center",
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

export default LoginScreen;