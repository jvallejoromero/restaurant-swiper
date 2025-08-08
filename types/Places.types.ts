export type PlaceType = "restaurant" | "tourist_attraction";

export type Place = {
    id: string;
    name: string;
    vicinity: string;
    photoUrl: string;
    openNow: boolean;
    latitude: number;
    longitude: number;
    distanceFromUser: number;
    rating?: number;
    type: PlaceType;
}