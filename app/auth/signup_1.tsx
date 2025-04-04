import * as React from 'react';
import { TouchableOpacity, View, Text, Image, StyleSheet, KeyboardAvoidingView, ScrollView, SafeAreaView, Alert, BackHandler } from 'react-native';
import { useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/utils/components/themeUI/ThemedText';
import Button from '@/utils/components/buttons/button';
import Input from '@/utils/components/textbox/input';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Select from '@/utils/components/textbox/select';
import SelectBday from '@/utils/components/textbox/selectBday'; 
import AlertChooseModal from '@/utils/components/modals/AlertChoose';
import { useFocusEffect } from '@react-navigation/native';
import { UserStorage } from '@/utils/code/async/saveInfo';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SignUp = () =>{

    const router = useRouter();
    const colorScheme = useColorScheme();
    const [selectedGender, setSelectedGender] = React.useState("");
    const [birthDate, setBirthdate] = React.useState({ day: 0, month: 0, year: 0 });
    const gender = ([
        { label: 'Male', value: 'Male' },
        { label: 'Female', value: 'Female' },
    ]);

    const [inputs, setInputs] = React.useState({
        first_name: "",
        middle_name: "",
        last_name: "",
        gender: "",
        birthdate: birthDate,
    })

    const [error, setError] = React.useState({
        first_name: "",
        middle_name: "",
        last_name: "",
        gender: "",
        birthdate: "",
    });
    
    const handleOnChange = (text: string, input: string) => {
        setInputs((prevState) => ({ ...prevState, [input]: text.trim() }));
    };

    const handleError = (text: string | null, input: string) => {
        setError((prevState) => ({ ...prevState, [input]: text }));
    };


    const CheckFields = () => {
        let isValid = true
        if(!inputs.first_name){
            handleError("First name is required!", "first_name")
            isValid = false
        } else{
            handleError("", "first_name")
            isValid = true
        }

        if(!inputs.last_name){
            handleError("Last name is required", "last_name")
            isValid = false
        } else{
            handleError("", "last_name")
            isValid = true
        }

        if(!inputs.gender){
            handleError("Gender is required", "gender")
            isValid = false
        } else{
            handleError("", "gender")
            isValid = true

        }

        if(!inputs.birthdate || !inputs.birthdate.day || !inputs.birthdate.month || !inputs.birthdate.year) {
            handleError("Birth date is required", "birthdate")
            isValid = false;
        } else {
            const today = new Date();
            const selectedDate = new Date(inputs.birthdate.year, inputs.birthdate.month - 1, inputs.birthdate.day);
            
            if (selectedDate > today) {
                handleError("Birth date cannot be in the future", "birthdate")
                isValid = false;
            } else if (inputs.birthdate.year < 1900) {
                handleError("Please enter a valid birth year", "birthdate")
                isValid = false;
            } else {
                handleError("", "birthdate")
            }
        }

        return isValid;
    }


    const handleOnChangeGender = (value : string) => {
        setSelectedGender(value)
        setInputs((prevState) => ({ ...prevState, gender: String(value) }));
    };

    const handleBirthDate = (value : any) => {
        setBirthdate(value)
        setInputs((prevState) => ({ ...prevState, birthdate: value }));
    };


    // flow functions
    const Validate = async () =>{
        const isValid = await CheckFields();

        if(isValid){
            setAlertIcon("help");
            setAlertMsg("Are you sure you want to proceed?");
            setAlertIconColor("danger");
            setAlertModal(true);
        }
    }

    const [alertModal, setAlertModal] = React.useState(false);
    const [alertIcon, setAlertIcon] = React.useState<any>("");
    const [alertMsg, setAlertMsg] = React.useState("");
    const [alertIconColor, setAlertIconColor] = React.useState("");

    const handleAlertConfirm = async() => {
        setAlertModal(false);
        if (isBackAlert) {
            router.back();
        } else {
            
            await AsyncStorage.setItem(
                    'TEMPORARY_PROFILE_DATA', 
                    JSON.stringify(inputs)
                );
            router.replace("/auth/signup_2");
        }
        setIsBackAlert(false);
    };
    
    const handleAlertClose = () => {
        setAlertModal(false);
        setIsBackAlert(false);
    };
    
    const [isBackAlert, setIsBackAlert] = React.useState(false);


    useFocusEffect(
        React.useCallback(() => {
            const onBackPress = () => {
                setIsBackAlert(true);
                setAlertIcon("help");
                setAlertMsg("Are you sure you want to go back?");
                setAlertIconColor("danger");
                setAlertModal(true);
                return true; // Prevents default back action
            };

            BackHandler.addEventListener('hardwareBackPress', onBackPress);

            return () => {
                BackHandler.removeEventListener('hardwareBackPress', onBackPress);
            };
        }, [])
    );

    return(
        <GestureHandlerRootView style={{ flex: 1 }}>
            <KeyboardAvoidingView style={{ flex: 1 }}>
                <SafeAreaView style={[style.container, {backgroundColor: colorScheme === 'dark' ? '#151718' : '#f6f6f6'}] }>
                    <ScrollView style={{flex: 1}} contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

                        <View style={style.top}>
                            <ThemedText type='title'>Get Started</ThemedText>
                            <ThemedText type='fade'>Please fill out your personal info.</ThemedText>
                        </View>
                        <View style={style.middle}>
                            <View style={style.form}>
                                <View style={style.input}>
                                    <Input label="First Name" iconName='person-outline' onChangeText={(text) => handleOnChange(text, "first_name")} error={error.first_name}/>
                                </View>
                                <View style={style.input}>
                                    <Input label="Middle Name (Optional)" iconName='person-outline' onChangeText={(text) => handleOnChange(text, "middle_name")} />
                                </View>

                                <View style={style.input}>
                                    <Input label="Last Name" iconName='person-outline' onChangeText={(text) => handleOnChange(text, "last_name")} error={error.last_name}/>
                                </View>

                                <View style={style.input}>
                                    <Select iconName="male-female-outline" items={gender} label='Gender' value={selectedGender} setValue={handleOnChangeGender} error={error.gender}/>
                                </View>

                                <View style={style.input}>
                                    <SelectBday value={birthDate} setValue={(newDate) => handleBirthDate(newDate)} error={error.birthdate} />
                                </View>
                            </View>

                            <View style={style.btn}>
                                <Button title="Create an Account" onPress={Validate}/>
                            </View>
                        </View>
                    </ScrollView>
                        <AlertChooseModal visible={alertModal} icon={alertIcon} iconColor={alertIconColor} message={alertMsg} onConfirm={handleAlertConfirm} onCancel={handleAlertClose} />
                        
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
        alignContent: "center",
    },
    logocontainer:{
        flexDirection: "column",
        justifyContent: "center",
        alignContent: "center",
        alignItems: "center"
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
    },
    form:{

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
    },
    btn:{
        justifyContent: "center",
        alignItems: "center",
        marginTop: 20,
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

export default SignUp;