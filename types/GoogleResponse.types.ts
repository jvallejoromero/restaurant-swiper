export interface PlaceDetails {
    name: {
        languageCode: string;
        text: string;
    };
    formatted_address: string;
    business_status: BusinessStatus;
    url: string;
    geometry: Geometry;
    photos: string[];
    plus_code: PlusCode;
}

/**
 * @deprecated Use `PlaceDetails` instead.
 *
 * This interface reflects the **old Google Places Details API response** shape
 * The new Places API (Places API v1 / Places Details v1) returns
 * nested objects such as `name: { text, languageCode }` instead of plain strings,
 * and these fields may no longer match the current responses.
 *
 * Do not rely on this type for new code — it may not align with Google’s latest API.
 */
export interface LegacyPlaceDetails extends PlaceDetails {
    address: string;
    formatted_phone_number: string;
    international_phone_number: string;
    vicinity: string;
    website: string;

    curbside_pickup: boolean;
    delivery: boolean;
    dine_in: boolean;
    reservable: boolean;
    serves_beer: boolean;
    serves_breakfast: boolean;
    serves_brunch: boolean;
    serves_dinner: boolean;
    serves_lunch: boolean;
    serves_vegetarian_food: boolean;
    serves_wine: boolean;
    takeout: boolean;
    wheelchair_accessible_entrance: boolean;

    price_level: number;
    rating: number;
    user_ratings_total: number;

    opening_hours: PlaceOpeningHours;
    current_opening_hours: PlaceOpeningHours;
    editorial_summary: PlaceEditorialSummary;

    reviews: Array<PlaceReview>;
}

// Contains a summary of the place. A summary is comprised of a textual overview, and also includes the language code for these if applicable.
// Summary text must be presented as-is and can not be modified or altered.
export type PlaceEditorialSummary = {
    language: string;
    overview: string;
}

// An object describing the location.
export type Geometry = {
    location: LatLngLiteral;
    viewport: Bounds;
}

// An object describing a specific location with Latitude and Longitude in decimal degrees
export type LatLngLiteral = {
    latitude: number;
    longitude: number;
}

// A rectangle in geographical coordinates from points at the southwest and northeast corners
export type Bounds = {
    northeast: LatLngLiteral;
    southeast: LatLngLiteral;
}

// An object describing the opening hours of a place.
export type PlaceOpeningHours = {
    open_now: boolean;
    periods: Array<PlaceOpeningHours>
    special_days: Array<PlaceSpecialDay>;
    type: string;
    weekday_text: Array<string>;
}

export type PlaceSpecialDay = {
    date: string;
    exceptional_hours: boolean;
}

export type PlaceReview = {
    author_name: string;
    relative_time_description: string;
    language: string;
    original_language: string;
    text: string;
    profile_photo_url: string;
    time: number;
    rating: number;
    translated: boolean;
}

export type PlusCode = {
    compoundCode?: string;
    globalCode: string;
};

export type BusinessStatus = "OPERATIONAL" | "CLOSED_TEMPORARILY" | "CLOSED_PERMANENTLY";
