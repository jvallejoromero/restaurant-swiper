import {PlaceDetails, PlaceReview} from "@/types/GoogleResponse.types";
import {haversine} from "@/utils/LocationUtils";
import {LocationObject} from "expo-location";

const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_API_KEY;

export const mapReviews = (reviews: any[]): PlaceReview[] => {
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

export const mapPhotos = (photos: any[]): string[] => {
    if (!photos || !Array.isArray(photos)) {
        return [];
    }
    return photos.map(photo => {
        return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1200&photo_reference=${photo.photo_reference}&key=${GOOGLE_API_KEY}`;
    });
};

export const fetchPlaceDetails = async(placeId: string | string[]): Promise<(PlaceDetails | null)> => {
    const endpoint = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}`;
    const fields = 'adr_address,business_status,formatted_address,' +
        'geometry,name,photo,type,url,vicinity,wheelchair_accessible_entrance,' +
        'formatted_phone_number,international_phone_number,opening_hours,website,' +
        'curbside_pickup,delivery,dine_in,editorial_summary,price_level,rating,' +
        'reservable,reviews,serves_beer,serves_breakfast,serves_brunch,serves_dinner,' +
        'serves_lunch,serves_vegetarian_food,serves_wine,takeout,user_ratings_total';

    console.log("--- New API Request ---");
    console.log(`${endpoint}&fields=${fields}&key=${GOOGLE_API_KEY}`);
    console.log("--- END API Request ---");

    try {
        const res =  await fetch(`${endpoint}&fields=${fields}&key=${GOOGLE_API_KEY}`);
        const data = await res.json();

        if (data.result) {
            const placeDetails: PlaceDetails = {
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

                reviews: mapReviews(data.result.reviews),
                photos: mapPhotos(data.result.photos),
            }
            console.log("Fetched data for ", placeDetails.name);
            return placeDetails;
        }
    } catch (err) {
        console.error(err);
    }
    return null;
}

export const fetchPlaces = async(location: LocationObject, radius: number, type: string, nextPageToken:string | null)
    : Promise<{ places: Place[], nextPageToken: (string | null)}> => {
    const latitude = location.coords.latitude;
    const longitude = location.coords.longitude;

    if (!latitude || !longitude) {
        return { places:[], nextPageToken: null };
    }

    let newPageToken = null;
    let apiUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=${type}&key=${GOOGLE_API_KEY}`;

    console.log("---- New API request ---- ");
    if (nextPageToken) {
        console.log("Has next page token: YES");
        apiUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?key=${GOOGLE_API_KEY}&pagetoken=${nextPageToken}`;
    }
    console.log(apiUrl);
    console.log("---- END New API request ---- ");

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
            ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1200&photo_reference=${item.photos[0].photo_reference}&key=${GOOGLE_API_KEY}`
            : null,
        images: item.photos?.map((photo: { photo_reference: string }) => `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1200&photo_reference=${photo.photo_reference}&key=${GOOGLE_API_KEY}`)
            ?? [item.icon], // Fallback if no photos are available
        openNow: item.opening_hours?.open_now,
        latitude: item.geometry?.location.latitude,
        longitude: item.geometry?.location.longitude,
        distanceFromUser: haversine(latitude, longitude, item.geometry?.location.lat, item.geometry?.location.lng),
    }))

    if (data.next_page_token) {
        newPageToken = data.next_page_token;
    }

    return { places, nextPageToken: newPageToken };
}