import {
    collection,
    deleteDoc,
    doc,
    FieldValue,
    getDoc,
    getDocs,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    setDoc,
    updateDoc,
    where,
    writeBatch,
} from 'firebase/firestore';
import {firestore} from '@/firebase';
import {
    AppUserProfile,
    DatabaseService,
    SessionParticipant,
    SessionStatus,
    SwipeAction,
    SwipingSession
} from './DatabaseService';
import {LocationObject} from "expo-location";
import {uuid} from "expo-modules-core";
import {Place} from "@/types/Places.types";
import {PlaceDetails} from "@/types/GoogleResponse.types";
import {fetchPlaceDetails, sanitizePlace} from '@/utils/GoogleAPIUtils';
import {increment, Timestamp} from "@firebase/firestore";

type NewSwipingSession = Omit<SwipingSession, 'createdAt'> & {
    createdAt: FieldValue;
};

type NewParticipant = Omit<SessionParticipant, 'joinedAt'> & {
    joinedAt: FieldValue;
};

export class FirebaseDatabaseService implements DatabaseService {

    async getUserProfile(uid: string): Promise<AppUserProfile | null> {
        const ref = doc(firestore, 'users', uid);
        const snap = await getDoc(ref);
        return snap.exists() ? (snap.data() as AppUserProfile) : null;
    }

    async updateUserProfile(uid: string, data: Partial<AppUserProfile>): Promise<void> {
        const ref = doc(firestore, 'users', uid);
        await setDoc(ref, data, { merge: true });
    }

    async updateUsernameDoc(userId: string, oldUsername: string, newUsername: string, email: string): Promise<void> {
        // delete old username doc
        await deleteDoc(doc(firestore, 'usernames', oldUsername));
        // set new username
        await setDoc(doc(firestore, 'usernames', newUsername), {
            uid: userId,
            email: email
        });
    }

    async usernameExists(username: string): Promise<boolean> {
        const ref = doc(firestore, 'usernames', username);
        const docSnap = await getDoc(ref);
        return docSnap.exists();
    }

    // real time updates
    onUserProfile(uid: string, callback: (profile: AppUserProfile | null) => void): () => void {
        const ref = doc(firestore, 'users', uid);
        return onSnapshot(ref, snap => {
            callback(snap.exists() ? (snap.data() as AppUserProfile) : null);
        });
    }

    async createSession(ownerId: string,
                        title: string,
                        description: string,
                        radius: number,
                        filters: string[],
                        places: Place[],
                        participants: string[],
                        location: LocationObject): Promise<SwipingSession> {
        const sessionId = uuid.v4();
        const sessionRef = doc(firestore, 'sessions', sessionId);

        const session: NewSwipingSession = {
            id: sessionId,
            createdBy: ownerId,
            createdAt: serverTimestamp(),
            status: SessionStatus.CREATED,
            expiresAt: Timestamp.fromDate(new Date(Date.now() + 60 * 60 * 1000 * 24)),
            participantCount: 0,
            title: title,
            description: description,
            radius: radius,
            filters: filters,
            location: location,
        };

        try {
            await setDoc(sessionRef, session);
        } catch (error) {
            console.warn("Could not create swiping session:", error);
            throw new Error("Session creation failed. Please contact the developer.");
        }
        try {
            await this.addUsersToSession(sessionId, participants);
        } catch (error) {
            console.warn("Could not add users to session:", error);
            throw new Error("An error occurred while adding users to the session.");
        }

        if (places.length) {
            await this.addPlacesToSession(sessionId, places);
        }

        const createdSession = await this.getSession(sessionId);
        if (!createdSession) {
            throw new Error("An error occurred while fetching session data.");
        }
        return createdSession;
    }

