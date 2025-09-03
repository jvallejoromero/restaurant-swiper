import {
    ref,
    getDownloadURL,
    getMetadata,
    uploadBytes,
    uploadString,
    FirebaseStorage
} from "@firebase/storage";
import * as ImageManipulator from "expo-image-manipulator";

type Options = {
    folder?: string;
    ttlMs?: number;
    normalize?: boolean;
    width?: number;
    quality?: number;
};

export class FirebasePhotoCache {
    private readonly storage: FirebaseStorage;
    private readonly oneMonthMs = 1000 * 60 * 60 * 24 * 30;

    private readonly folder: string;
    private readonly ttlMs: number;
    private readonly normalize: boolean;
    private readonly width: number;
    private readonly quality: number;

    constructor(storage: FirebaseStorage, opts: Options = {}) {
        this.storage = storage;
        this.folder = opts.folder ?? "placePhotos";
        this.ttlMs = opts.ttlMs ?? (this.oneMonthMs * 2);
        this.normalize = opts.normalize ?? false;
        this.width = opts.width ?? 1200;
        this.quality = opts.quality ?? 0.8;
    }

    private hash(s: string) {
        let h = 5381;
        for (let i = 0; i < s.length; i++) h = (h * 33) ^ s.charCodeAt(i);
        return (h >>> 0).toString(36);
    }

    async getUrl(remoteMediaUrl: string, attribution?: unknown): Promise<string> {
        const key = this.hash(remoteMediaUrl);
        const imgPath = `${this.folder}/${key}.jpg`;
        const metaPath = `${this.folder}/${key}.json`;
        const imgRef = ref(this.storage, imgPath);

        try {
            const meta = await getMetadata(imgRef);
            const savedAt = Number(meta.customMetadata?.savedAt ?? "0");
            const fresh = Date.now() - savedAt <= this.ttlMs;
            if (fresh) {
                console.log('hit firebase photo cache');
                const url = await getDownloadURL(imgRef);
                return `${url}${url.includes("?") ? "&" : "?"}v=${savedAt || 0}`;
            }
        } catch (e: any) {}

        let uploadBlob: Blob;
        let contentType = "image/jpeg";

        if (this.normalize) {
            const manipulated = await ImageManipulator.manipulateAsync(
                remoteMediaUrl,
                [{ resize: { width: this.width } }],
                { compress: this.quality, format: ImageManipulator.SaveFormat.JPEG }
            );
            const resp = await fetch(manipulated.uri);
            uploadBlob = await resp.blob();
            contentType = uploadBlob.type || "image/jpeg";
        } else {
            const resp = await fetch(remoteMediaUrl);
            uploadBlob = await resp.blob();
            contentType = uploadBlob.type || "image/jpeg";
        }

        const now = Date.now();
        const maxAgeSeconds = Math.floor(this.ttlMs / 1000);

        await uploadBytes(imgRef, uploadBlob, {
            contentType,
            cacheControl: `public, max-age=${maxAgeSeconds}`,
            customMetadata: { savedAt: String(Date.now()) },
        });

        if (attribution) {
            const jsonRef = ref(this.storage, metaPath);
            await uploadString(jsonRef, JSON.stringify({ attribution }), "raw", {
                contentType: "application/json",
                cacheControl: `public, max-age=${maxAgeSeconds}`,
                customMetadata: { savedAt: String(Date.now()) },
            });
        }

        const url = await getDownloadURL(imgRef);
        return `${url}${url.includes("?") ? "&" : "?"}v=${now}`;
    }
}
