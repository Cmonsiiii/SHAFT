import { Image, View, SafeAreaView, StyleSheet, useColorScheme } from "react-native";
import { ThemedView } from "@/utils/components/themeUI/ThemedView";

export default function SplashScreen() {
    const colorScheme = useColorScheme();

    // Determine the logo based on the color scheme

    const AppIcon = require("@/assets/images/shaft_logo.png")
    return (
        
            <SafeAreaView style={[styles.container, {backgroundColor: colorScheme == 'dark' ? '#151718' : "#F6F6F6"}]}>
                <ThemedView>
                    <Image source={AppIcon} style={styles.logo} />
                </ThemedView>
            </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logo: {
        width: 350, // Adjust the width as needed
        height: 350, // Adjust the height as needed
        resizeMode: 'center', // Ensure the logo fits well
        justifyContent: "center",
        alignSelf: "center"
    },
});
