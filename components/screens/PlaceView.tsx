import { View } from "react-native";
import React, {useState, useRef} from "react";
import Swiper from "react-native-deck-swiper";
import {useRouter} from "expo-router";
import {COLORS} from "@/constants/colors";
import { ForkAnimation } from "../animations/LoadingAnimations";
import {useGooglePlacesAPI} from "@/hooks/GooglePlacesAPIHook";
import GenericErrorScreen from "@/components/screens/GenericErrorScreen";
import AppLogoHeader from "@/components/headers/AppLogoHeader";
import SwipeableCard from "@/components/SwipeableCard";
import {Place, PlaceType} from "@/types/Places.types";

interface PlaceViewProps {
    type: PlaceType;
}

const PlaceView = ({ type }: PlaceViewProps) => {
    const router = useRouter();
    const [cardIndex, setCardIndex] = useState<number>(0);

    const { places, loadingPlaces, errorLoading, lastLocationUsed, loadMorePlaces } = useGooglePlacesAPI(type, false);
    const swiperRef = useRef<Swiper<Place> | null>(null);

    const handleTopSwipe = (index: number) => {
        swiperRef.current?.swipeBack();
        setCardIndex(cardIndex - 1);

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
    }

    if (loadingPlaces) {
        return <ForkAnimation />;
    }

    if (errorLoading) {
        // TODO: Show popup warning instead, depending on error message
        return <GenericErrorScreen message={errorLoading} />;
    }

    if (lastLocationUsed && (lastLocationUsed.coords.latitude === 0 && lastLocationUsed.coords.longitude === 0)) {
        if (!lastLocationUsed.mocked) {
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
                cardIndex={cardIndex}
                onSwipeLeft={() => console.log("<==== Swiped left")}
                onSwipeRight={() => console.log("Swiped right ====>")}
                onSwipeUp={(index) => {handleTopSwipe(index)}}
                onCardIndexChange={(index) => {setCardIndex(index)}}
                onExhaustOptions={loadMorePlaces}
            />
        </View>
    );
}

export default PlaceView;