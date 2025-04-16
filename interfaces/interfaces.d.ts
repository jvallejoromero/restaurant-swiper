// Define the type for the Google Places API response
interface Place {
    id: string;
    name: string;
    vicinity: string;
    description?: string;
    photoUrl: string;
    rating: number;
    openNow: boolean;
    latitude: number;
    longitude: number;
    distanceFromUser: number;
}