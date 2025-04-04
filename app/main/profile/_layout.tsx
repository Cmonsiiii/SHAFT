import { secondaryColor } from "@/constants/Colors";
import { ThemedText } from "@/utils/components/themeUI/ThemedText";
import { router, Stack, useLocalSearchParams } from "expo-router";
import React from 'react';
import { TouchableOpacity, useColorScheme } from "react-native";


export default function profile() {


  const colorScheme = useColorScheme();
  return (
    <Stack>
      <Stack.Screen name="index" 
        options={{
          headerTitle: "Profile", 
          headerTitleAlign: "center",
          headerTitleStyle: {
            fontFamily: 'CeraPro_Medium',  
            fontSize: 20,
            color: colorScheme === 'dark' ? '#ECEDEE' : '#11181C',              
          },
          headerTintColor: colorScheme === 'dark' ? '#ECEDEE' : '#11181C', 
          headerStyle:{
            backgroundColor: colorScheme === 'dark' ? '#151718' : '#F6F6F6', 
          },
          }}/>
      <Stack.Screen name="setTime" 
        options={{
          headerTitle: "Notification Timer", 
          headerTitleAlign: "center",
          headerTitleStyle: {
            fontFamily: 'CeraPro_Medium',  
            fontSize: 20,
            color: colorScheme === 'dark' ? '#ECEDEE' : '#11181C',              
          },
          headerTintColor: colorScheme === 'dark' ? '#ECEDEE' : '#11181C', 
          headerStyle:{
            backgroundColor: colorScheme === 'dark' ? '#151718' : '#F6F6F6', 
          },
          }}/>
      <Stack.Screen name="setWeather" 
        options={{
          headerTitle: "Weather Settings", 
          headerTitleAlign: "center",
          headerTitleStyle: {
            fontFamily: 'CeraPro_Medium',  
            fontSize: 20,
            color: colorScheme === 'dark' ? '#ECEDEE' : '#11181C',              
          },
          headerTintColor: colorScheme === 'dark' ? '#ECEDEE' : '#11181C', 
          headerStyle:{
            backgroundColor: colorScheme === 'dark' ? '#151718' : '#F6F6F6', 
          },
          }}/>
    </Stack>
  );
}

