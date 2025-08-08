import {ApiService} from "@/services/ApiService";
import {LocationObject} from "expo-location";
import {Place, PlaceType} from "@/types/Places.types";
import {PlaceDetails} from "@/types/GoogleResponse.types";
import {haversine} from "@/utils/LocationUtils";

const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_API_KEY ?? '';
const GOOGLE_PLACES_BASE_URL = "https://places.googleapis.com/v1";

export class GoogleApiService implements ApiService {

    async fetchPlaceDetails(placeId: string): Promise<PlaceDetails | null> {
        const url = `${GOOGLE_PLACES_BASE_URL}/places/${placeId}`;
        const fieldMask = [
            'id',
            'displayName',
            'formattedAddress',
            'businessStatus',
            'googleMapsUri',
            'accessibilityOptions',
            'location',
            'viewport',
            'photos',
            'plusCode'
        ].join(',');

        const res = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Goog-Api-Key': GOOGLE_API_KEY,
                    'X-Goog-FieldMask': fieldMask,
                }
            }
        );

        if (!res.ok) {
            const err = await res.text();
            throw new Error(`Place Details failed: ${res.status} ${err}`);
        }

        const data = await res.json();
        return {
            name:              data.displayName,
            formatted_address: data.formattedAddress,
            business_status:   data.businessStatus,
            url:               data.googleMapsUri,
            geometry: {
                location: data.location,
                viewport: data.viewport
            },
            photos: (data.photos || []).map((p: any) =>
                `${GOOGLE_PLACES_BASE_URL}/${p.name}/media` +
                `?maxWidthPx=1200` +
                `&key=${GOOGLE_API_KEY}`
            ),
            plus_code: data.plusCode
        };
    }

    async fetchAllPlaces(location: LocationObject, radius: number, type: PlaceType, pagination?: boolean): Promise<Place[]> {
        const allPlaces: Place[] = [];
        let nextPageToken: string | null = null;
        const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

        try {
            do {
                const { places, nextPageToken: newToken } = await this.fetchPlaces(
                    location,
                    radius,
                    type,
                    nextPageToken
                );
                const newUnique = places.filter(
                    p => !allPlaces.some(existing => existing.id === p.id)
                );
                allPlaces.push(...newUnique);
                nextPageToken = pagination ? newToken : null;

                if (nextPageToken) {
                    await delay(2000); // Google API delay requirement
                }
            } while (nextPageToken);
        } catch (e) {
            console.warn(`Failed to fetch ${type} places: ${e}`);
            throw new Error(`Could not fetch places of type: ${type}`);
        }
        return allPlaces;
    }

    async fetchPlaces(location: LocationObject, radius: number, type: PlaceType, nextPageToken: string | null): Promise<{
        places: Place[],
        nextPageToken: string | null,
    }> {
        const { latitude, longitude } = location.coords;
        if (!latitude || !longitude) {
            return { places: [], nextPageToken: null };
        }

        const url = `${GOOGLE_PLACES_BASE_URL}/places:searchNearby`;
        const fieldMask = [
            'places.id',
            'places.displayName',
            'places.formattedAddress',
            'places.photos',
            'places.location',
            'places.types',
        ].join(',');
        const body = {
            locationRestriction: {
                circle: { center: { latitude, longitude }, radius }
            },
            includedTypes: [type],
            maxResultCount: 20
        };

        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Goog-Api-Key': GOOGLE_API_KEY,
                'X-Goog-FieldMask': fieldMask
            },
            body: JSON.stringify(body)
        });

        if (!res.ok) {
            const errText = await res.text();
            console.warn(`Nearby Search failed ${res.status}:`, errText);
            throw new Error(errText);
        }

        const data = await res.json();
        const filteredResults = data.places.filter((item: any) => {
            const types = item.types || [];
            return types.includes(type)
                && !types.includes("lodging")
                && !types.includes("movie_theater")
                && !types.includes("theatre")
                && !types.includes("supermarket")
                && !types.includes("grocery_store");
        });

        const places: Place[] = filteredResults.map((item: any) => {
            const firstPhoto = item.photos?.[0];
            const photoUrl = firstPhoto
                ? `${GOOGLE_PLACES_BASE_URL}/${firstPhoto.name}/media` +
                `?maxWidthPx=1200` +
                `&key=${GOOGLE_API_KEY}`
                : null;

            return {
                id: item.id,
                name: item.displayName.text,
                vicinity: item.formattedAddress,
                photoUrl,
                images: (item.photos || []).map((p: any) =>
                    `${GOOGLE_PLACES_BASE_URL}/${p.name}/media` +
                    `?maxWidthPx=1200` +
                    `&key=${GOOGLE_API_KEY}`
                ),
                latitude: item.location.latitude,
                longitude: item.location.longitude,
                distanceFromUser: haversine(latitude, longitude, item.location.latitude, item.location.longitude),
                type: type,
            }
        });

        return { places, nextPageToken: null };
    }
}