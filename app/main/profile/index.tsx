
import * as React from 'react';
import { TouchableOpacity, View, Text, Image, StyleSheet, BackHandler, Alert, KeyboardAvoidingView, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import Input from '@/utils/components/textbox/input';
import Button from '@/utils/components/buttons/button';
import SelectBday from '@/utils/components/textbox/selectBday';
import getData from '@/constants/getData';
import AsyncStorage from '@react-native-async-storage/async-storage';
import EditProfileModal from '@/utils/components/modals/choose';

import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { GestureHandlerRootView, ScrollView } from 'react-native-gesture-handler';
import { ThemedText } from '@/utils/components/themeUI/ThemedText';
import { secondaryColor } from '@/constants/Colors';
import Select from '@/utils/components/textbox/select';
import AlertChooseModal from '@/utils/components/modals/AlertChoose';
import AlertModal from '@/utils/components/modals/Alert';
import { UserStorage } from '@/utils/code/async/saveInfo';

interface AlertState {
    visible: boolean;
    message: string;
    icon: string;
    iconColor: string;
}

const Profile = () =>{

    //#region Initialize
    const colorScheme = useColorScheme();
    const navigation = useNavigation()
    const router = useRouter();

    const [userData, setUserData] = React.useState<any>(null);
    const [modalOpen, setModalOpen] = React.useState(false)
    const [profileImage, setProfileImage] = React.useState(null);

    const [selectedGender, setSelectedGender] = React.useState("");
    const [birthDate, setBirthdate] = React.useState({ day: 0, month: 0, year: 0 });
    const gender = ([
        { label: 'Male', value: 'Male' },
        { label: 'Female', value: 'Female' },
    ]);

    //#endregion

    //#region Input handlers
    const [inputs, setInputs] = React.useState<any>({
        firstName: "",
        middleName: "",
        lastName: "",
        phone: "",
        gender: "",
        birthdate: birthDate,
    });

    const [error, setError] = React.useState<any>({
        firstName: "",  
        middleName: "",
        lastName: "",
        phone: "",
        gender: "",
        birthdate: "",
    });

    const handleOnChange = (text: string, input: string) => {
        setInputs((prevState: any) => ({ ...prevState, [input]: text.trim() }));
    };

    const handleError = (text: string | null, input: string) => {
        setError((prevState: any) => ({ ...prevState, [input]: text }));
    };

    // #endregion

    //#region UI
    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <TouchableOpacity onPress={handleSavePress}>
                    <ThemedText style={{ color: secondaryColor }}>
                        SAVE
                    </ThemedText>
                </TouchableOpacity>
            )
        });
    }, [navigation, inputs]);

    //#endregion

    //#region alerts
    const [saveAlert, setSaveAlert] = React.useState<AlertState>({
        visible: false,
        message: "Are you sure you want to save these changes?",
        icon: "help",
        iconColor: "warning"
    });

    const [resultAlert, setResultAlert] = React.useState<AlertState>({
        visible: false,
        message: "",
        icon: "",
        iconColor: ""
    });
    //#endregion

    //#region modal functions
    const toggleModal = async() => {
        setModalOpen(!modalOpen)
    }
    
    const handleCamera = async() => {
        // const result = await launchCamera();
        // setProfileImage(result?.assets[0]?.uri)
    };

    const handleGallery = async() => {
        // const result = await launchImageLibrary();
        // setProfileImage(result?.assets[0]?.uri)
    };
    //#endregion

    const handleOnChangeGender = (value : string) => {
        setSelectedGender(value)
        setInputs((prevState : any) => ({ ...prevState, gender: String(value) }));
    };
    const handleBirthDate = (value : any) => {
        setBirthdate(value)
        setInputs((prevState : any) => ({ ...prevState, birthdate: value }));
    };

    // validations and auth
    const CheckFields = () => {
        let isValid = true
        if(!inputs.firstName){
            handleError("First name is required!", "firstName");
            isValid = false;
        } else {
            handleError("", "firstName");
        }

        if(!inputs.lastName){
            handleError("Last name is required", "lastName");
            isValid = false;
        } else {
            handleError("", "lastName");
        }

        if(!inputs.gender){
            handleError("Gender is required", "gender");
            isValid = false;
        } else {
            handleError("", "gender");
        }

        if(!inputs.birthdate || !inputs.birthdate.day || !inputs.birthdate.month || !inputs.birthdate.year) {
            handleError("Birth date is required", "birthdate");
            isValid = false;
        } else {
            const today = new Date();
            const selectedDate = new Date(inputs.birthdate.year, inputs.birthdate.month - 1, inputs.birthdate.day);
            
            if (selectedDate > today) {
                handleError("Birth date cannot be in the future", "birthdate");
                isValid = false;
            } else if (inputs.birthdate.year < 1900) {
                handleError("Please enter a valid birth year", "birthdate");
                isValid = false;
            } else {
                handleError("", "birthdate");
            }
        }

        return isValid;
    }

    const handleSavePress = () => {
        const isValid = CheckFields();
        if (isValid) {
            setSaveAlert(prev => ({ ...prev, visible: true }));
        }
    };

    const handleSaveConfirm = async () => {
        setSaveAlert(prev => ({ ...prev, visible: false }));
        try {
            // Add your API call or save logic here
            console.log('Inputs to save:', inputs);
            
            // If save is successful
            setResultAlert({
                visible: true,
                message: "Profile updated successfully!",
                icon: "checkmark-circle",
                iconColor: "success"
            });
        } catch (error) {
            // If save fails
            setResultAlert({
                visible: true,
                message: "Failed to update profile. Please try again.",
                icon: "close-circle",
                iconColor: "danger"
            });
        }
    };

    const handleSaveCancel = () => {
        setSaveAlert(prev => ({ ...prev, visible: false }));
    };

    const handleResultConfirm = () => {
        setResultAlert(prev => ({ ...prev, visible: false }));
        router.replace("/main/tabs/")
    };

    React.useEffect(() => {
        fetchUserData();
    }, []);
    
    const fetchUserData = async () => {
        try {
            const data = await UserStorage.getUserData();
            if (data) {
                setUserData(data);
                // Set the birthdate and gender from stored data
                setInputs({
                    firstName: data.firstName || "",
                    middleName: data.middleName || "",
                    lastName: data.lastName || "",
                   
                    gender: data.gender || "",
                    birthdate: data.birthdate || birthDate,
                });
                if (data.birthdate) {   
                    setBirthdate(data.birthdate);
                }
                if (data.gender) {
                    setSelectedGender(data.gender);
                }
            }

        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    };

    const AppIcon = require("@/assets/images/shaft_logo.png")

    return(
        <GestureHandlerRootView>
            <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colorScheme === 'dark' ? '#151718' : '#F6F6F6'}}>
                <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
                    <SafeAreaView style={[style.container, {backgroundColor: colorScheme === 'dark' ? '#151718' : '#F6F6F6'}] }>
                        <View style={style.profilegrp}>
                            <View style={style.profileContainer}>
                                <Image style={style.profile} source={AppIcon}/>
                                {/* <View style={style.btnContainer}>
                                    <TouchableOpacity style={style.iconBtn} onPress={() => {toggleModal()} }>
                                        <Ionicons name='pencil' style={style.icon} />
                                    </TouchableOpacity>
                                </View> */}
                            </View>
                        </View>
                        <View style={style.form}>

                            <View style={style.input}>
                                <Input 
                                    label="First Name" 
                                    iconName='people' 
                                    onChangeText={(text) => handleOnChange(text, "firstName")} 
                                    error={error.first_name}
                                    item={userData?.firstName}
                                    />
                            </View>
                            <View style={style.input}>
                                <Input 
                                    label="Middle Name" 
                                    iconName='people' 
                                    onChangeText={(text) => handleOnChange(text, "middleName")} 
                                    item={userData?.middleName}
                                    />
                            </View>
                            <View style={style.input}>
                                <Input 
                                    label="Last Name" 
                                    iconName='people' 
                                    onChangeText={(text) => handleOnChange(text, "lastName")} 
                                    error={error.last_name}
                                    item={userData?.lastName}
                                    />
                            </View>

                            <View style={style.input}>
                                <SelectBday value={birthDate} setValue={(newDate) => handleBirthDate(newDate)} error={error.birthdate} />
                            </View>
                            <View style={style.input}>
                                <Select
                                   iconName="male-female-outline" items={gender} label='Gender' value={selectedGender} setValue={handleOnChangeGender} error={error.gender}
                                />
                            </View>
                            
                            <EditProfileModal modalVisible={modalOpen} onClose={() => setModalOpen(false)} openCamera={handleCamera} openGallery={handleGallery}/>
                            <AlertChooseModal
                                visible={saveAlert.visible}
                                onConfirm={handleSaveConfirm}
                                onCancel={handleSaveCancel}
                                message={saveAlert.message}
                                icon={saveAlert.icon}
                                iconColor={saveAlert.iconColor}
                            />

                            <AlertModal
                                visible={resultAlert.visible}
                                message={resultAlert.message}
                                icon={resultAlert.icon}
                                iconColor={resultAlert.iconColor}
                                onConfirm={handleResultConfirm}
                            />
                        </View>
                    </SafeAreaView>
                </ScrollView>
            </KeyboardAvoidingView>
        </GestureHandlerRootView>
    )
}

