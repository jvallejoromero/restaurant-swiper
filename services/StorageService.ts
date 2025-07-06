export interface StorageService {
    uploadProfilePicture(uid: string, fileUri: string): Promise<string>;
}