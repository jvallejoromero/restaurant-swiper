import {Animated, Image} from "react-native";
import React, {RefObject, useEffect, useState} from "react";
import Swiper from "react-native-deck-swiper";
import PlaceViewCard from "@/components/cards/PlaceViewCard";
import {IMAGES} from "@/constants/images";
import {CardActionButtons} from "@/components/buttons/CardActionButtons";
import { Place } from "@/types/Places.types";

type SwipeableCardProps = {
    places: Place[];
    fetchingData: boolean;
    cardIndex: number;
    onSwipeLeft: () => void;
    onSwipeRight: () => void;
    onSwipeUp: (index: number) => void;
    onExhaustOptions: () => void;
    onCardIndexChange: (index: number) => void;
    swiperRef?: RefObject<Swiper<Place> | null>;
}

const SwipeableCard = ({ places, fetchingData, cardIndex, swiperRef, onSwipeLeft, onSwipeRight, onSwipeUp, onExhaustOptions, onCardIndexChange }: SwipeableCardProps) => {
    const [swipeProgressX] = useState(new Animated.Value(0));
    const [swiperKey, setSwiperKey] = useState<number>(0);

    const handleSwiping = (posX: number, _posY: number) => {
        swipeProgressX.setValue(posX);
    };

    const resetDeck = () => {setSwiperKey((prev) => prev + 1)}

    useEffect(() => {
        const allCardsSwiped = (cardIndex >= places.length && places.length > 0) && !fetchingData;

        if (allCardsSwiped) {
            console.log("All cards swiped, fetching new location...");
            resetDeck();
            onExhaustOptions();
        }
    }, [cardIndex]);

    return (
        <>
            <Swiper
                key={swiperKey}
                ref={swiperRef}
                cards={places}
                showSecondCard={true}
                backgroundColor={"transparent"}
                stackSize={2}
                cardStyle={{ marginTop: 10 }}
                cardVerticalMargin={50}
                cardHorizontalMargin={15}
                stackSeparation={0}
                infinite={false}
                disableBottomSwipe={true}
                stackAnimationFriction={20}
                stackAnimationTension={25}
                childrenOnTop={false}
                overlayOpacityHorizontalThreshold={50}
                animateOverlayLabelsOpacity={false}
                renderCard={(place: Place) => <PlaceViewCard place={place} />}
                onSwiping={(x,y) => {
                    handleSwiping(x,y);
                }}
                onSwiped={(index) => {
                    console.log('Swiped: ', (index + 1), "/", places.length);
                    onCardIndexChange(index + 1);
                    swipeProgressX.setValue(0);
                }}
                onSwipedLeft={onSwipeLeft}
                onSwipedRight={onSwipeRight}
                onSwipedTop={(index) => {
                    onSwipeUp(index);
                }}
                cardIndex={cardIndex}
                onSwipedAll={() => {}}
                animateCardOpacity={true}
                overlayLabels={{
                    left: {
                        element: (
                            <Image
                                source={IMAGES.nope_overlay}
                                style={{
                                    width: 110,
                                    height: 110,
                                    transform: [{ rotate: '35deg' }],
                                }}
                            />
                        ),
                        style: {
                            wrapper: {
                                flexDirection: 'column',
                                alignItems: 'flex-end',
                                justifyContent: 'flex-start',
                                marginTop: 50,
                                marginLeft: -20,
                            },
                        },
                    },
                    right: {
                        element: (
                            <Image
                                source={IMAGES.like_overlay}
                                style={{
                                    width: 100,
                                    height: 100,
                                    transform: [{ rotate: '-30deg' }],
                                }}
                            />
                        ),
                        style: {
                            wrapper: {
                                flexDirection: 'column',
                                alignItems: 'flex-start',
                                justifyContent: 'flex-start',
                                marginTop: 55,
                                marginLeft: 20,
                            },
                        },
                    },
                }}
            />
            <CardActionButtons
                onLike={() => {
                    swiperRef?.current?.swipeRight();
                }}
                onDislike={() => {
                    swiperRef?.current?.swipeLeft();
                }}
                onInfo={() => {
                    swiperRef?.current?.swipeTop();
                }}
                swipeProgressX={swipeProgressX}
            />
        </>
    );
}

export default SwipeableCard;