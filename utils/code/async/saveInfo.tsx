import AsyncStorage from '@react-native-async-storage/async-storage';

// Define types for better type safety
interface Address {
    houseNo: string;
    street: string;
    city: string;
}

interface UserData {
    birthdate: { day: number; month: number; year: number; };
    username: string;
    email: string;
    firstName: string;
    middleName?: string;  // Optional field
    lastName: string;
    gender: string;
}

// Keys for AsyncStorage
const STORAGE_KEYS = {
    USER_DATA: 'user_data',
    AUTH_TOKEN: 'auth_token',  // For future use with server authentication
} as const;

export class UserStorage {
  // Save user data to AsyncStorage
    static async saveUserData(userData: UserData): Promise<void> {
        try {
            const jsonValue = JSON.stringify(userData);
            await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, jsonValue);
        } catch (error) {
            console.error('Error saving user data:', error);
            throw new Error('Failed to save user data');
        }
    }

  // Retrieve user data from AsyncStorage
    static async getUserData(): Promise<UserData | null> {
        try {
            const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
            return jsonValue != null ? JSON.parse(jsonValue) : null;
        } catch (error) {
            console.error('Error retrieving user data:', error);
            throw new Error('Failed to retrieve user data');
        }
    }

    // Clear user data (useful for logout)
    static async clearUserData(): Promise<void> {
        try {
            await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
        } catch (error) {
            console.error('Error clearing user data:', error);
            throw new Error('Failed to clear user data');
        }
    }

    // Update specific fields in user data
    static async updateUserData(updates: Partial<UserData>): Promise<void> {
        try {
            const currentData = await this.getUserData();
            if (!currentData) {
                throw new Error('No user data found to update');
            }
            const updatedData = {
                ...currentData,
                ...updates,
            };
            await this.saveUserData(updatedData);
        } catch (error) {
            console.error('Error updating user data:', error);
            throw new Error('Failed to update user data');
        }
    }
}