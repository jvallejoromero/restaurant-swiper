import React, {useState, useRef} from "react";
import Swiper from "react-native-deck-swiper";
import {useRouter} from "expo-router";
import { ForkAnimation } from "../animations/LoadingAnimations";
import {useGooglePlacesAPI} from "@/hooks/GooglePlacesAPIHook";
import GenericErrorScreen from "@/components/screens/GenericErrorScreen";
import SwipeableCard from "@/components/SwipeableCard";
import {Place, PlaceType} from "@/types/Places.types";
import {StatusTextScreen} from "@/components/screens/session/StatusTextScreen";

interface PlaceViewProps {
    type: PlaceType;
}

const PlaceView = ({ type }: PlaceViewProps) => {
    const router = useRouter();
    const [cardIndex, setCardIndex] = useState<number>(0);

    const { places, loadingPlaces, errorLoading, loadMorePlaces } = useGooglePlacesAPI(type, false);

    const swiperRef = useRef<Swiper<Place> | null>(null);
    const hasSwipedRef = useRef<boolean>(false);

    const handleTopSwipe = (index: number) => {
        if (!places.length || !places[index].id) {
            return;
        }

        swiperRef.current?.swipeBack();
        setCardIndex(cardIndex - 1);

        router.push({
            pathname: '/place-details/[id]',
            params: { id: places[index].id },
        });
    }

    if (loadingPlaces) {
        return <ForkAnimation />;
    }

    if (errorLoading) {
        // TODO: Show popup warning instead, depending on error message
        return <GenericErrorScreen message={errorLoading} />;
    }

    if (!places.length && !hasSwipedRef.current) {
        return (
            <StatusTextScreen
                title="We couldn't find any place information"
                subtitle="Please try going to a different location."
            />
        );
    }

    return (
        <>
            <SwipeableCard
                swiperRef={swiperRef}
                places={places}
                fetchingData={loadingPlaces}
                cardIndex={cardIndex}
                onSwipeLeft={() => hasSwipedRef.current = true}
                onSwipeRight={() => hasSwipedRef.current = true}
                onSwipeUp={(index) => {handleTopSwipe(index)}}
                onCardIndexChange={(index) => {setCardIndex(index)}}
                onExhaustOptions={loadMorePlaces}
            />
        </>
    );
}

export default PlaceView;