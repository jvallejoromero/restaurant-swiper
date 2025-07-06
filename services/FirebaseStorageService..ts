import { StorageService } from "./StorageService";
import {getDownloadURL, getStorage, ref, uploadBytes} from "@firebase/storage";
import * as ImageManipulator from "expo-image-manipulator";

export class FirebaseStorageService implements StorageService {
    private storage = getStorage();

    async uploadProfilePicture(uid: string, fileUri: string): Promise<string> {
        const result = await ImageManipulator.manipulateAsync(
            fileUri,
            [{resize: {width: 800}}],
            {compress: 0.7, format: ImageManipulator.SaveFormat.JPEG}
        );

        const imageFile = await fetch(result.uri);
        const blob = await imageFile.blob();

        const storageRef = ref(this.storage, `profilePictures/${uid}`);
        await uploadBytes(storageRef, blob, {
            contentType: blob.type,
            cacheControl: 'public, max-age=86400'
        });

        return getDownloadURL(storageRef);
    }
}