import {doc, getDoc, onSnapshot, setDoc} from 'firebase/firestore';
import {firestore} from '@/firebase'; // your initialized Firestore instance
import {DatabaseService, Swipe, UserProfile, Session} from './DatabaseService';

export class FirebaseDatabaseService implements DatabaseService {


    async getUserProfile(uid: string): Promise<UserProfile | null> {
        const ref = doc(firestore, 'users', uid);
        const snap = await getDoc(ref);
        return snap.exists() ? (snap.data() as UserProfile) : null;
    }

    async updateUserProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
        const ref = doc(firestore, 'users', uid);
        await setDoc(ref, data, { merge: true });
    }

    // real time updates
    onUserProfile(uid: string, callback: (profile: UserProfile | null) => void): () => void {
        const ref = doc(firestore, 'users', uid);
        return onSnapshot(ref, snap => {
            callback(snap.exists() ? (snap.data() as UserProfile) : null);
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