const style = StyleSheet.create({
    container: {
        backgroundColor: "white",
        flex: 1,
    },
    back:{
        marginVertical: 20,
        left: 0,
        flexDirection: "row",
        paddingHorizontal: 20,
        justifyContent: "space-between",
    },
    backBtn:{
        justifyContent: "center",
        alignContent: "center",
    },
    saveBtn:{
        justifyContent: "center",
        alignContent: "center",
    },
    profilegrp:{
        flexDirection: "column",
        alignContent: "center",
        alignItems: "center"
    },
    profileContainer: {
        height: 150,
        width: 150,
        overflow: "hidden",
        marginRight: 15,
        alignItems: "center",
        alignContent: "center",
        justifyContent: "center"
    },
    profile: {
        width: 150,
        borderRadius: 75,
        height: 150,
    },
    btnContainer:{
        position: "absolute",
        bottom: 0,
        right: 5,
    },
    iconBtn:{
        backgroundColor: "#277CA5",
        justifyContent: "center",
        alignContent: "center",
        alignItems: "center",
        padding: 10,
        borderRadius: 50,
    },
    icon:{
        color: "#fff",
        fontSize: 24,
    },
    form:{
        marginVertical: 20,
        marginHorizontal: 20,
    },
    input:{
        justifyContent: "center",
        alignItems: "center",
        marginVertical: 10,
    },
    btnGrp:{
        marginVertical: 10,
    },
    btn:{
        justifyContent: "center",
        alignItems: "center"
    }
});

export default Profile;