// firebaseService.ts
import { database } from '@/constants/firebase';
import { ref, get, set, update, remove, push, query, orderByChild, equalTo } from 'firebase/database';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  updateProfile,
  updateEmail,
  updatePassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  User as FirebaseUser,
  UserCredential
} from 'firebase/auth';
import CryptoJS from "crypto-js";

// Define types based on your data structure
export interface BirthDate {
  day: string;
  month: string;
  year: string;
}

export interface Notifications {
  hours: number;
  minutes: number;
  setNotif: boolean;
}

export interface Profile {
  birthdate: BirthDate;
  first_name: string;
  last_name: string;
  middle_name: string;
  gender: string;
  notifications: Notifications;
}

export interface User {
  email: string;
  password?: string;
  profile: Profile;
  username: string;
  userId?: string; // Used when retrieving from Firebase
}

export interface StandSlot {
  date: string;
  slot_number: number;
  status: string;
  time: string;
  userId: string;
  standId?: string; // Used when retrieving from Firebase
}

class FirebaseService {
  private auth = getAuth();
  
  // Auth related methods

  private async getNextUserId(): Promise<number> {
    try {
      // Get all existing users
      const usersRef = ref(database, 'Users');
      const snapshot = await get(usersRef);
      
      // If no users exist, return 1 as the first ID
      if (!snapshot.exists()) {
        return 1;
      }
      
      // Otherwise find the highest existing user ID and increment by 1
      let highestId = 0;
      snapshot.forEach((childSnapshot) => {
        const userId = childSnapshot.key;
        // Parse the user ID to a number (ignoring non-numeric keys)
        if (userId && /^\d+$/.test(userId)) {
          const numericId = parseInt(userId, 10);
          if (numericId > highestId) {
            highestId = numericId;
          }
        }
      });
      
      return highestId + 1;
    } catch (error) {
      console.error('Error generating user ID:', error);
      throw error;
    }
  }
  
  // Get current authenticated user
  getCurrentUser(): FirebaseUser | null {
    return this.auth.currentUser;
  }
  
  // Register a new user with email and password
  async registerUser(email: string, password: string, username: string, profile: Profile): Promise<string> {
    try {

      const updatedProfile = {
      ...profile,
        notifications: {
          ...profile.notifications,
          setNotif: profile.notifications.setNotif ?? false, // Default to false
        },
      };
      // Create auth user
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      const firebaseUser = userCredential.user;
      const hashedPassword = CryptoJS.SHA256(password).toString(CryptoJS.enc.Hex);

      // Generate auto-incrementing user ID
      const autoIncrementUserId = await this.getNextUserId();
      const userIdString = autoIncrementUserId < 10 ? `${autoIncrementUserId}` : `${autoIncrementUserId.toString().padStart(2, '0')}`;
      
      // Update display name to username
      await updateProfile(firebaseUser, {
        displayName: username
      });
      
      // Create user profile in Realtime Database
      const userData: User = {
        email,
        profile: updatedProfile,
        username,
        password: hashedPassword,
        userId: userIdString // Use the auto-incremented ID
      };
      
      // Store user data with custom user ID
      await set(ref(database, `Users/${userIdString}`), {
        ...userData,
        firebaseAuthUid: firebaseUser.uid // Keep firebase auth UID for reference
      });
      
      // Send email verification
      await sendEmailVerification(firebaseUser);
      
      return userIdString;
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    }
  }
  
