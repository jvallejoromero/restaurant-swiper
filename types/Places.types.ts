export type PlaceType = "restaurant" | "tourist_attraction";

export type Place = {
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
    type: PlaceType;
}