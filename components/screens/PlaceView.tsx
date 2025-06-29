import { View } from "react-native";
import React, {useEffect, useState, useRef, useContext} from "react";
import Swiper from "react-native-deck-swiper";
import {useRouter} from "expo-router";
import {COLORS} from "@/constants/colors";
import {createMockLocation, randomizeLocation} from "@/utils/LocationUtils";
import { UserLocationContext } from '@/context/UserLocationContext';
import { ForkAnimation } from "../animations/LoadingAnimations";
import {useGooglePlacesAPI} from "@/hooks/GooglePlacesAPIHook";
import GenericErrorScreen from "@/components/screens/GenericErrorScreen";
import {LocationObject} from "expo-location";
import AppLogoHeader from "@/components/headers/AppLogoHeader";
import SwipeableCard from "@/components/SwipeableCard";

export type PlaceViewType = "restaurant" | "tourist_attraction";

interface PlaceViewProps {
    type: PlaceViewType;
}

const PlaceView = ({ type }: PlaceViewProps) => {
    const router = useRouter();
    const [lastLocation, setLastLocation] = useState<LocationObject | null>(null);
    const [cardIndex, setCardIndex] = useState<number>(0);

    const { places, loadingPlaces, errorLoading, loadPlacesFromLocation } = useGooglePlacesAPI(type, false);
    const { userLocation: currentLocation } = useContext(UserLocationContext);

    const swiperRef = useRef<Swiper<Place> | null>(null);

    const handleTopSwipe = (index: number) => {
        swiperRef.current?.swipeBack();
        if (type === 'restaurant') {
            router.push({
                pathname: '/restaurant/[id]',
                params: { id: places[index].id },
            });
        } else if (type === 'tourist_attraction') {
            router.push({
                pathname: '/attraction/[id]',
                params: {id: places[index].id}
            });
        }
        return false;
    }

    const refetchData = async () => {
        let newCoords;
        if (!lastLocation?.coords.latitude || !lastLocation?.coords.latitude) {
            newCoords = { newLatitude: 0, newLongitude: 0 };
        } else {
            newCoords = randomizeLocation(lastLocation.coords.latitude, lastLocation.coords.longitude, 5, 10);
        }

        const newLocation = createMockLocation(newCoords.newLatitude, newCoords.newLongitude);
        setLastLocation(newLocation);

        void loadPlacesFromLocation(newLocation);
    }

    useEffect(() => {
        setLastLocation(currentLocation);
    }, [currentLocation]);

    if (loadingPlaces) {
        return <ForkAnimation />;
    }

    if (errorLoading) {
        return <GenericErrorScreen message={errorLoading} />;
    }

    if (lastLocation && (lastLocation.coords.latitude === 0 && lastLocation.coords.longitude === 0)) {
        if (lastLocation.mocked) {
            return;
        }

        return <GenericErrorScreen message={"No places found on null island."} />
    }

    return (
        <View style={{flex: 1, backgroundColor: COLORS.background_color, zIndex: 9999}}>
            <AppLogoHeader />
            <SwipeableCard
                swiperRef={swiperRef}
                places={places}
                fetchingData={loadingPlaces}
                onSwipeLeft={() => console.log("<==== Swiped left")}
                onSwipeRight={() => console.log("Swiped right ====>")}
                onSwipeUp={(index) => {handleTopSwipe(index)}}
                cardIndex={cardIndex}
                onCardIndexChange={(index) => {
                    setCardIndex(index);
                }}
                onExhaustOptions={refetchData}
            />
        </View>
    );
}

export default PlaceView;