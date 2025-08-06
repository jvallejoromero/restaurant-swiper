export interface StorageService {
    uploadProfilePicture(uid: string, fileUri: string): Promise<string>;
    deleteProfilePicture(uid: string): Promise<void>;

    deleteFile(remotePath: string): Promise<void>;
    addFile(fileUri: string, remotePath: string): Promise<void>;
}