import {LocationObject} from "expo-location";
import {useEffect, useState} from "react";
import * as Location from "expo-location";

export function useLocationName(location: LocationObject | null | undefined) {
    const [locationName, setLocationName] = useState<string | null>(null);
    const [fetchingLocationName, setFetchingLocationName] = useState<boolean>(false);

    useEffect(() => {
        let mounted = true;
        setFetchingLocationName(true);
        if (!location) {
            setLocationName("Unknown");
            setFetchingLocationName(false);
            return;
        }
        (async () => {
            const addresses = await Location.reverseGeocodeAsync(location.coords);
            if (addresses.length) {
                const { city, region, country } = addresses[0];
                const name = city || region || country || "Unknown";
                mounted && setLocationName(name);
            } else {
                mounted && setLocationName("Unknown");
            }
            mounted && setFetchingLocationName(false);
        })();

        return () => { mounted = false };
    }, [location]);

    return { fetchingLocationName, locationName };
}