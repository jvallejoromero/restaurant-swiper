import {View} from "react-native";
import React, {useEffect, useRef, useState} from "react";
import Swiper from "react-native-deck-swiper";
import {useActiveSwipingSession} from "@/context/SwipingSessionContext";
import SwipeableCard from "@/components/SwipeableCard";
import {Place, PlaceType} from "@/types/Places.types";
import {useServices} from "@/context/ServicesContext";
import {SessionMatch, SessionStatus, SwipeAction, SwipeDirection} from "@/services/DatabaseService";
import {ForkAnimation} from "@/components/animations/LoadingAnimations";
import {LoadingCard} from "@/components/cards/LoadingCard";
import {SESSION_DEFAULTS} from "@/constants/sessionConstants";
import GenericButton from "@/components/buttons/GenericButton";
import {Timestamp} from "firebase/firestore";
import {useToast} from "@/context/ToastContext";
import {ToastType} from "@/hooks/useToastHook";
import { StatusTextScreen } from "./StatusTextScreen";
import {useDebouncedAsyncCallback} from "@/hooks/useDebouncedAsyncCallback";
import MatchPopup from "@/components/popups/MatchPopup";

type SessionSwipingViewProps = {
    type: PlaceType;
};

const SessionSwipingView = ({ type }: SessionSwipingViewProps) => {
    const { user, database } = useServices();
    const { activeSession, participants, places, matches, loading } = useActiveSwipingSession();
    const { showToast } = useToast();

    const [cardIndex, setCardIndex] = useState<number>(0);
    const [matchQueue, setMatchQueue] = useState<SessionMatch[]>([]);

    const swiperRef = useRef<Swiper<Place> | null>(null);
    const isSwipingRef = useRef<boolean>(false);
    const seenMatchIds = useRef<Set<string>>(new Set());

    const filteredPlaces = places.filter((place: Place) => place.type === type);
    const participant = participants.find((p) => p.id === user?.uid);
    const currentIndex = participant?.currentIndexes?.[type];
    const isCardSynced = cardIndex === currentIndex || isSwipingRef.current;
    const currentMatch = matchQueue[0];

    const isReady =
        activeSession?.status !== SessionStatus.LOADING_INITIAL_PLACES &&
        activeSession?.status !== SessionStatus.LOADING_NEW_PLACES &&
        !loading && typeof currentIndex === "number";
    const outOfCards = isReady && filteredPlaces.length > 0 && currentIndex >= filteredPlaces.length;

    useEffect(() => {
        if (!isReady || isSwipingRef.current) return;
        setCardIndex(currentIndex);
        swiperRef.current?.jumpToCardIndex(currentIndex);
    }, [isReady, currentIndex]);

    useEffect(() => {
        if (!matches.length || !isReady) return;

        const now = Date.now();
        const unseenMatches = matches.filter(match => {
            if (!match.matchedAt) return false;

            const matchedAtMs = match.matchedAt.toMillis() ?? match.matchedAt.seconds * 1000;
            return now - matchedAtMs <= 3000;
        });

        const newMatches = unseenMatches.filter((m) => {
            const isAlreadyQueued = matchQueue.some(q => q.placeId === m.placeId);
            const isAlreadySeen = seenMatchIds.current.has(m.placeId);
            return !isAlreadyQueued && !isAlreadySeen;
        });
        if (!newMatches.length) return;

        newMatches.forEach(m => seenMatchIds.current.add(m.placeId));
        setMatchQueue(prev => [...prev, ...newMatches]);
    }, [isReady, matches]);

    const debouncedUpdateIndex = useDebouncedAsyncCallback(
        async (newIndex: number) => {
            if (!activeSession || !user) return;
            await database.updateParticipant(
                activeSession.id, user.uid,
                { [`currentIndexes.${type}`]: newIndex }
            );
        },
        1200
    );

    if (!activeSession || !user) return null;

    const handleTopSwipe = async () => {
        swiperRef.current?.swipeBack();
    };

    const handleLeftSwipe = async() => {
        if (!isSwipingRef.current) isSwipingRef.current = true;
        setCardIndex(cardIndex + 1);
        await recordSwipe(cardIndex, false);
    }

    const handleRightSwipe = async() => {
        if (!isSwipingRef.current) isSwipingRef.current = true;
        setCardIndex(cardIndex + 1);
        await recordSwipe(cardIndex, true);
    }

    const recordSwipe = async (index: number, liked: boolean) => {
        const swipe: SwipeAction = {
            userId: user.uid,
            placeId: filteredPlaces[index].id,
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

    if (!isReady || !isCardSynced) {
        return <ForkAnimation />;
    }

    if (activeSession.status === SessionStatus.WAITING_FOR_USERS) {
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
    } else if (outOfCards) {
        return (
            <StatusTextScreen
                title="You're all caught up!"
                subtitle="Please wait for the host to load more places for the session."
            />
        );
    }

    return (
        <>
            {currentMatch && (
                <MatchPopup
                    place={places.find(p => p.id === currentMatch.placeId)!}
                    additionalCount={matchQueue.length - 1}
                    onHide={() =>
                        setMatchQueue(prev => prev.slice(1))
                    }
                />
            )}
            <SwipeableCard
                swiperRef={swiperRef}
                places={filteredPlaces}
                fetchingData={loading}
                cardIndex={cardIndex}
                onSwipeLeft={handleLeftSwipe}
                onSwipeRight={handleRightSwipe}
                onSwipeUp={handleTopSwipe}
                onCardIndexChange={() => {}}
                onExhaustOptions={() => console.log(`No more places in session for type: ${type}`)}
            />
        </>
    );
};

export default SessionSwipingView;