import {ApiService} from "@/services/ApiService";
import {LocationObject} from "expo-location";
import {Place, PlaceType} from "@/types/Places.types";
import {LegacyPlaceDetails, PlaceReview} from "@/types/GoogleResponse.types";
import {haversine} from "@/utils/LocationUtils";
import {attractionsCache, placeDetailsCache, restaurantsCache} from "@/services/CacheService";

const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_API_KEY;
const GOOGLE_PLACES_BASE_URL = "https://maps.googleapis.com/maps/api/place";

export class GoogleLegacyApiService implements ApiService {
    private cacheFor(type: PlaceType) {
        return type === "restaurant" ? restaurantsCache : attractionsCache;
    }

    // $0.007 per image load
    private mapPhotos(photos: any[]): string[] {
        if (!photos || !Array.isArray(photos)) {
            return [];
        }
        return photos.map(photo => {
            return `${GOOGLE_PLACES_BASE_URL}/photo?maxwidth=1200&photo_reference=${photo.photo_reference}&key=${GOOGLE_API_KEY}`;
        });
    };

    private mapReviews(reviews: any[]): PlaceReview[] {
        if (!reviews || !Array.isArray(reviews)) {
            return [];
        }
        return reviews.map(review => ({
            author_name: review?.author_name,
            relative_time_description: review?.relative_time_description,
            language: review?.language,
            original_language: review?.original_language,
            text: review?.text,
            profile_photo_url: review?.profile_photo_url,
            time: review?.time,
            rating: review?.rating,
            translated: review?.translated,
        }));
    };

    // $0.032 per request
    // usually paginates 3 times if enabled
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

        const cache = this.cacheFor(type);
        await cache.add(location.coords.latitude, location.coords.longitude, allPlaces);

