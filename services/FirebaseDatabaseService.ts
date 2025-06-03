import {
    doc,
    getDoc,
    onSnapshot,
    setDoc,
    deleteDoc,
} from 'firebase/firestore';
import {firestore} from '@/firebase';
import {DatabaseService, Swipe, AppUserProfile, Session} from './DatabaseService';

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

    createSession(userId: string): Promise<Session> {
        const session: Session = {
            id: "temp",
            participants: [],
            createdAt: new Date(),
        };
        return Promise.resolve(session);
    }

    joinSession(sessionId: string, userId: string): Promise<void> {
        return Promise.resolve(undefined);
    }

    onSessionSwipes(sessionId: string, callback: (swipes: Swipe[]) => void): () => void {
        return function () {
        };
    }

    recordSwipe(sessionId: string, swipe: Swipe): Promise<void> {
        return Promise.resolve(undefined);
    }
}