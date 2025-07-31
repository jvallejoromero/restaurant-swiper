import {Button, Switch, Text, View} from "react-native";
import React, { useRef, useState } from "react";
import Swiper from "react-native-deck-swiper";
import { useActiveSwipingSession } from "@/context/SwipingSessionContext";
import SwipeableCard from "@/components/SwipeableCard";
import { Place } from "@/types/Places.types";
import DebugActiveSessionScreen from "@/components/screens/debug/DebugActiveSessionScreen";
import {useServices} from "@/context/ServicesContext";
import { SessionStatus } from "@/services/DatabaseService";
import {ForkAnimation, UsersConnectingAnimation} from "@/components/animations/LoadingAnimations";
import {LoadingCard} from "@/components/cards/LoadingCard";
import {SESSION_DEFAULTS} from "@/constants/sessionConstants";
import GenericButton from "@/components/buttons/GenericButton";

const StatusTextScreen = ({ title, subtitle, children }: { title: string, subtitle: string, children?: React.ReactNode }) => {
    return (
        <View className={`flex-1 justify-center items-center px-6 ${children && "gap-10"}`}>
            <View className="gap-2">
                <Text className="text-center text-xl font-semibold text-gray-800">
                    {title}
                </Text>
                <Text className="text-base text-gray-500 text-center">
                    {subtitle}
                </Text>
            </View>
            {children && (
                <View className="w-full items-center">
                    {children}
                </View>
            )}
        </View>
    );
}

const SessionSwipingView = () => {
    const { user, database } = useServices();
    const { activeSession, places } = useActiveSwipingSession();
    const [cardIndex, setCardIndex] = useState<number>(0);
    const swiperRef = useRef<Swiper<Place> | null>(null);

    if (!activeSession) return null;

    const handleTopSwipe = (index: number) => {
        swiperRef.current?.swipeBack();
        setCardIndex(cardIndex - 1);
    };

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
            places={places}
            fetchingData={false}
            cardIndex={cardIndex}
            onSwipeLeft={() => console.log("❌ Swiped left")}
            onSwipeRight={() => console.log("💚 Swiped right")}
            onSwipeUp={handleTopSwipe}
            onCardIndexChange={setCardIndex}
            onExhaustOptions={() => console.log("No more places in session.")}
        />
    );
};

export default SessionSwipingView;
