import * as FileSystem from "expo-file-system";
import * as Crypto from "expo-crypto";
import {CryptoDigestAlgorithm} from "expo-crypto";

async function urlToFileName(url: string): Promise<string> {
    const hash = await Crypto.digestStringAsync(
        CryptoDigestAlgorithm.SHA256,
        url
    );
    return hash + ".jpg";
}

async function wipeCacheFolder() {
    const folderPath = FileSystem.cacheDirectory!;
    const files = await FileSystem.readDirectoryAsync(folderPath);
    await Promise.all(
        files.map(name =>
            FileSystem.deleteAsync(folderPath + name, { idempotent: true })
        )
    );
    console.log("WIPED CACHE FOLDER");
}

export async function cacheProfilePicture(remoteUrl: string, userId: string): Promise<string> {
    const fileName = await urlToFileName(remoteUrl);
    const folderPath = FileSystem.cacheDirectory + `profilePictures/${userId}/`;
    const localPath = folderPath + fileName;

    try {
        const folderInfo = await FileSystem.getInfoAsync(folderPath);
        if (!folderInfo.exists) {
            await FileSystem.makeDirectoryAsync(folderPath, { intermediates: true });
        }

        const files = await FileSystem.readDirectoryAsync(folderPath);
        for (const file of files) {
            if (file === fileName) {
                continue;
            }
            await FileSystem.deleteAsync(folderPath + file, { idempotent: true });
        }

        const fileInfo = await FileSystem.getInfoAsync(localPath);
        if (!fileInfo.exists) {
            await FileSystem.downloadAsync(remoteUrl, localPath);
            console.log("downloaded new profile picture for ", userId);
        } else {
            console.log("using cached profile picture for", userId);
        }
    } catch (error) {
        console.error("Could not download profile picture", error);
    }
    return localPath;
}