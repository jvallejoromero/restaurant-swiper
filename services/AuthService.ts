export interface AuthService {
    getCurrentUser(): Promise<User | null>;
    deleteUserData(userId: string): Promise<void>;
    signUp(email: string, pass: string, username: string): Promise<User>;
    signIn(identifier: string, pass: string): Promise<User>;
    signOut(): Promise<void>;

}

export type User = {
    uid:     string;
    email:   string;
    username: string;
    emailVerified: boolean;
};