  // Sign in existing user
  async signIn(email: string, password: string): Promise<UserCredential> {
    try {
      return await signInWithEmailAndPassword(this.auth, email, password);
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  }
  
  // Sign out current user
  async signOut(): Promise<void> {
    try {
      await signOut(this.auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }
  
  // Update user email
  async updateUserEmail(newEmail: string): Promise<void> {
    try {
      const user = this.getCurrentUser();
      if (!user) throw new Error('No authenticated user');
      
      // Update email in authentication
      await updateEmail(user, newEmail);
      
      // Update email in Realtime Database
      await update(ref(database, `Users/${user.uid}`), { email: newEmail });
    } catch (error) {
      console.error('Error updating email:', error);
      throw error;
    }
  }
  
  // Update user password
  async updateUserPassword(newPassword: string): Promise<void> {
    try {
      const user = this.getCurrentUser();
      if (!user) throw new Error('No authenticated user');
      
      await updatePassword(user, newPassword);
    } catch (error) {
      console.error('Error updating password:', error);
      throw error;
    }
  }
  
  // Send password reset email
  async sendPasswordReset(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(this.auth, email);
    } catch (error) {
      console.error('Error sending password reset:', error);
      throw error;
    }
  }
  
  // User profile related methods
  
  // Get all users
  async getAllUsers(): Promise<User[]> {
    try {
      const usersRef = ref(database, 'Users');
      const snapshot = await get(usersRef);
      
      if (snapshot.exists()) {
        const users: User[] = [];
        snapshot.forEach((childSnapshot) => {
          const user = childSnapshot.val() as User;
          user.userId = childSnapshot.key;
          users.push(user);
        });
        return users;
      }
      return [];
    } catch (error) {
      console.error('Error getting users:', error);
      throw error;
    }
  }
  
  // Get a specific user by userId
  async getUserById(userId: string): Promise<User | null> {
    try {
      const userRef = ref(database, `Users/${userId}`);
      const snapshot = await get(userRef);
      
      if (snapshot.exists()) {
        const user = snapshot.val() as User;
        return user;
      }
      return null;
    } catch (error) {
      console.error('Error getting user:', error);
      throw error;
    }
  }
  
  // Get a user by username
  async getUserByUsername(username: string): Promise<User | null> {
    try {
        const usersRef = ref(database, 'Users/');
        const userQuery = query(usersRef, orderByChild('username'), equalTo(username));
        const snapshot = await get(userQuery);
        console.log(snapshot)
        if (snapshot.exists()) {
            let user: User | null = null;
            snapshot.forEach((childSnapshot) => {
            user = childSnapshot.val() as User;
            user.userId = childSnapshot.key;
            });
            return user;
        }
        return null;
    } catch (error) {
      console.error('Error getting user by username:', error);
      throw error;
    }
  }
  
  // Get current user's profile
  async getCurrentUserProfile(): Promise<User | null> {
    const user = this.getCurrentUser();
    if (!user) return null;
    
    return this.getUserById(user.uid);
  }
  
  // Update a user profile
  async updateUserProfile(profile: Partial<Profile>): Promise<void> {
    try {
      const user = this.getCurrentUser();
      if (!user) throw new Error('No authenticated user');
      
      const userRef = ref(database, `Users/${user.uid}/profile`);
      await update(userRef, profile);
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }
  
  // Update a user (for admin purposes)
  async updateUser(userId: string, userData: Partial<User>): Promise<void> {
    try {

      
      const userRef = ref(database, `Users/${userId}`);
      await update(userRef, userData);
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }
  
  // Delete a user
  async deleteUser(userId: string): Promise<void> {
    try {
      const userRef = ref(database, 'Users/' + userId);
      await remove(userRef);
      // Note: This does not delete the authentication user
      // Complete user deletion would require admin SDK
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }
  
  // Stand related methods
  
  // Get all stand slots
  async getAllStandSlots(): Promise<StandSlot[]> {
    try {
      const standRef = ref(database, 'Stand');
      const snapshot = await get(standRef);
      
      if (snapshot.exists()) {
        const stands: StandSlot[] = [];
        snapshot.forEach((childSnapshot) => {
          const stand = childSnapshot.val() as StandSlot;
          stand.standId = childSnapshot.key;
          stands.push(stand);
        });
        return stands;
      }
      return [];
    } catch (error) {
      console.error('Error getting stand slots:', error);
      throw error;
    }
  }
}

// Create a singleton instance
const firebaseService = new FirebaseService();
export default firebaseService;