        return allPlaces;
    }

    // $0.034 per request
    async fetchPlaceDetails(placeId: string): Promise<LegacyPlaceDetails | null> {
        const endpoint = `${GOOGLE_PLACES_BASE_URL}/details/json`;
        const fields = [
            "adr_address", "business_status", "formatted_address", "geometry", "name", "photo", "type", "url",
            "vicinity", "wheelchair_accessible_entrance", "formatted_phone_number", "international_phone_number",
            "opening_hours", "website", "curbside_pickup", "delivery", "dine_in", "editorial_summary",
            "price_level", "rating", "reservable", "reviews", "serves_beer", "serves_breakfast", "serves_brunch",
            "serves_dinner", "serves_lunch", "serves_vegetarian_food", "serves_wine", "takeout", "user_ratings_total"
        ].join(",");
        const url = `${endpoint}?place_id=${placeId}&fields=${fields}&key=${GOOGLE_API_KEY}`;

        console.log("--- New API Request ---");
        console.log(url);
        console.log("--- END API Request ---");

        try {
            const res =  await fetch(url);
            const data = await res.json();

            if (data.result) {
                const placeDetails: LegacyPlaceDetails = {
                    name: data.result.name,
                    address: data.result.adr_address,
                    formatted_address: data.result.formatted_address,
                    business_status: data.result.business_status,
                    formatted_phone_number: data.result.formatted_phone_number,
                    international_phone_number: data.result.international_phone_number,
                    url: data.result.url,
                    vicinity: data.result.vicinity,
                    website: data.result.website,

                    curbside_pickup: data.result.curbside_pickup,
                    delivery: data.result.delivery,
                    dine_in: data.result.dine_in,
                    reservable: data.result.reservable,
                    serves_beer: data.result.serves_beer,
                    serves_breakfast: data.result.serves_breakfast,
                    serves_brunch: data.result.serves_brunch,
                    serves_dinner: data.result.serves_dinner,
                    serves_lunch: data.result.serves_lunch,
                    serves_vegetarian_food: data.result.serves_vegetarian_food,
                    serves_wine: data.result.serves_wine,
                    takeout: data.result.takeout,
                    wheelchair_accessible_entrance: data.result.wheelchair_accessible_entrance,

                    price_level: data.result.price_level,
                    user_ratings_total: data.result.user_ratings_total,
                    rating: data.result.rating,

                    opening_hours: {
                        open_now: data.result.opening_hours?.open_now,
                        periods: data.result.opening_hours?.periods,
                        special_days: data.result.opening_hours?.special_days,
                        type: data.result.opening_hours?.type,
                        weekday_text: data.result.opening_hours?.weekday_text,
                    },
                    current_opening_hours: {
                        open_now: data.result.current_opening_hours?.open_now,
                        periods: data.result.current_opening_hours?.periods,
                        special_days: data.result.current_opening_hours?.special_days,
                        type: data.result.current_opening_hours?.type,
                        weekday_text: data.result.current_opening_hours?.weekday_text,
                    },
                    editorial_summary: {
                        language: data.result.editorial_summary?.language,
                        overview: data.result.editorial_summary?.overview,
                    },
                    geometry: {
                        location: {
                            lat: data.result.geometry?.location?.lat || 0,
                            lng: data.result.geometry?.location?.lng || 0,
                        },
                        viewport: data.result.geometry?.viewport || {
                            northeast: { lat: 0, lng: 0 },
                            southeast: { lat: 0, lng: 0 },
                        },
                    },

                    reviews: this.mapReviews(data.result.reviews),
                    photos: this.mapPhotos(data.result.photos),
                    plus_code: {global_code: ''},
                }
                console.log("Fetched data for ", placeDetails.name);
                await placeDetailsCache.add(placeId, placeDetails);
                return placeDetails;
            }
        } catch (err) {
            console.error(err);
        }
        return null;
    }

    // $0.032 per request
    /**
     * @deprecated Use {@link fetchAllPlaces} instead.
     * This method only fetches a single page of results and does not handle caching correctly.
     * It is kept backward-compatible, but should not be used directly.
     */
    async fetchPlaces(location: LocationObject, radius: number, type: PlaceType, nextPageToken: string | null): Promise<{
        places: Place[];
        nextPageToken: string | null
    }> {
        const latitude = location.coords.latitude;
        const longitude = location.coords.longitude;

        if (!latitude || !longitude) {
            return { places:[], nextPageToken: null };
        }

        const cache = this.cacheFor(type);
        const hit = await cache.get(latitude, longitude);
        if (hit) {
            return { places: hit as Place[], nextPageToken: null };
        }

        let newPageToken = null;
        let apiUrl = `${GOOGLE_PLACES_BASE_URL}/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=${type}&key=${GOOGLE_API_KEY}`;

        console.log("---- New Legacy API request ---- ");
        if (nextPageToken) {
            console.log("Has next page token: YES");
            apiUrl = `${GOOGLE_PLACES_BASE_URL}/nearbysearch/json?key=${GOOGLE_API_KEY}&pagetoken=${nextPageToken}`;
        }
        console.log(apiUrl);
        console.log("---- END Legacy API request ---- ");

        const res = await fetch(apiUrl);
        const data = await res.json();

        if (data.status !== "OK") {
            const errorMessage = data.error_message;
            console.error("Could not fetch places from Google API", errorMessage);
            throw new Error(errorMessage);
        }

        if (!data.results) {
            console.log("No data received.");
            return { places: [], nextPageToken: null };
        }

        // Filter out results that are not strictly places.
        const filteredResults = data.results.filter((item: any) => {
            const types = item.types || [];
            return types.includes(type)
                && !types.includes("lodging")
                && !types.includes("movie_theater")
                && !types.includes("theatre");
        });

        // Map the API data to match the Place type
        const places: Place[] = filteredResults.map((item: any) => ({
            id: item.place_id,
            name: item.name,
            vicinity: item.vicinity,
            rating: item.rating,
            description: item.description || "No description available", // handle missing descriptions
            photoUrl: item.photos?.[0]
                ? `${GOOGLE_PLACES_BASE_URL}/photo?maxwidth=1200&photo_reference=${item.photos[0].photo_reference}&key=${GOOGLE_API_KEY}`
                : null,
            images: item.photos?.map((photo: { photo_reference: string }) => `${GOOGLE_PLACES_BASE_URL}/photo?maxwidth=1200&photo_reference=${photo.photo_reference}&key=${GOOGLE_API_KEY}`)
                ?? [item.icon], // Fallback if no photos are available
            openNow: item.opening_hours?.open_now,
            latitude: item.geometry?.location.latitude,
            longitude: item.geometry?.location.longitude,
            distanceFromUser: haversine(latitude, longitude, item.geometry?.location.lat, item.geometry?.location.lng),
            type: type,
        }))

        if (data.next_page_token) {
            newPageToken = data.next_page_token;
        }

        return { places, nextPageToken: newPageToken };
    }

}