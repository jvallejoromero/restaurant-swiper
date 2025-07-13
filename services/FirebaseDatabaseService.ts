import {
    arrayRemove,
    arrayUnion,
    collection,
    deleteDoc,
    doc, FieldValue,
    getDoc,
    getDocs,
    onSnapshot,
    query, serverTimestamp,
    setDoc,
    updateDoc, where, writeBatch,
} from 'firebase/firestore';
import {firestore} from '@/firebase';
import {AppUserProfile, DatabaseService, SwipeAction, SwipingSession} from './DatabaseService';
import {LocationObject} from "expo-location";
import {uuid} from "expo-modules-core";
import {Place} from "@/types/Places.types";
import {PlaceDetails} from "@/types/GoogleResponse.types";
import { fetchPlaceDetails } from '@/utils/GoogleAPIUtils';

type NewSwipingSession = Omit<SwipingSession, 'createdAt'> & {
    createdAt: FieldValue;
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
                        location: LocationObject): Promise<SwipingSession | null> {
        const sessionId = uuid.v4();
        const sessionRef = doc(firestore, 'sessions', sessionId);

        const session: NewSwipingSession = {
            id: sessionId,
            createdBy: ownerId,
            createdAt: serverTimestamp(),
            title: title,
            description: description,
            radius: radius,
            filters: filters,
            location: location,
            participants: [ownerId],
            places: places,
        };

        try {
            await setDoc(sessionRef, session);
        } catch (error) {
            console.error("Could not create swiping session:", error);
            return null;
        }

        return this.getSession(sessionId);
    }

    async getSession(sessionId: string): Promise<SwipingSession | null> {
        const sessionRef = doc(firestore, 'sessions', sessionId);
        let session;
        try {
            const snap = await getDoc(sessionRef);
            session = snap.data() as SwipingSession;
        } catch (err) {
            console.error("Could not retrieve session:", err);
            return null;
        }
        return session;
    }

    async addUserToSession(sessionId: string, userId: string): Promise<void> {
        const sessionRef = doc(firestore, 'sessions', sessionId);
        await updateDoc(sessionRef, {
            participants: arrayUnion(userId)
        });
        await this.updateUserProfile(userId, {
            activeSessionId: sessionId,
        });
    }

    async removeUserFromSession(sessionId: string, userId: string): Promise<void> {
        const sessionRef = doc(firestore, 'sessions', sessionId);
        await updateDoc(sessionRef, {
            participants: arrayRemove(userId)
        });

         const swipesCol = collection(firestore, 'sessions', sessionId, 'swipes');
         const q = query(swipesCol, where("userId", "==", userId));
         const snap = await getDocs(q);

         if (snap.empty) {
             return;
         }

         const batch = writeBatch(firestore);
         snap.docs.forEach(doc => {
             batch.delete(doc.ref);
         });

         await batch.commit();

         await this.updateUserProfile(userId, {
             activeSessionId: null,
         });
    }

    async recordSwipe(sessionId: string, swipe: SwipeAction): Promise<void> {
        const swipeRef = doc(firestore, 'sessions', sessionId, 'swipes', `${swipe.userId}_${swipe.placeId}`);
        await setDoc(swipeRef, swipe);
    }

    async addPlacesToSession(sessionId: string, places: Place[]): Promise<void> {
        const batch = writeBatch(firestore);
        for (const place of places) {
            const placeRef = doc(firestore, 'sessions', sessionId, 'places', place.id);
            batch.set(placeRef, place);
        }
        try {
            await batch.commit();
            console.log(`Successfully wrote ${places.length} place(s)`);
        } catch (err) {
            console.error("Could not add places to session:", err);
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

    onSessionSwipes(sessionId: string, callback: (swipes: SwipeAction[]) => void): () => void {
        const swipesCol = collection(firestore, 'sessions', sessionId, 'swipes');
        return onSnapshot(swipesCol, snap => {
            const all: SwipeAction[] = snap.docs.map(doc => {
                return doc.data() as SwipeAction;
            });
            callback(all);
        });
    }
}