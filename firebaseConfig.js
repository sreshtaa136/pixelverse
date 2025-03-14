import { initializeApp, getApps, getApp } from "firebase/app";
import {
  initializeAuth,
  getReactNativePersistence,
  getAuth,
} from "firebase/auth";
// An asynchronous, unencrypted, persistent, key-value storage system for React Native.
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import Constants from "expo-constants";
import { algoliasearch } from "algoliasearch";

const firebaseConfig = {
  apiKey: Constants.expoConfig.extra.API_KEY,
  authDomain: Constants.expoConfig.extra.AUTH_DOMAIN,
  projectId: Constants.expoConfig.extra.PROJECT_ID,
  storageBucket: Constants.expoConfig.extra.STORAGE_BUCKET,
  messagingSenderId: Constants.expoConfig.extra.MESSAGING_SENDER_ID,
  appId: Constants.expoConfig.extra.APP_ID,
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});
// let auth;
// console.log("GET APPS", getApps().length)
// if (getApps().length === 0) {
//   auth = initializeAuth(app, {
//     persistence: getReactNativePersistence(ReactNativeAsyncStorage),
//   });
// } else {
//   auth = getAuth(app);
// }
const db = getFirestore(app);
const storage = getStorage(app);

// Initialize Algolia
const ALGOLIA_APP_ID = Constants.expoConfig.extra.ALGOLIA_APP_ID;
const ALGOLIA_ADMIN_KEY = Constants.expoConfig.extra.ALGOLIA_ADMIN_KEY;
const algoliaClient = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_ADMIN_KEY);

export { app, auth, db, storage, algoliaClient };
