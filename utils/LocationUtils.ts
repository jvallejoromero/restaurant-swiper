// Randomize coordinates by a few miles
import {LocationObject} from "expo-location";

export const randomizeLocation = (latitude: number, longitude: number, minMiles: number, maxMiles: number): { newLatitude: number, newLongitude: number } => {
    // Random distance in miles between minMiles and maxMiles
    const randomDistanceInMiles = Math.random() * (maxMiles - minMiles) + minMiles;

    // Convert miles to degrees (1 degree latitude ~ 69 miles, longitude varies with latitude)
    const latOffset = randomDistanceInMiles / 69;
    const lngOffset = randomDistanceInMiles / (69 * Math.cos((latitude * Math.PI) / 180));

    // Random angle in radians (0 - 2*PI) to cover all directions uniformly
    const randomAngle = Math.random() * 2 * Math.PI;

    // Calculate offset using polar coordinates (angle and distance)
    const randomLat = latitude + latOffset * Math.sin(randomAngle); // Use sin for latitude offset
    const randomLng = longitude + lngOffset * Math.cos(randomAngle); // Use cos for longitude offset

    return { newLatitude: randomLat, newLongitude: randomLng };
};

// get distance in kilometers between two coordinates using the Haversine formula
export const haversine = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = toRad(lat2 - lat1);  // Difference in latitude
    const dLon = toRad(lon2 - lon1);  // Difference in longitude

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in kilometers
    return parseFloat(distance.toFixed(2));
}

export const createMockLocation = (lat: number, lng: number): LocationObject => {
    return {
        coords: {
            latitude: lat,
            longitude: lng,
            altitude: null,
            accuracy: null,
            altitudeAccuracy: null,
            heading: null,
            speed: null,
        },
        timestamp: Date.now(),
        mocked: true,
    };
}

// convert degrees to radians
const toRad = (degrees: number) => {
    return degrees * Math.PI / 180;
}