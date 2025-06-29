import {createContext, ReactNode} from "react";
import {LocationObject} from "expo-location";
import {useUserLocation} from "@/hooks/UserLocationHook";

type UserLocationContextProps = {
    userLocation: LocationObject | null;
    fetchingLocation: boolean;
}

export const UserLocationContext = createContext<UserLocationContextProps>({ userLocation: null, fetchingLocation: true });
export function UserLocationProvider({ children }: { children: ReactNode }) {
    const { fetchingLocation, userLocation } = useUserLocation();

    return (
        <UserLocationContext.Provider value={{ fetchingLocation, userLocation }} >
            {children}
        </UserLocationContext.Provider>
    );
}