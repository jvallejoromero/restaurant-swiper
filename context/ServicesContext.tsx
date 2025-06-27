// context/ServicesContext.tsx
import React, {createContext, ReactNode, useContext, useEffect, useState} from "react";
import {AuthService, User} from "@/services/AuthService"
import {DatabaseService, AppUserProfile} from "@/services/DatabaseService";
import {FirebaseAuthService} from "@/services/FirebaseAuthService";
import {FirebaseDatabaseService} from "@/services/FirebaseDatabaseService";
import {onAuthStateChanged} from "firebase/auth";
import {auth} from "@/firebase";

interface ServicesContextProps {
    auth: AuthService;
    database: DatabaseService;
    user: User | null;
    userProfile: AppUserProfile | null;
    loading: boolean;
}

interface ServicesProviderProps {
    children: ReactNode;
}

export const ServicesContext = createContext<ServicesContextProps | null>(null);

export const ServicesProvider: React.FC<ServicesProviderProps> = ({ children }) => {
    const authService = new FirebaseAuthService();
    const dbService   = new FirebaseDatabaseService();

    // track the signed-in user & loading state once
    const [user, setUser] = useState<User | null>(null);
    const [userProfile, setUserProfile] = useState<AppUserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let profileUnsub: (() => void) | null = null;
        // Subscribe to auth state changes
        const authUnsub = onAuthStateChanged(auth, fbUser => {
            // Tear down any existing profile listener
            if (profileUnsub) {
                profileUnsub();
                profileUnsub = null;
            }

            if (fbUser) {
                // New user signed in: start loading profile
                setLoading(true);
                profileUnsub = dbService.onUserProfile(fbUser.uid, (profile) => {
                    setUserProfile(profile);
                    setUser({
                        uid: fbUser.uid,
                        email: fbUser.email!,
                        username: profile?.username ?? "",
                        emailVerified: fbUser.emailVerified,
                    });
                    setLoading(false);
                });
            } else {
                // User signed out: clear state
                setUser(null);
                setUserProfile(null);
                setLoading(false);
            }
        });

        // Cleanup both auth and profile subscriptions
        return () => {
            authUnsub();
            if (profileUnsub) profileUnsub();
        };
    }, []);


    return (
        <ServicesContext.Provider value={{ auth: authService, database: dbService, user, userProfile, loading }}>
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