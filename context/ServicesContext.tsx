// context/ServicesContext.tsx
import React, {createContext, ReactNode, useContext, useEffect, useState} from "react";
import {AuthService, User} from "@/services/AuthService"
import {DatabaseService} from "@/services/DatabaseService";
import {FirebaseAuthService} from "@/services/FirebaseAuthService";
import {FirebaseDatabaseService} from "@/services/FirebaseDatabaseService";
import {onAuthStateChanged} from "firebase/auth";
import {auth, firestore} from "@/firebase";
import {doc, getDoc} from "firebase/firestore";

interface ServicesContextProps {
    auth:    AuthService;
    database: DatabaseService;
    user:    User | null;
    loading: boolean;
}

interface ServicesProviderProps {
    children: ReactNode;
}

export const ServicesContext = createContext<ServicesContextProps>(null!);

export const ServicesProvider: React.FC<ServicesProviderProps> = ({ children }) => {
    const authService = new FirebaseAuthService();
    const dbService   = new FirebaseDatabaseService();

    // track the signed-in user & loading state once
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // subscribe to Firebase’s profile-state changes
        return onAuthStateChanged(auth, async fbUser => {
            if (!fbUser) {
                setUser(null);
            } else {
                try {
                    // fetch the profile doc we wrote at sign-up
                    const snap = await getDoc(doc(firestore, "users", fbUser.uid));
                    const profile = snap.data();
                    setUser({
                        uid: fbUser.uid,
                        email: fbUser.email!,
                        username: profile?.username ?? "",
                        emailVerified: fbUser.emailVerified,
                    });
                } catch (err) {
                    console.warn("Failed to load profile:", err);
                    // fallback to empty username
                    setUser({
                        uid: fbUser.uid,
                        email: fbUser.email!,
                        username: "",
                        emailVerified: fbUser.emailVerified,
                    });
                }
            }
            setLoading(false);
        });
    }, []);

    return (
        <ServicesContext.Provider value={{ auth: authService, database: dbService, user, loading }}>
            {children}
        </ServicesContext.Provider>
    );
};

export function useServices(): ServicesContextProps {
    const ctx = useContext(ServicesContext);
    if (!ctx) {
        throw new Error("useServices must be used within a ServicesProvider");
    }
    return ctx;
}