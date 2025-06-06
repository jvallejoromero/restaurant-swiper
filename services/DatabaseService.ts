export interface Swipe {
    userId:  string;
    placeId: string;
    liked:   boolean;
    swipeAt: Date;
}

export interface Session {
    id:           string;
    participants: string[];
    createdAt:    Date;
}

export interface AppUserProfile {
    displayName?: string;
    photoURL?: string;
    username: string;
}

export interface DatabaseService {
    createSession(userId: string): Promise<Session>;
    joinSession(sessionId: string, userId: string): Promise<void>;
    recordSwipe(sessionId: string, swipe: Swipe): Promise<void>;

    /** Subscribe to all swipes in session (fires on any add/update) */
    onSessionSwipes(sessionId: string, callback: (swipes: Swipe[]) => void): () => void;

    onUserProfile(uid: string, callback: (profile: AppUserProfile | null) => void): () => void;

    // other methods: fetchMatches, fetchUserSettings, etc.
    getUserProfile(uid: string): Promise<AppUserProfile | null>;
    updateUserProfile(uid: string, data: Partial<AppUserProfile>): Promise<void>;
    updateUsernameDoc(userId: string, oldUsername: string, newUsername: string, email: string): Promise<void>;
    usernameExists(username: string): Promise<boolean>;
}