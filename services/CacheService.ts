import {GeoCache} from "@/cache/GeoCache";
import {Place} from "@/types/Places.types";
import {PlaceDetails} from "@/types/GoogleResponse.types";
import {PersistentCache} from "@/cache/PersistentCache";
import { FirebasePhotoCache } from "@/cache/FirebasePhotoCache";

export const restaurantsCache = new GeoCache<Place[]>({
    fileName: "restaurants-cache-v1.json",
    thresholdMeters: 2000,
    maxEntries: 100,
    mergeMeters: 120,
});

export const attractionsCache = new GeoCache<Place[]>({
    fileName: "attractions-cache-v1.json",
    thresholdMeters: 2000,
    maxEntries: 100,
    mergeMeters: 120,
});

export const placeDetailsCache = new PersistentCache<PlaceDetails>({
    fileName: "place-details-cache-v1.json",
});

export const firebasePhotoCache = new FirebasePhotoCache({
    folder: "placePhotos",
    normalize: true,
    width: 1200,
    quality: 0.8,
});