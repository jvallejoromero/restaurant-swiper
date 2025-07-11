import {Place} from "@/types/Places.types";
import {LocationObject} from "expo-location";
import {Timestamp} from "firebase/firestore";

export interface SwipeAction {
    userId:  string;
    placeId: string;
    liked:   boolean;
    swipedAt: Timestamp;
}

export interface SwipingSession {
    id: string;
    createdBy: string;
    createdAt: Timestamp;
    location: LocationObject;
    participants: string[];
    places: Place[];
}

export interface AppUserProfile {
    displayName?: string;
    photoURL?: string;
    username: string;
}

export interface DatabaseService {
    createSession(ownerId: string, location: LocationObject): Promise<SwipingSession>;
    joinSession(sessionId: string, userId: string): Promise<void>;
    recordSwipe(sessionId: string, swipe: SwipeAction): Promise<void>;
    getUserProfile(uid: string): Promise<AppUserProfile | null>;
    updateUserProfile(uid: string, data: Partial<AppUserProfile>): Promise<void>;
    updateUsernameDoc(userId: string, oldUsername: string, newUsername: string, email: string): Promise<void>;
    usernameExists(username: string): Promise<boolean>;
    onSessionSwipes(sessionId: string, callback: (swipes: SwipeAction[]) => void): () => void;
    onUserProfile(uid: string, callback: (profile: AppUserProfile | null) => void): () => void;
}