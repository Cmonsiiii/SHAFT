import { getDatabase, ref, get } from "firebase/database";
import { database } from "./firebase";

export const fetchConfigValues = async () => {
    try {
        const configRef = ref(database, 'config/'); // Adjust path to your configuration data
        const snapshot = await get(configRef);
        
        if (snapshot.exists()) {
            return snapshot.val();
        } else {
            console.log("No configuration data found");
            return {};
        }
    } catch (error) {
        console.error("Error fetching configuration values:", error);
        return {};
    }
};

// Fetch and export configuration values
export let CAMERA_IP: string;
export let CONTROL_IP: string;
export let VC_IP: string;
export let READ_IP: string;

fetchConfigValues().then((config) => {
    CAMERA_IP = config.CAM_IP;
    CONTROL_IP = config.CONTROL_IP;
    VC_IP = config.VC_IP;
    READ_IP = config.READ_IP;
});