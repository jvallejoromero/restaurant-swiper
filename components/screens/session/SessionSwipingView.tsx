import {View} from "react-native";
import React, {useEffect, useRef, useState} from "react";
import Swiper from "react-native-deck-swiper";
import {useActiveSwipingSession} from "@/context/SwipingSessionContext";
import SwipeableCard from "@/components/SwipeableCard";
import {Place, PlaceType} from "@/types/Places.types";
import {useServices} from "@/context/ServicesContext";
import {SessionStatus, SwipeAction, SwipeDirection} from "@/services/DatabaseService";
import {ForkAnimation} from "@/components/animations/LoadingAnimations";
import {LoadingCard} from "@/components/cards/LoadingCard";
import {SESSION_DEFAULTS} from "@/constants/sessionConstants";
import GenericButton from "@/components/buttons/GenericButton";
import {Timestamp} from "firebase/firestore";
import {useToast} from "@/context/ToastContext";
import {ToastType} from "@/hooks/ToastHook";
import { StatusTextScreen } from "./StatusTextScreen";
import {useDebouncedAsyncCallback} from "@/hooks/DebouncedCallbackHook";

type SessionSwipingViewProps = {
    type: PlaceType;
};

const SessionSwipingView = ({ type }: SessionSwipingViewProps) => {
    const { user, database } = useServices();
    const { activeSession, participants, places, loading } = useActiveSwipingSession();
    const { showToast } = useToast();

    const [cardIndex, setCardIndex] = useState<number>(0);
    const swiperRef = useRef<Swiper<Place> | null>(null);
    const lastCardIndexRef = useRef<number | null>(null);
    const isSwipingRef = useRef<boolean>(false);

    const filteredPlaces = places.filter((place: Place) => place.type === type);

    useEffect(() => {
        if (loading || !places.length || !swiperRef.current || !user) return;
        const participant = participants.find((p) => p.id === user?.uid);
        if (!participant) return;

        const currentIndex = participant.currentIndexes[type];
        if (!currentIndex) return;
        if (lastCardIndexRef.current === currentIndex || isSwipingRef.current) return;

        setCardIndex(currentIndex);
        lastCardIndexRef.current = currentIndex;
        swiperRef.current?.jumpToCardIndex(currentIndex);
    }, [loading, places, participants, user]);

    const debouncedUpdateIndex = useDebouncedAsyncCallback(
        async (newIndex: number) => {
            if (!activeSession || !user) return;
            await database.updateParticipant(
                activeSession.id, user.uid,
                { [`currentIndexes.${type}`]: newIndex }
            );
        },
        1000
    );

    if (!activeSession || !user) return null;

    const handleTopSwipe = () => {
        swiperRef.current?.swipeBack();
    };

    const handleLeftSwipe = async() => {
        isSwipingRef.current = true;
        setCardIndex(cardIndex + 1);
        await recordSwipe(cardIndex, false);
    }

    const handleRightSwipe = async() => {
        isSwipingRef.current = true;
        setCardIndex(cardIndex + 1);
        await recordSwipe(cardIndex, true);
    }

    const recordSwipe = async (index: number, liked: boolean) => {
        const swipe: SwipeAction = {
            userId: user.uid,
            placeId: places[index].id,
            direction: liked ? SwipeDirection.RIGHT : SwipeDirection.LEFT,
            liked: liked,
            swipedAt: Timestamp.now(),
        };

        try {
            await database.recordSwipe(activeSession.id, swipe);
            await debouncedUpdateIndex(index + 1);
        } catch (e) {
            if (e instanceof Error) showToast(e.message, ToastType.ERROR);
            else showToast("An unknown error occurred.", ToastType.ERROR);
        }
    }

    const startSession = async () => {
        await database.updateSession(activeSession.id,
            { status: SessionStatus.LOADING_INITIAL_PLACES }
        );
    };

    const isOwner = user?.uid === activeSession.createdBy;

    if (activeSession.status === SessionStatus.LOADING_INITIAL_PLACES ||
        activeSession.status === SessionStatus.LOADING_NEW_PLACES) {
        return <ForkAnimation />;
    } else if (activeSession.status === SessionStatus.WAITING_FOR_USERS) {
        return (
            <View className="flex-1 justify-center items-center px-8">
                <LoadingCard
                    title="Waiting for more users to join the session..."
                    subtitle={`You need ${SESSION_DEFAULTS.MIN_PARTICIPANTS - activeSession.participantCount} more participant${SESSION_DEFAULTS.MIN_PARTICIPANTS - activeSession.participantCount === 1 ? '' : 's'} to start.`}
                />
            </View>
        );
    } else if (activeSession.status === SessionStatus.READY_FOR_START) {
        if (isOwner) {
            return (
                <StatusTextScreen
                    title={"Ready to start your session!"}
                    subtitle={"Press the button below to begin loading places for everyone."}
                >
                    <View className="w-[70%]">
                        <GenericButton text={"Load Places"} onPress={startSession} />
                    </View>
                </StatusTextScreen>
            );
        } else {
            return (
                <StatusTextScreen
                    title={"Waiting for the host to start the session"}
                    subtitle={"Sit tight — places will start loading soon."}
                />
            );
        }
    } else if (activeSession.status === SessionStatus.ENDED) {
        return (
            <StatusTextScreen
                title={"Session Ended"}
                subtitle={"The session has ended because there are not enough participants to continue."}
            />
        );
    } else if (activeSession.status === SessionStatus.EXPIRED) {
        return (
            <StatusTextScreen
                title={"Session Expired"}
                subtitle={"This session expired due to inactivity or exceeded its time limit."}
            />
        );
    }

    return (
        <SwipeableCard
            swiperRef={swiperRef}
            places={filteredPlaces}
            fetchingData={false}
            cardIndex={cardIndex}
            onSwipeLeft={handleLeftSwipe}
            onSwipeRight={handleRightSwipe}
            onSwipeUp={handleTopSwipe}
            onCardIndexChange={() => {}}
            onExhaustOptions={() => console.log("No more places in session.")}
        />
    );
};

export default SessionSwipingView;
