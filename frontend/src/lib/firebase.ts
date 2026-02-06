
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, setPersistence, browserLocalPersistence } from "firebase/auth";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// DEBUG: Verify config loading
if (typeof window !== 'undefined') {
    console.log("Firebase Config Check:", {
        apiKey: firebaseConfig.apiKey ? "Loaded " + firebaseConfig.apiKey.substring(0, 5) + "..." : "MISSING",
        authDomain: firebaseConfig.authDomain,
        projectId: firebaseConfig.projectId
    });
}

// Initialize Firebase (Singleton pattern)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

// Configure auth persistence to LOCAL (survives page reloads and browser restarts)
if (typeof window !== 'undefined') {
    setPersistence(auth, browserLocalPersistence).catch((error) => {
        console.error("Failed to set auth persistence:", error);
    });
}

const googleProvider = new GoogleAuthProvider();

export { app, auth, googleProvider };
