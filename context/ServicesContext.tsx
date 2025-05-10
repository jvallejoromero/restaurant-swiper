// context/ServicesContext.tsx
import React, {createContext, ReactNode, useContext, useEffect, useState} from "react";
import {AuthService, User} from "@/services/AuthService"
import {DatabaseService, UserProfile} from "@/services/DatabaseService";
import {FirebaseAuthService} from "@/services/FirebaseAuthService";
import {FirebaseDatabaseService} from "@/services/FirebaseDatabaseService";
import {onAuthStateChanged} from "firebase/auth";
import {auth} from "@/firebase";

interface ServicesContextProps {
    auth:    AuthService;
    database: DatabaseService;
    user:    User | null;
    userProfile: UserProfile | null;
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
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // subscribe to Firebase’s profile-state changes
        return onAuthStateChanged(auth, async fbUser => {
            if (!fbUser) {
                setUser(null);
            } else {
                return dbService.onUserProfile(fbUser.uid, (profile) => {
                    setUserProfile(profile);
                    setUser(profile
                        ? {
                            uid: fbUser.uid,
                            email: fbUser.email!,
                            username: profile.username,
                            emailVerified: fbUser.emailVerified,
                        }
                        : {
                            uid: fbUser.uid,
                            email: fbUser.email!,
                            username: '',
                            emailVerified: fbUser.emailVerified,
                        }
                    );
                });
            }
            setLoading(false);
        });
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