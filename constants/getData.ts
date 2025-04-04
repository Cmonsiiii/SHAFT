
import CryptoJS from "crypto-js";
import AsyncStorage from "@react-native-async-storage/async-storage";

const getData = async(key: string) =>{

    const email = await AsyncStorage.getItem("encryptedEmail");
    const first_name = await AsyncStorage.getItem("encryptedFName");
    const last_name = await AsyncStorage.getItem("encryptedLName");
    const address = await AsyncStorage.getItem("encryptedAddress");
    const phone = await AsyncStorage.getItem("encryptedPhone");
    const username = await AsyncStorage.getItem("encryptedUsername");
    const bdate = await AsyncStorage.getItem("encryptedBirthDate");


    const decryptedData = {
        Email: CryptoJS.AES.decrypt(email, key).toString(CryptoJS.enc.Utf8),
        First_Name: CryptoJS.AES.decrypt(first_name, key).toString(CryptoJS.enc.Utf8),
        Username: CryptoJS.AES.decrypt(username, key).toString(CryptoJS.enc.Utf8),
        Last_Name: CryptoJS.AES.decrypt(last_name, key).toString(CryptoJS.enc.Utf8),
        Address: CryptoJS.AES.decrypt(address, key).toString(CryptoJS.enc.Utf8),
        Phone: CryptoJS.AES.decrypt(phone, key).toString(CryptoJS.enc.Utf8),
        BirthDate: CryptoJS.AES.decrypt(bdate, key).toString(CryptoJS.enc.Utf8),
    };

    return decryptedData;
}

export default getData;