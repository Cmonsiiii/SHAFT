import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import axios from 'axios';
import { ThemedText } from '../themeUI/ThemedText';
import { ThemedView } from '../themeUI/ThemedView';
import { Ionicons } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';

import ContentLoader, { FacebookLoader, InstagramLoader } from 'react-native-easy-content-loader';


const WeatherCardLoader = () =>{
    return(
        <ThemedView style={styles.container}>
            <View style={styles.top}>
                <ContentLoader 
                    active
                    pRows={3} 
                    pWidth={["100%", 200, "25%", 225]}
                />
            </View>
            <View style={styles.details}>
                <ContentLoader 
                    active
                    pRows={3} 
                    pWidth={["100%", 200, "25%", 225]}
                />
            </View>
        </ThemedView>
    )
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  top:{
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  head:{
    flexDirection: "column"
  },
  mid:{
    flexDirection: "row",
    alignItems: "center",  
    justifyContent: "center", 
    height: "auto",
    flexWrap: "nowrap",
    marginTop: 20,  
  },
  image:{
    marginLeft: 5, 
    height: 70,
    width: 70, 
  },
  tempMain:{  
    fontFamily: "CeraPro_Medium",
    marginTop: 0, 
    textAlign: "center",
    marginRight: 20,
  },
  date: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  city: {
    fontSize: 16,
  },
  temp:{
    fontFamily: "CeraPro_Light"
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  grp: {
    flexDirection: "column",
    justifyContent: "center",
    alignContent: "center",
    alignItems: "center"
  },
  icondetails:{
    fontSize: 20,
    marginBottom: 5,
  }
});


export default WeatherCardLoader;