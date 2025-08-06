import {Place, PlaceType} from "@/types/Places.types";
import {LocationObject} from "expo-location";
import {Timestamp} from "firebase/firestore";
import {PlaceDetails} from "@/types/GoogleResponse.types";

export enum SessionStatus {
    CREATED = "created",
    WAITING_FOR_USERS = "waiting_for_users",
    READY_FOR_START = "ready_for_start",
    LOADING_INITIAL_PLACES = "loading_initial_places",
    LOADING_NEW_PLACES = "loading_new_places",
    SWIPING = "swiping",
    ENDED = "ended",
    EXPIRED = "expired",
}

export const SESSION_STARTED_STATUSES = [
    SessionStatus.LOADING_INITIAL_PLACES,
    SessionStatus.LOADING_NEW_PLACES,
    SessionStatus.SWIPING,
    SessionStatus.ENDED,
    SessionStatus.EXPIRED,
];

export const SESSION_FINALIZED_STATUSES = [
    SessionStatus.ENDED,
    SessionStatus.EXPIRED
];

export enum SwipeDirection {
    RIGHT = "right",
    LEFT = "left",
    TOP = "top",
}

export interface SwipeAction {
    userId:  string;
    placeId: string;
    direction: SwipeDirection;
    liked: boolean;
    swipedAt: Timestamp;
}

export interface SwipingSession {
    id: string;
    createdBy: string;
    createdAt: Timestamp;
    expiresAt: Timestamp;
    status: SessionStatus;
    participantCount: number;
    location: LocationObject;
    title: string;
    description: string;
    radius: number;
    filters: string[];
    placeTypes: PlaceType[];
}

export interface SessionParticipant {
    id?: string;
    joinedAt: Timestamp;
    currentIndexes: {
        [key in PlaceType]?: number;
    };
    seenMatches: string[];
}

export interface SessionMatch {
    placeId: string;
    matchedBy: string[];
    matchedAt: Timestamp;
    placeType: PlaceType;
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
    getSessionMatches(sessionId: string): Promise<SessionMatch[]>;
    getPlaceDetailsForSession(sessionId: string, placeId: string): Promise<PlaceDetails | null>;
    getUserProfile(uid: string): Promise<AppUserProfile | null>;

    addUserToSession(sessionId: string, userId: string): Promise<void>;
    addUsersToSession(sessionId: string, userIds: string[]): Promise<void>;
    addPlacesToSession(sessionId: string, places: Place[]): Promise<void>;

    removeUserFromSession(sessionId: string, userId: string): Promise<void>;
    removeUsersFromSession(sessionId: string, userIds: string[]): Promise<void>;

    deleteCachedPlaceData(sessionId:string): Promise<void>;
    deleteMatchData(sessionId: string): Promise<void>;

    recordSwipe(sessionId: string, swipe: SwipeAction): Promise<void>;
    recordMatch(sessionId: string, match: SessionMatch): Promise<void>;

    updateUserProfile(uid: string, data: Partial<AppUserProfile>): Promise<void>;
    updateUsernameDoc(userId: string, oldUsername: string, newUsername: string, email: string): Promise<void>;
    updateSession(sessionId: string, data: Partial<SwipingSession>): Promise<void>;
    updateParticipant(sessionId: string, userId: string, data: Partial<SessionParticipant>): Promise<void>;

    onSessionUpdates(sessionId: string, callback: (session: SwipingSession | null) => void, onError?: (error: Error) => void): () => void;
    onMatchUpdates(sessionId: string, callback: (matches: SessionMatch[]) => void, onError?: (error: Error) => void): () => void;
    onSwipeUpdates(sessionId: string, callback: (swipes: SwipeAction[]) => void, onError?: (error: Error) => void): () => void;
    onParticipantUpdates(sessionId: string, callback: (participants: SessionParticipant[]) => void, onError?: (error: Error) => void): () => void;
    onPlaceUpdates(sessionId: string, callback: (places: Place[]) => void, onError?: (error: Error) => void): () => void;
    onUserProfile(uid: string, callback: (profile: AppUserProfile | null) => void): () => void;

    usernameExists(username: string): Promise<boolean>;
}