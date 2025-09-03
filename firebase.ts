import {FirebaseApp, getApp, getApps, initializeApp} from "firebase/app";
import {Auth, initializeAuth} from 'firebase/auth';
import {getReactNativePersistence} from 'firebase/auth';

import {Firestore, initializeFirestore} from "firebase/firestore";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import {getStorage} from "@firebase/storage";

const firebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

export const app: FirebaseApp =
    getApps().length ? getApp() : initializeApp(firebaseConfig);

let _auth: Auth | null = null;
export const auth: Auth =
    _auth ??
    (_auth = initializeAuth(app, {
        persistence: getReactNativePersistence(ReactNativeAsyncStorage),
    }));


let _firestore: Firestore | null = null;
export const firestore: Firestore =
    _firestore ??
    (_firestore = initializeFirestore(app, {
        experimentalForceLongPolling: true,
        experimentalAutoDetectLongPolling: false,
    }));

export const storage = getStorage(app);
