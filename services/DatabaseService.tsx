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

export interface DatabaseService {
    createSession(userId: string): Promise<Session>;
    joinSession(sessionId: string, userId: string): Promise<void>;
    recordSwipe(sessionId: string, swipe: Swipe): Promise<void>;

    /** Subscribe to all swipes in session (fires on any add/update) */
    onSessionSwipes(
        sessionId: string,
        callback: (swipes: Swipe[]) => void
    ): () => void; // returns unsubscribe

    // …any other methods: fetchMatches, fetchUserSettings, etc.
}