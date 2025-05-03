export interface AuthService {
    /** Returns current user object or null */
    getCurrentUser(): Promise<User | null>;

    /** Register a new account */
    signUp(email: string, pass: string, username: string): Promise<User>;

    /** Sign in existing user */
    signIn(identifier: string, pass: string): Promise<User>;

    /** Sign out */
    signOut(): Promise<void>;
}

export type User = {
    uid:     string;
    email:   string;
    username: string;
    emailVerified: boolean;
};