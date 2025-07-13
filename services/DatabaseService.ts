import {Place} from "@/types/Places.types";
import {LocationObject} from "expo-location";
import {Timestamp} from "firebase/firestore";

export interface SwipeAction {
    userId:  string;
    placeId: string;
    direction: string;
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
    title?: string;
    description?: string;
    radius?: number;
    filters?: string[];
}

export interface AppUserProfile {
    displayName?: string;
    photoURL?: string;
    username: string;
}

export interface DatabaseService {
    createSession(ownerId: string, title: string, description: string, radius: number, filters: string[], places: Place[], location: LocationObject): Promise<SwipingSession | null>;
    getSession(sessionId: string): Promise<SwipingSession | null>;
    addUserToSession(sessionId: string, userId: string): Promise<void>;
    removeUserFromSession(sessionId: string, userId: string): Promise<void>;
    recordSwipe(sessionId: string, swipe: SwipeAction): Promise<void>;
    getUserProfile(uid: string): Promise<AppUserProfile | null>;
    updateUserProfile(uid: string, data: Partial<AppUserProfile>): Promise<void>;
    updateUsernameDoc(userId: string, oldUsername: string, newUsername: string, email: string): Promise<void>;
    usernameExists(username: string): Promise<boolean>;
    onSessionSwipes(sessionId: string, callback: (swipes: SwipeAction[]) => void): () => void;
    onUserProfile(uid: string, callback: (profile: AppUserProfile | null) => void): () => void;
}