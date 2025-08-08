import { LocationObject } from "expo-location";
import { Place, PlaceType } from "@/types/Places.types";
import {PlaceDetails} from "@/types/GoogleResponse.types";

export interface ApiService {
    fetchPlaceDetails(placeId: string): Promise<PlaceDetails | null>;
    fetchPlaces(location: LocationObject, radius: number, type: PlaceType, nextPageToken: string | null): Promise<{ places: Place[]; nextPageToken: string | null }>;
    fetchAllPlaces(location: LocationObject, radius: number, type: PlaceType, pagination?: boolean): Promise<Place[]>;
}
