import { useServices } from "@/context/ServicesContext";
import {useActiveSwipingSession} from "@/context/SwipingSessionContext";
import { PopupMessageRef } from "../popups/PopupMessage";
import React, {useRef} from "react";
import {SafeAreaView, View} from "react-native";
import AppLogoHeader from "@/components/headers/AppLogoHeader";
import SessionStatusButton from "@/components/buttons/SessionStatusButton";
import CurrentSessionInfoPopup from "@/components/popups/CurrentSessionInfoPopup";
import { PlaceType } from "@/types/Places.types";
import { ForkAnimation } from "../animations/LoadingAnimations";
import PlaceView from "@/components/screens/PlaceView";
import SessionSwipingView from "@/components/screens/session/SessionSwipingView";
import {StatusTextScreen} from "@/components/screens/session/StatusTextScreen";

type SwipingScreenLayoutProps = {
    placeType: PlaceType;
};

const PLACE_TYPE_LABELS: Record<PlaceType, string> = {
    restaurant: "restaurant",
    tourist_attraction: "attraction",
};

const SwipingScreenLayout = ({ placeType }: SwipingScreenLayoutProps) => {
    const { user } = useServices();
    const { activeSession, sessionResolved, loading } = useActiveSwipingSession();

    const activeSessionPopupRef = useRef<PopupMessageRef>(null);

    const handleSessionButtonPress = () => {
        if (activeSession) {
            activeSessionPopupRef.current?.open();
        }
    }

    if (sessionResolved === null || loading) {
        return <ForkAnimation />;
    }

    const invalidPlaceType = activeSession && !activeSession.placeTypes.includes(placeType);
    const PlaceTypeNotSupported = () => {
        let readablePlaceType;
        switch (placeType) {
            case "restaurant":
                readablePlaceType = "restaurant";
                break;
            case "tourist_attraction":
                readablePlaceType = "attraction";
                break;
        }
        return (
            <StatusTextScreen
                title={"This category isn't part of the session"}
                subtitle={`The host has disabled ${readablePlaceType}s for this session. Please swipe in one of the allowed categories.`}
            />
        );
    }

    return (
        <SafeAreaView className="flex-1">
            <View className="px-5 mt-4 flex-row justify-between items-center">
                <AppLogoHeader />
                {user && (
                    <SessionStatusButton
                        active={!!activeSession}
                        onPress={handleSessionButtonPress}
                    />
                )}
            </View>

            {invalidPlaceType ? (
                <StatusTextScreen
                    title={"This category isn't part of the session"}
                    subtitle={`The host has disabled ${PLACE_TYPE_LABELS[placeType]}s for this session. Please swipe in one of the allowed categories.`}
                />
            ) : activeSession ? (
                <SessionSwipingView />
            ) : (
                <PlaceView type={placeType} />
            )}
            <CurrentSessionInfoPopup
                session={activeSession}
                popupRef={activeSessionPopupRef}
            />
        </SafeAreaView>
    );
};

export default SwipingScreenLayout;