    async endSession(sessionId: string): Promise<void> {
        const sessionRef = doc(firestore, 'sessions', sessionId);
        //TODO: Compile a stats file before deleting full data
        try {
            await this.deleteCachedPlaceData(sessionId);
        } catch (err) {
            console.warn(`Could not delete place data from session with id: ${sessionId}`, err);
            throw new Error("An error occurred while deleting place data from session.");
        }
        try {
            const participants = await this.getSessionParticipants(sessionId);
            const participantIds = participants
                .map(user => user.id)
                .filter((id): id is string => id !== undefined);
            await this.removeUsersFromSession(sessionId, participantIds);
        } catch (err) {
            console.warn(`Could not remove users from session with id: ${sessionId}`, err);
            throw new Error("An error occurred while deleting users from the session.");
        }
        try {
            await deleteDoc(sessionRef);
        } catch (error) {
            console.warn(`Could not delete swiping session with id ${sessionId}`, error);
            throw new Error("Could not delete session. Please contact the developer.");
        }
    }

    async getSession(sessionId: string): Promise<SwipingSession | null> {
        const sessionRef = doc(firestore, 'sessions', sessionId);
        let session;
        try {
            const snap = await getDoc(sessionRef);
            if (!snap.exists()) {
                return null;
            }
            session = snap.data() as SwipingSession;
        } catch (err) {
            console.warn("Could not retrieve session:", err);
            return null;
        }
        return session;
    }

    async updateSession(sessionId: string, data: Partial<SwipingSession>): Promise<void> {
        const sessionRef = doc(firestore, 'sessions', sessionId);
        const snap = await getDoc(sessionRef);
        if (!snap.exists()) return;

        const current = snap.data() as SwipingSession;
        const hasChanged = Object.entries(data).some(([key, value]) => {
            return JSON.stringify(current[key as keyof SwipingSession]) !== JSON.stringify(value);
        });

        if (!hasChanged) return;

        try {
            await updateDoc(sessionRef, data);
            const updatedFields = Object.entries(data)
                .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
                .join(", ");

            console.log(`Session ${sessionId} updated with ${updatedFields}`);
        } catch (err) {
            console.warn(`Failed to update session ${sessionId}:`, err);
            throw new Error("Could not update session.");
        }
    }

    async addUserToSession(sessionId: string, userId: string): Promise<void> {
        const participantRef = doc(firestore, 'sessions', sessionId, 'participants', userId);
        const sessionRef = doc(firestore, "sessions", sessionId);
        const participant: NewParticipant = {
            currentIndex: 0,
            joinedAt: serverTimestamp(),
        }
        await setDoc(participantRef, participant);
        await this.updateUserProfile(userId, {
            activeSessionId: sessionId,
        });
        await updateDoc(sessionRef, {
            participantCount: increment(1),
        });
        console.log(`User ${userId} added to session ${sessionId}`);
    }

    async addUsersToSession(sessionId: string, userIds: string[]): Promise<void> {
        const batch = writeBatch(firestore);
        const sessionRef = doc(firestore, "sessions", sessionId);
        userIds.forEach((uid) => {
            const participantRef = doc(firestore, 'sessions', sessionId, 'participants', uid);
            const participant: NewParticipant = {
                currentIndex: 0,
                joinedAt: serverTimestamp(),
            }
            batch.set(participantRef, participant);
            const userRef = doc(firestore, 'users', uid);
            batch.update(userRef, {
                activeSessionId: sessionId
            });
        });

        await batch.commit();
        await updateDoc(sessionRef, {
            participantCount: increment(userIds.length),
        });
        console.log(`Added ${userIds.length} participants to session with id ${sessionId}`);
    }

    async removeUserFromSession(sessionId: string, userId: string): Promise<void> {
        const batch = writeBatch(firestore);

        const sessionRef = doc(firestore, "sessions", sessionId);
        const participantRef = doc(firestore, 'sessions', sessionId, 'participants', userId);

        const swipesCol = collection(firestore, 'sessions', sessionId, 'swipes');
        const q = query(swipesCol, where("userId", "==", userId));
        const swipeSnap = await getDocs(q);

        batch.delete(participantRef);
        swipeSnap.docs.forEach((doc) => {
            batch.delete(doc.ref);
        });

        await updateDoc(sessionRef, {
            participantCount: increment(-1),
        });
        await batch.commit();
        await this.updateUserProfile(userId, {
            activeSessionId: null,
        });

        console.log(`User ${userId} removed from session ${sessionId}`);
    }

