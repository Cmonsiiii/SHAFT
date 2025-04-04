import * as Font from 'expo-font';

export const loadFonts = async() => {
    await Font.loadAsync({
        CeraPro: require('@/assets/fonts/CeraPro-Regular.ttf'),
        CeraPro_Light: require('@/assets/fonts/CeraPro-Light.ttf'),
        CeraPro_Medium: require('@/assets/fonts/CeraPro-Medium.ttf'),
        CeraPro_Bold: require('@/assets/fonts/CeraPro-Bold.ttf'),
        CeraPro_BoldItalic: require('@/assets/fonts/CeraPro-BoldItalic.ttf'),
        CeraPro_RegularItalic: require('@/assets/fonts/CeraPro-RegularItalic.ttf'),
        CeraPro_Thin: require('@/assets/fonts/CeraPro-Thin.ttf'),
    });
}
