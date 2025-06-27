
// types for Google API response
export type PlaceDetails = {
    name: string;
    address: string;
    formatted_address: string;
    business_status: BusinessStatus;
    formatted_phone_number: string;
    international_phone_number: string;
    url: string;
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
    geometry: Geometry;

    reviews: Array<PlaceReview>;
    photos: Array<string>;
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
    lat: number;
    lng: number;
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

export type BusinessStatus = "OPERATIONAL" | "CLOSED_TEMPORARILY" | "CLOSED_PERMANENTLY";