    async removeUsersFromSession(sessionId: string, userIds: string[]): Promise<void> {
        const batch = writeBatch(firestore);
        const sessionRef = doc(firestore, "sessions", sessionId);
        const swipesCol = collection(firestore, 'sessions', sessionId, 'swipes');

        for (const uid of userIds) {
            const userRef = doc(firestore, 'users', uid);
            const partRef = doc(firestore, 'sessions', sessionId, 'participants', uid);
            batch.update(userRef, {
                activeSessionId: null
            });
            batch.delete(partRef);

            const swipeBatch = writeBatch(firestore);
            const q = query(swipesCol, where("userId", "==", uid));
            const snap = await getDocs(q);

            if (snap.empty) {
                continue;
            }
            snap.docs.forEach(doc => {
                swipeBatch.delete(doc.ref);
            });
            await swipeBatch.commit();
        }

        await batch.commit();
        await updateDoc(sessionRef, {
            participantCount: increment(-userIds.length),
        });
        console.log(`Removed ${userIds.length} participants from session with id ${sessionId}`);
    }

    async updateParticipant(sessionId: string, userId: string, data: Partial<SessionParticipant>): Promise<void> {
        const participantRef = doc(firestore, 'sessions', sessionId, 'participants', userId);
        const snap = await getDoc(participantRef);
        if (!snap.exists()) return;

        const current = snap.data() as SessionParticipant;
        const hasChanged = Object.entries(data).some(([key, value]) => {
            return JSON.stringify(current[key as keyof SessionParticipant]) !== JSON.stringify(value);
        });

        if (!hasChanged) return;

        try {
            await updateDoc(participantRef, data);
            const updatedFields = Object.entries(data)
                .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
                .join(", ");

            console.log(`Participant ${userId} updated with ${updatedFields}`);
        } catch (err) {
            console.warn(`Failed to update participant in session ${sessionId}:`, err);
            throw new Error("Could not update participant information.");
        }
    }

    async recordSwipe(sessionId: string, swipe: SwipeAction): Promise<void> {
        try {
            const swipeRef = doc(firestore, 'sessions', sessionId, 'swipes', `${swipe.userId}_${swipe.placeId}`);
            await setDoc(swipeRef, swipe);
        } catch (err) {
            console.warn("Could not record swipe: ", err);
            throw new Error("Could not record swipe");
        }
    }

    async addPlacesToSession(sessionId: string, places: Place[]): Promise<void> {
        const batch = writeBatch(firestore);
        for (const place of places) {
            const placeRef = doc(firestore, 'sessions', sessionId, 'places', place.id);
            const cleanPlace = sanitizePlace(place);
            batch.set(placeRef, cleanPlace);
        }
        try {
            await batch.commit();
            console.log(`Successfully wrote ${places.length} place(s)`);
        } catch (err) {
            console.warn("Could not add places to session:", err);
            throw new Error(`Could not add places to session`);
        }
    }

    async getPlaceDetailsForSession(sessionId: string, placeId: string): Promise<PlaceDetails | null> {
        const detailsRef = doc(firestore, 'sessions', sessionId, 'places', placeId, 'details', 'info');
        try {
            const detailsSnap = await getDoc(detailsRef);
            if (detailsSnap.exists()) {
                console.log("Retrieved place details from firestore cache");
                return detailsSnap.data() as PlaceDetails;
            }
        } catch (err) {
            console.log(`Could not find place details for place with id ${placeId} in session with id ${sessionId}`);
            console.log('Attempting to fetch from Google API..');
        }
        const placeData = await fetchPlaceDetails(placeId);
        if (!placeData) {
            return null;
        }
        await setDoc(detailsRef, placeData);
        return placeData;
    }

