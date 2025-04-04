import * as React from 'react';
import { TouchableOpacity, View, Text, Image, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/utils/components/themeUI/ThemedText';
import Button from '@/utils/components/buttons/button';

const AppIcon = require("@/assets/images/shaft_logo.png")

const Title = () =>{

    const router = useRouter();
    const colorScheme = useColorScheme();
    
    return(
        <SafeAreaView style={[style.container, {backgroundColor: colorScheme === 'dark' ? '#151718' : '#f6f6f6'}] }>
            <View style={style.top}>

                <View style={style.logocontainer}>
                    <Image source={AppIcon} style={style.logo}/>
                </View>

                <View style={style.title}>
                    <ThemedText type='title'>
                        S  H  A  F  T
                    </ThemedText>
                </View>
                <View style={style.subtitle}>
                    <ThemedText type='default'>
                        Smart Holder & Alert for Forecast Tracking
                    </ThemedText>
                </View>
            </View>
            <View style={style.bottom}>
                <View style={style.btn}>
                    <Button title="Login" type='primary' onPress={() => {router.navigate("/auth/login")}}/>
                </View>
                <View style={style.btn}>
                    <Button title="Sign Up" type='secondary' onPress={() => {router.navigate("/auth/signup_1")}}/>
                </View>
                    
            </View>
            
        </SafeAreaView>
    );

}

const style = StyleSheet.create({
    container:{
        paddingHorizontal: 20,
        paddingVertical: 25,
        flex: 1,
        alignContent: "center",
        justifyContent: 'space-between',
    },
    top:{
        marginTop: 40,
    },
    logocontainer:{
        flexDirection: "column",
        justifyContent: "center",
        alignContent: "center",
        alignItems: "center"
    },
    logo:{
        height: 275,
        width: 275,
    },
    title:{
        margin: 10,
        alignContent: "center",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center"
    },
    subtitle:{
        margin: 5,
        textAlign: "center",
        alignItems: "center",
    },
    bottom:{
        flexDirection: "column",
    },
    btn:{
        marginVertical: 10,
        justifyContent: "center",
        alignItems: "center"
    }
})

export default Title;