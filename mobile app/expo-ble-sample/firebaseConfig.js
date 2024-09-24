import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { getStorage } from "firebase/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyBbJc68C2eNMOr6brPfK3PcelIZIxoOmsk",
  authDomain: "home-automation-raspi.firebaseapp.com",
  databaseURL: "https://home-automation-raspi-default-rtdb.firebaseio.com",
  projectId: "home-automation-raspi",
  storageBucket: "home-automation-raspi.appspot.com",
  messagingSenderId: "667681328317",
  appId: "1:667681328317:web:399d1ba1d342ec9e657bd4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);


export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export const storage = getStorage(app);
export const db = getDatabase(app);
