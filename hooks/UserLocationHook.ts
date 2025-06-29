import {LocationObject} from "expo-location";
import {createContext, useEffect, useState} from "react";
import * as Location from "expo-location";

export function useUserLocation() {
    const [loading, setLoading] = useState(true);
    const [location, setLocation] = useState<LocationObject | null>(null);

    useEffect(() => {
        let mounted = true;

        const getUserLocation = async () => {
            try {
                const res = await Location.requestForegroundPermissionsAsync();
                if (res.status !== "granted") {
                    setLocation(null);

                    //TODO: show a visual message
                    console.log("User denied location access");
                    return;
                }

                const location = await Location.getCurrentPositionAsync();
                if (!location) {
                    setLocation(null);

                    console.log("Location not found.");
                    return;
                }

                if (!mounted) {
                    return;
                }

                console.log("--- Current location information ---");
                console.log("Latitude: ", location.coords.latitude);
                console.log("Latitude: ", location.coords.longitude);
                setLocation(location);
            } catch (error) {
                console.log("Could not get location info", error);
            } finally {
                setLoading(false);
            }
        };

        void getUserLocation();

        return () => {
            mounted = false;
        }
    }, [])

    return { fetchingLocation: loading, userLocation: location };
}