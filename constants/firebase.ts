// firebase.ts
import { FirebaseApp, initializeApp } from 'firebase/app';
import { Database, getDatabase } from 'firebase/database';
import { Auth, getAuth } from 'firebase/auth';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDReN2IRt7YBGnT-gCTDpcNVTN9TRUp_7o",
  authDomain: "shaft-794b8.firebaseapp.com",
  databaseURL: "https://shaft-794b8-default-rtdb.asia-southeast1.firebasedatabase.app/", 
  projectId: "shaft-794b8",
  storageBucket: "shaft-794b8.firebasestorage.app",
  messagingSenderId: "859671505556",
  appId: "1:859671505556:android:263506c91cb9498dcc6281"
};

// Initialize Firebase
const app: FirebaseApp = initializeApp(firebaseConfig);

// Initialize services
const database: Database = getDatabase(app);
const auth: Auth = getAuth(app);

// Export initialized services
export { app, database, auth };