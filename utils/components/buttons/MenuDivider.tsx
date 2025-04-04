import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import { ThemedText } from '../themeUI/ThemedText';
import { ThemedView } from '../themeUI/ThemedView';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';
import { menuDivider } from '@/constants/Colors';

export default function MenuDivider({icon_name, title, onPress=() => {}}) {

    const colorScheme = useColorScheme();
    const themeColors = menuDivider[colorScheme || 'light'];

    return(
        
        <TouchableOpacity style={style.container} onPress={onPress}>     
            <View style={style.left}>  
                <View style={[style.iconContainer, {backgroundColor: themeColors.background }]}>
                    <View>
                        <Ionicons
                            style={[style.icon, {color: themeColors.color}]}
                            name={icon_name}
                            />
                    </View>
                </View>
                <View style={style.textContainer}>
                    <ThemedText type='med'>
                        {title}
                    </ThemedText>
                </View>
            </View>  
            <View style={style.right}>
                <ThemedText>
                    <Ionicons style={style.icon} name="chevron-forward" />
                </ThemedText>
            </View>
        </TouchableOpacity>
    )
}

const style = StyleSheet.create({
    container:{
        flexDirection: "row",
        padding: 10,
        marginHorizontal: 10,
        justifyContent: "space-between"
    },
    iconContainer:{
        backgroundColor: "black",
        borderRadius: 40,
        padding: 5,
    },
    icon:{
        fontSize: 24
    },
    textContainer:{
        marginHorizontal: 12,
        justifyContent: "center"
    },
    left:{
        flexDirection: "row"
    },
    right:{
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center"
    },
    dark:{
        backgroundColor: "#151718",
        color: "#11181C"
    },
    light:{
        backgroundColor: "#fff",
        color: "#ECEDEE"
    },
})