    async getSessionParticipants(sessionId:string): Promise<SessionParticipant[]> {
        const participantsCol = collection(firestore, 'sessions', sessionId, 'participants');
        let snapshot;
        try {
            snapshot = await getDocs(participantsCol);
        } catch (err) {
            console.warn(`Could not get participants in session with id:${sessionId}`, err);
            throw new Error(`Could not get participants data: ${err}`);
        }
        return snapshot.docs.map((doc) => {
            return {
                id: doc.id,
                ...doc.data(),
            };
        }) as SessionParticipant[];
    }

    async getSessionSwipes(sessionId: string): Promise<SwipeAction[]> {
        const swipesCol = collection(firestore, 'sessions', sessionId, 'swipes');
        const swipeQuery = query(swipesCol, orderBy("swipedAt", "desc"));
        try {
            const snap = await getDocs(swipeQuery);
            return snap.docs.map(doc => doc.data() as SwipeAction);
        } catch (err) {
            console.warn(`Could not fetch swipes for session ${sessionId}:`, err);
            throw new Error(`Could not get swipe data: ${err}`);
        }
    }

    async getSessionPlaces(sessionId: string): Promise<Place[]> {
        const placesCol = collection(firestore, 'sessions', sessionId, 'places');
        try {
            const snap = await getDocs(placesCol);
            return snap.docs.map(doc => doc.data() as Place);
        } catch (err) {
            console.warn(`Could not fetch places for session ${sessionId}:`, err);
            throw new Error(`Could not get place data: ${err}`);
        }
    }

    async deleteCachedPlaceData(sessionId:string): Promise<void> {
        const placesCol = collection(firestore, 'sessions', sessionId, 'places');
        const placesSnap = await getDocs(placesCol);
        const batch = writeBatch(firestore);

        for (const placeDoc of placesSnap.docs) {
            const detailsCol = collection(
                firestore,
                'sessions',
                sessionId,
                'places',
                placeDoc.id,
                'details'
            );
            const detailsSnap = await getDocs(detailsCol);
            detailsSnap.docs.forEach(d => batch.delete(d.ref));
            batch.delete(placeDoc.ref);
        }

        await batch.commit();
    }

    onSessionUpdates(sessionId: string, callback: (session: SwipingSession | null) => void, onError?: (error: Error) => void): () => void {
        const ref = doc(firestore, 'sessions', sessionId);
        return onSnapshot(
            ref,
            snap => {
                callback(snap.exists() ? (snap.data() as SwipingSession) : null);
            },
            error => onError?.(error)
        );
    }

    onParticipantUpdates(sessionId: string, callback: (participants: SessionParticipant[]) => void, onError?: (error: Error) => void) {
        const participantsCol = collection(firestore, 'sessions', sessionId, 'participants');
        return onSnapshot(
            participantsCol,
            snap => {
                const list: SessionParticipant[] = snap.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        currentIndex: data.currentIndex as number,
                        joinedAt: data.joinedAt as Timestamp,
                    };
                });
                callback(list);
            },
            error => onError?.(error)
        );
    }

    onSwipeUpdates(sessionId: string, callback: (swipes: SwipeAction[]) => void, onError?: (error: Error) => void): () => void {
        const swipesCol = collection(firestore, 'sessions', sessionId, 'swipes');
        const swipeQuery = query(swipesCol, orderBy("swipedAt", "desc"));
        return onSnapshot(
            swipeQuery,
            snap => {
                const swipes = snap.docs.map(doc => doc.data() as SwipeAction);
                callback(swipes);
            },
            error => onError?.(error)
        );
    }

    onPlaceUpdates(sessionId: string, callback: (places: Place[]) => void, onError?: (error: Error) => void): () => void {
        const placesCol = collection(firestore, 'sessions', sessionId, 'places');
        return onSnapshot(
            placesCol,
            snap => {
                const places = snap.docs.map(doc => doc.data() as Place);
                callback(places);
            },
            error => onError?.(error)
        );
    }
}