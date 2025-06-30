import {useContext, useEffect, useRef, useState} from "react";
import {UserLocationContext} from "@/context/UserLocationContext";
import { fetchPlaces } from "@/utils/GoogleAPIUtils";
import {PlaceViewType} from "@/components/screens/PlaceView";
import {LocationObject} from "expo-location";
import {createMockLocation, randomizeLocation} from "@/utils/LocationUtils";


const shuffleArray = (array: Place[]) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};


export function useGooglePlacesAPI(type: PlaceViewType, pagination: boolean = true) {
    // const { userLocation } = useContext(UserLocationContext);
    const userLocation = createMockLocation(0,0);

    const [places, setPlaces] = useState<Place[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [radius, setRadius] = useState<number>(10_000);
    const [nextPageToken, setNextPageToken] = useState<string | null>(null);
    const [lastLocationUsed, setLastLocationUsed] = useState<LocationObject | null>(null);

    const didFetchInitial = useRef<boolean>(false);

    const mergeUnique = (fetched: Place[]) => {
        setPlaces(prev => {
            const unique = fetched.filter(p => !prev.some(old => old.id === p.id));
            return [...prev, ...shuffleArray(unique)];
        });
    };

    const loadMorePlaces = () => {
        if (!userLocation) {
            setError("User location is required.");
            setLoading(false);
            return;
        }

        let newCoords;
        if (!userLocation?.coords.latitude || !userLocation?.coords.latitude) {
            newCoords = { newLatitude: 0, newLongitude: 0 };
        } else {
            newCoords = randomizeLocation(userLocation.coords.latitude, userLocation.coords.longitude, 5, 10);
        }

        const newLocation = createMockLocation(newCoords.newLatitude, newCoords.newLongitude);
        void loadPlacesFromLocation(newLocation);
    }

    const loadPlacesFromLocation = async (newLocation: LocationObject) => {
        if (!newLocation) {
            setError("User location is required.");
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        setLastLocationUsed(newLocation);

        try {
            const { places: fetched, nextPageToken: newPageToken } = await fetchPlaces(newLocation, radius, type, nextPageToken);
            mergeUnique(fetched);

            if (newPageToken && pagination) {
                setNextPageToken(newPageToken);
            } else {
                setLoading(false);
                setNextPageToken(null);
            }
        } catch (error) {
            setError(String(error));
            setLoading(false);
            setNextPageToken(null);
        }
    }

    // initial load
    useEffect(() => {
        if (!userLocation) {
            setError("User location is required.");
            setLoading(false);
            return;
        }

        if (didFetchInitial.current) {
            return;
        }

        didFetchInitial.current = true;
        setLastLocationUsed(userLocation);
        setLoading(true);
        setError(null);

        const fetchInitialData = async () => {
            try {
                const { places: fetched, nextPageToken: newPageToken } = await fetchPlaces(userLocation, radius, type, null);
                mergeUnique(fetched);

                if (newPageToken && pagination) {
                    setNextPageToken(newPageToken);
                } else {
                    setLoading(false);
                    setNextPageToken(null);
                }
            } catch (error) {
                setError(String(error));
                setLoading(false);
                setNextPageToken(null);
            }
        }

        void fetchInitialData();
        return () => {}
    }, [userLocation]);

    // pagination
    useEffect(() => {
        if (!nextPageToken || !userLocation || !pagination) {
            return;
        }

        const delayFetch = setTimeout(async () => {
            try {
                const { places: fetched, nextPageToken: newPageToken } = await fetchPlaces(userLocation, radius, type, nextPageToken);
                mergeUnique(fetched);

                if (newPageToken) {
                    setNextPageToken(newPageToken);
                } else {
                    setLoading(false);
                    setNextPageToken(null);
                }
            } catch (error) {
                setError(String(error));
                setLoading(false);
                setNextPageToken(null);
            }
        }, 2000);

        return () => clearTimeout(delayFetch);
    }, [nextPageToken]);

    return { places, loadingPlaces: loading, errorLoading: error, lastLocationUsed, setRadius, loadMorePlaces };
}