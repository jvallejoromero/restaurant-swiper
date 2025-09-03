import {GeoCache} from "@/cache/GeoCache";
import {Place} from "@/types/Places.types";
import {PlaceDetails} from "@/types/GoogleResponse.types";
import {PersistentCache} from "@/cache/PersistentCache";
import { FirebasePhotoCache } from "@/cache/FirebasePhotoCache";
import {storage} from "@/firebase";

let _restaurantsCache: GeoCache<Place[]> | null = null;
export function getRestaurantsCache() {
    if (!_restaurantsCache) {
        _restaurantsCache = new GeoCache<Place[]>({
            fileName: "restaurants-cache-v1.json",
            thresholdMeters: 2000,
            maxEntries: 100,
            mergeMeters: 120,
        });
    }
    return _restaurantsCache;
}

let _attractionsCache: GeoCache<Place[]> | null = null;
export function getAttractionsCache() {
    if (!_attractionsCache) {
        _attractionsCache =  new GeoCache<Place[]>({
            fileName: "attractions-cache-v1.json",
            thresholdMeters: 2000,
            maxEntries: 100,
            mergeMeters: 120,
        });
    }
    return _attractionsCache;
}

let _placeDetailsCache: PersistentCache<PlaceDetails> | null = null;
export function getPlaceDetailsCache() {
    if (!_placeDetailsCache) {
        _placeDetailsCache = new PersistentCache<PlaceDetails>({
            fileName: "place-details-cache-v1.json",
        });
    }
    return _placeDetailsCache;
}

let _photoCache: FirebasePhotoCache | null = null;
export function getFirebasePhotoCache() {
    if (!_photoCache) _photoCache = new FirebasePhotoCache(storage, {
        folder: "placePhotos",
        normalize: true,
        width: 1200,
        quality: 0.8,
    });
    return _photoCache;
}