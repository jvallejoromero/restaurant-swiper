import {Place} from "@/types/Places.types";
import {LocationObject} from "expo-location";
import {Timestamp} from "firebase/firestore";
import {PlaceDetails} from "@/types/GoogleResponse.types";

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
    participantCount: number;
    location: LocationObject;
    places: Place[];
    title?: string;
    description?: string;
    radius?: number;
    filters?: string[];
}

export interface SessionParticipant {
    id?: string;
    currentIndex: number;
    joinedAt: Timestamp;
}

export interface AppUserProfile {
    displayName?: string;
    photoURL?: string;
    activeSessionId?: string | null;
    username: string;
}

export interface DatabaseService {
    createSession(ownerId: string, title: string, description: string, radius: number, filters: string[], places: Place[], participants: string[], location: LocationObject): Promise<SwipingSession>;
    endSession(sessionId: string): Promise<void>;
    getSession(sessionId: string): Promise<SwipingSession | null>;
    getSessionParticipants(sessionId: string): Promise<SessionParticipant[]>;
    getSessionSwipes(sessionId: string): Promise<SwipeAction[]>;
    getSessionPlaces(sessionId: string): Promise<Place[]>;
    addUserToSession(sessionId: string, userId: string): Promise<void>;
    addUsersToSession(sessionId: string, userIds: string[]): Promise<void>;
    removeUserFromSession(sessionId: string, userId: string): Promise<void>;
    removeUsersFromSession(sessionId: string, userIds: string[]): Promise<void>;
    recordSwipe(sessionId: string, swipe: SwipeAction): Promise<void>;
    addPlacesToSession(sessionId: string, places: Place[]): Promise<void>;
    getPlaceDetailsForSession(sessionId: string, placeId: string): Promise<PlaceDetails | null>;
    getUserProfile(uid: string): Promise<AppUserProfile | null>;
    updateUserProfile(uid: string, data: Partial<AppUserProfile>): Promise<void>;
    updateUsernameDoc(userId: string, oldUsername: string, newUsername: string, email: string): Promise<void>;
    usernameExists(username: string): Promise<boolean>;
    onSessionUpdates(sessionId: string, callback: (session: SwipingSession | null) => void, onError?: (error: Error) => void): () => void;
    onSwipeUpdates(sessionId: string, callback: (swipes: SwipeAction[]) => void, onError?: (error: Error) => void): () => void;
    onParticipantUpdates(sessionId: string, callback: (participants: SessionParticipant[]) => void, onError?: (error: Error) => void): () => void;
    onPlaceUpdates(sessionId: string, callback: (places: Place[]) => void, onError?: (error: Error) => void): () => void;
    onUserProfile(uid: string, callback: (profile: AppUserProfile | null) => void): () => void;
}