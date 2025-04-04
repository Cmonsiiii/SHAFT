
import { UserStorage } from "@/utils/code/async/saveInfo";
import Button from "@/utils/components/buttons/button";
import MenuDivider from "@/utils/components/buttons/MenuDivider";
import AlertModal from "@/utils/components/modals/Alert";
import AlertChooseModal from "@/utils/components/modals/AlertChoose";
import { ThemedText } from "@/utils/components/themeUI/ThemedText";
import { ThemedView } from "@/utils/components/themeUI/ThemedView";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Link, useRouter } from "expo-router";
import React from "react";
import { useColorScheme, View, StyleSheet, SafeAreaView, Image} from "react-native";
import { clearNotifications } from "@/utils/code/async/notifStorage";

const AppIcon = require("@/assets/images/shaft_logo.png")

interface AlertState {
    visible: boolean;
    message: string;
    icon: string;
    iconColor: string;
}

const Menu = () => {
    const router = useRouter();
    const colorScheme = useColorScheme();

    const [backAlert, setBackAlert] = React.useState<AlertState>({
        visible: false,
        message: "Are you sure you want to log out?",
        icon: "help",
        iconColor: "danger"
    });

    const [successAlert, setSuccessAlert] = React.useState<AlertState>({
        visible: false,
        message: "You have been successfully logged out",
        icon: "checkmark-circle",
        iconColor: "success"
    });

    const handleLogoutPress = () => {
        setBackAlert((prev) => ({...prev, visible: true}));
    };

    const handleBackConfirm = () => {
        setBackAlert((prev) => ({...prev, visible: false}));
        // Handle logout logic here
        setSuccessAlert((prev) => ({...prev, visible: true}));
    };

    const handleBackCancel = () => {
        setBackAlert((prev) => ({...prev, visible: false}));
    };

    const handleSuccessConfirm = async () => {
        setSuccessAlert((prev) => ({...prev, visible: false}));
        await UserStorage.clearUserData();
        await AsyncStorage.removeItem('timerEndTime');
        await AsyncStorage.removeItem('initialTimerDuration');
        await clearNotifications();
        await AsyncStorage.removeItem("app_notifications")
        router.replace("/auth/login");
    };

    // Function to fetch user data
    const [userData, setUserData] = React.useState<{firstName: string} | null>(null);

    React.useEffect(() => {
        fetchUserData();
        const intervalId = setInterval(fetchUserData, 1000);
        return () => clearInterval(intervalId);
    }, []);

    const fetchUserData = async () => {
        try {
            const data = await UserStorage.getUserData();
            setUserData(data);
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    };

    return(
        <SafeAreaView style={[style.container, {backgroundColor: colorScheme === 'dark' ? '#151718' : '#F6F6F6'}]}>
            <View style={style.profileSection}>
                <Image 
                    style={style.profilePic}
                    source={AppIcon}
                />
                <ThemedText type="defaultSemiBold" style={style.profileName}>
                    {userData?.firstName || 'Loading...'}
                </ThemedText>
            </View>
            <View style={style.grp}>
                <View style={style.divider}>
                    <ThemedText type='fade'>Profile Settings</ThemedText>
                </View>
                <MenuDivider title="Edit Profile" icon_name="person" onPress={() => {router.navigate("/main/profile/")}}/>
                <MenuDivider title="Weather Settings" icon_name="cloud" onPress={() => {router.navigate("/main/profile/setWeather")}}/>
                <MenuDivider title="Set Timer" icon_name="time" onPress={() => {router.navigate("/main/profile/setTime")}}/>
            </View>
            {/* <View style={style.grp}>
                <View style={style.divider}>
                    <ThemedText type='fade'>Privacy Settings</ThemedText>
                </View>
                <MenuDivider title="Change Username" icon_name="person" onPress={() => {router.navigate("../changeuser/")}}/>
                <MenuDivider title="Change Password" icon_name="key" onPress={() => {router.navigate("../changepass/")}}/>
                <MenuDivider title="Change Email" icon_name="mail" onPress={() => {router.navigate("../changeemail/")}}/>
            </View> */}
            <View style={style.grp}>
                <View style={style.divider}>
                    <ThemedText type='fade'>Account Settings</ThemedText>
                </View>
                <MenuDivider title="Log Out" icon_name="log-out" onPress={handleLogoutPress}/>
            </View>

            <AlertChooseModal
                visible={backAlert.visible}
                onConfirm={handleBackConfirm}
                onCancel={handleBackCancel}
                message={backAlert.message}
                icon={backAlert.icon}
                iconColor={backAlert.iconColor}
            />

            <AlertModal
                visible={successAlert.visible}
                message={successAlert.message}
                icon={successAlert.icon}
                iconColor={successAlert.iconColor}
                onConfirm={handleSuccessConfirm}
            />
        </SafeAreaView>
    )
}

const style = StyleSheet.create({
    container:{
        flex: 1,
        backgroundColor: "#fff",
    },
    grp:{
        marginBottom: 10,
    },
    divider:{
        margin: 10,
    },
    profileSection: {
        alignItems: 'center',
        padding: 20,
    },
    profilePic: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginBottom: 12,
    },
    profileName: {
        fontSize: 22,
        textAlign: "center"
    }
})

export default Menu;