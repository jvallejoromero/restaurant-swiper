import {Place} from "@/types/Places.types";
import {LocationObject} from "expo-location";

export interface SwipeAction {
    userId:  string;
    placeId: string;
    liked:   boolean;
    swipedAt: Date;
}

export interface SwipingSession {
    id: string;
    location: LocationObject;
    participants: string[];
    places: Place[];
    createdAt: Date;
}

export interface AppUserProfile {
    displayName?: string;
    photoURL?: string;
    username: string;
}

export interface DatabaseService {
    createSession(userId: string): Promise<SwipingSession>;
    joinSession(sessionId: string, userId: string): Promise<void>;
    recordSwipe(sessionId: string, swipe: SwipeAction): Promise<void>;
    getUserProfile(uid: string): Promise<AppUserProfile | null>;
    updateUserProfile(uid: string, data: Partial<AppUserProfile>): Promise<void>;
    updateUsernameDoc(userId: string, oldUsername: string, newUsername: string, email: string): Promise<void>;
    usernameExists(username: string): Promise<boolean>;
    onSessionSwipes(sessionId: string, callback: (swipes: SwipeAction[]) => void): () => void;
    onUserProfile(uid: string, callback: (profile: AppUserProfile | null) => void): () => void;
}