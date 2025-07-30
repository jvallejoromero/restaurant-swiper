import React, { useRef, useState } from "react";
import Swiper from "react-native-deck-swiper";
import { useActiveSwipingSession } from "@/context/SwipingSessionContext";
import SwipeableCard from "@/components/SwipeableCard";
import { Place } from "@/types/Places.types";
const SessionSwipingView = () => {
    const { activeSession } = useActiveSwipingSession();
    const [cardIndex, setCardIndex] = useState(0);
    const swiperRef = useRef<Swiper<Place> | null>(null);

    const handleTopSwipe = (index: number) => {
        swiperRef.current?.swipeBack();
        setCardIndex(cardIndex - 1);
    };

    if (!activeSession) {
        return null;
    }

    return (
        <SwipeableCard
            swiperRef={swiperRef}
            places={activeSession.places}
            fetchingData={false}
            cardIndex={cardIndex}
            onSwipeLeft={() => console.log("❌ Swiped left")}
            onSwipeRight={() => console.log("💚 Swiped right")}
            onSwipeUp={(index) => handleTopSwipe(index)}
            onCardIndexChange={(index) => setCardIndex(index)}
            onExhaustOptions={() => console.log("No more places in session.")}
        />
    );
};

export default SessionSwipingView;
