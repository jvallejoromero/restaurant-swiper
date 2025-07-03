import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut as fbSignOut,
    onAuthStateChanged,
    sendEmailVerification, signInWithCredential, GoogleAuthProvider,
} from "firebase/auth";
import {
    doc,
    getDoc,
    setDoc,
    serverTimestamp,
    deleteDoc,
} from "firebase/firestore";

import { AuthService, User } from "./AuthService";
import { auth, firestore } from "@/firebase";

export class FirebaseAuthService implements AuthService {
    async getCurrentUser(): Promise<User | null> {
        return new Promise((resolve, reject) => {
            const unsubscribe = onAuthStateChanged(auth, async fbUser => {
                unsubscribe();
                if (!fbUser) {
                    resolve(null);
                    return;
                }
                try {
                    // fetch profile doc under /users/{uid}
                    const userRef = doc(firestore, "users", fbUser.uid);
                    const snap = await getDoc(userRef);

                    if (!snap.exists()) {
                        // no profile found
                        resolve({ uid: fbUser.uid, email: fbUser.email!, username: "", emailVerified: fbUser.emailVerified });
                        return;
                    }
                    // resolve all fields for User object
                    const data = snap.data();
                    resolve({uid: fbUser.uid, email: fbUser.email!, username: data.username, emailVerified: fbUser.emailVerified });
                } catch (err) {
                    reject(err);
                }
            })
        });
    }

    async deleteUserData(userId: string): Promise<void> {
        const userRef = doc(firestore, "users", userId);
        const snap = await getDoc(userRef);
        if (!snap.exists()) {
            throw new Error("User not found");
        }

        const usernameDoc = doc(firestore, "usernames", snap.data().username);
        const usernameSnap = await getDoc(usernameDoc);
        if (!usernameSnap.exists()) {
            throw new Error(`Could not find username information for user: ${userId}`);
        }

        try {
            await deleteDoc(userRef);
            await deleteDoc(usernameDoc);
        } catch (error) {
            console.error("Failed to delete user data for", userId, error);
            throw new Error("Could not complete user deletion. Please try again.");
        }
    }

    async signUp(email: string, pass: string, username: string): Promise<User> {
        // check username availability
        const usernameKey = username.toLowerCase();
        const usernameDoc = doc(firestore, "usernames", usernameKey);
        if ((await getDoc(usernameDoc)).exists()) {
            throw new Error("Username already taken!");
        }

        // create profile user
        const cred = await createUserWithEmailAndPassword(auth, email, pass);
        const { uid } = cred.user;

        // send email verification
        await sendEmailVerification(cred.user);

        // write profile and other associated information
        await setDoc(doc(firestore, "users", uid), {
            email: email,
            username: usernameKey,
            createdAt: serverTimestamp(),
        });
        await setDoc(usernameDoc, {
            uid,
            email
        })

        return { uid: cred.user.uid, email: cred.user.email!, username: usernameKey, emailVerified: cred.user.emailVerified };
    }

    async signIn(identifier: string, pass: string): Promise<User> {

        const idTrim = identifier.trim();
        let emailToUse = null;
        let uidToUse = null;

        if (idTrim.includes("@")) {
            // logging in by email
            emailToUse = idTrim;
        } else {
            // logging in by username
            const unameKey = idTrim.toLowerCase();
            const snap = await getDoc(doc(firestore, "usernames", unameKey));
            if (!snap.exists()) {
                throw new Error("No account found with that username!");
            }
            const profile = snap.data()!;
            uidToUse = profile.uid;
            emailToUse = profile.email;
        }

        // authenticate with Firebase Auth
        const cred = await signInWithEmailAndPassword(auth, emailToUse, pass);

        // ensure we have the uid (in case we logged in by email)
        const finalUid = uidToUse ?? cred.user.uid;

        // fetch the user’s profile to get their username
        const profileSnap = await getDoc(doc(firestore, "users", finalUid));
        if (!profileSnap.exists()) {
            throw new Error("User profile missing. Please contact support.");
        }
        const profile = profileSnap.data()!;

        return {
            uid:      cred.user.uid,
            email:    cred.user.email!,
            username: profile.username as string,
            emailVerified: cred.user.emailVerified,
        };
    }

    async signInWithGoogle(idToken: string, accessToken: string): Promise<User> {
        await signInWithCredential(auth, GoogleAuthProvider.credential(idToken, accessToken));
        const appUser = await this.getCurrentUser();

        if (!appUser) {
            throw new Error("Google sign-in succeeded but no user profile found");
        }
        return appUser;
    }


    async signOut(): Promise<void> {
        await fbSignOut(auth);
    }
}
