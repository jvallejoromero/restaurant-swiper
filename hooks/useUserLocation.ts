import {LocationObject} from "expo-location";
import {createContext, useEffect, useRef, useState} from "react";
import * as Location from "expo-location";

export function useUserLocation() {
    const [loading, setLoading] = useState(true);
    const [location, setLocation] = useState<LocationObject | null>(null);
    const mounted = useRef<boolean>(true);

    useEffect(() => {
        mounted.current = true;

        const getUserLocation = async () => {
            try {
                const res = await Location.requestForegroundPermissionsAsync();
                if (res.status !== "granted") {
                    setLocation(null);

                    //TODO: show a visual message
                    console.log("User denied location access");
                    return;
                }

                const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });

                if (!location) {
                    setLocation(null);

                    console.log("Location not found.");
                    return;
                }

                if (!mounted.current) {
                    return;
                }

                console.log("--- Current location information ---");
                console.log("Latitude: ", location.coords.latitude);
                console.log("Latitude: ", location.coords.longitude);
                setLocation(location);
            } catch (error) {
                console.log("Could not get location info", error);
            } finally {
                if (mounted.current) setLoading(false);
            }
        };

        void getUserLocation();

        return () => {
            mounted.current = false;
        }
    }, [])

    return { fetchingLocation: loading, userLocation: location };
}