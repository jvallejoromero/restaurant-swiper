import {
    arrayRemove,
    arrayUnion,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    onSnapshot,
    query,
    setDoc,
    Timestamp,
    updateDoc, where, writeBatch,
} from 'firebase/firestore';
import {firestore} from '@/firebase';
import {AppUserProfile, DatabaseService, SwipeAction, SwipingSession} from './DatabaseService';
import {LocationObject} from "expo-location";
import {uuid} from "expo-modules-core";

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

    async createSession(ownerId: string, location: LocationObject): Promise<SwipingSession> {
        const sessionId = uuid.v4();
        const sessionRef = doc(firestore, 'sessions', sessionId);
        const now = Timestamp.now();

        const session = {
            id: sessionId,
            createdBy: ownerId,
            location: location,
            participants: [ownerId],
            places: [],
            createdAt: now,
        };

        await setDoc(sessionRef, session);
        return session;
    }

    async addToSession(sessionId: string, userId: string): Promise<void> {
        const sessionRef = doc(firestore, 'sessions', sessionId);
        await updateDoc(sessionRef, {
            participants: arrayUnion(userId)
        });
    }
     async removeFromSession(sessionId: string, userId: string): Promise<void> {
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
     }

    async recordSwipe(sessionId: string, swipe: SwipeAction): Promise<void> {
        const swipeRef = doc(firestore, 'sessions', sessionId, 'swipes', `${swipe.userId}_${swipe.placeId}`);
        await setDoc(swipeRef, swipe);
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