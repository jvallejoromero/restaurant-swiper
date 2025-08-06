import { StorageService } from "./StorageService";
import {deleteObject, getDownloadURL, getStorage, ref, uploadBytes} from "@firebase/storage";
import * as ImageManipulator from "expo-image-manipulator";

export class FirebaseStorageService implements StorageService {
    private storage = getStorage();

    async uploadProfilePicture(uid: string, fileUri: string): Promise<string> {
        const result = await ImageManipulator.manipulateAsync(
            fileUri,
            [{resize: {width: 800}}],
            {compress: 0.7, format: ImageManipulator.SaveFormat.JPEG}
        );

        const remotePath = `profilePictures/${uid}`;
        await this.addFile(result.uri, remotePath);

        const storageRef = ref(this.storage, remotePath);
        return getDownloadURL(storageRef);
    }

    async deleteProfilePicture(uid: string): Promise<void> {
        const fileUri = `profilePictures/${uid}`;
        await this.deleteFile(fileUri);
    }

    async deleteFile(fileUri: string): Promise<void> {
        const storageRef = ref(this.storage, fileUri);
        try {
            await deleteObject(storageRef);
        } catch (err) {
            console.warn("Failed to delete file", err);
            throw new Error("Could not delete file.");
        }
    }

    async addFile(fileUri: string, remotePath: string): Promise<void> {
        const response = await fetch(fileUri);
        const blob = await response.blob();

        const storageRef = ref(this.storage, remotePath);
        try {
            await uploadBytes(storageRef, blob, {
                contentType: blob.type,
                cacheControl: 'public, max-age=86400',
            });
        } catch (err) {
            console.warn("Failed to add file", err);
            throw new Error("Could not add file.");
        }
    }
}