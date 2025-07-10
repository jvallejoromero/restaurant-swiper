export interface StorageService {
    uploadProfilePicture(uid: string, fileUri: string): Promise<string>;
    deleteProfilePicture(uid: string): Promise<void>;
    deleteFile(fileUri: string): Promise<void>;
}