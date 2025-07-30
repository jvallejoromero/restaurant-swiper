import { useServices } from "@/context/ServicesContext";
import {useActiveSwipingSession} from "@/context/SwipingSessionContext";
import { PopupMessageRef } from "../popups/PopupMessage";
import React, { useRef } from "react";
import {SafeAreaView, View} from "react-native";
import AppLogoHeader from "@/components/headers/AppLogoHeader";
import SessionStatusButton from "@/components/buttons/SessionStatusButton";
import CurrentSessionInfoPopup from "@/components/popups/CurrentSessionInfoPopup";
import { PlaceType } from "@/types/Places.types";

type SwipingScreenLayoutProps = {
    placeType: PlaceType;
    children?: React.ReactNode;
};

const SwipingScreenLayout = ({ placeType, children }: SwipingScreenLayoutProps) => {
    const { user } = useServices();
    const { activeSession } = useActiveSwipingSession();
    const activeSessionPopupRef = useRef<PopupMessageRef>(null);

    const handleSessionButtonPress = () => {
        if (activeSession) {
            activeSessionPopupRef.current?.open();
        }
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
            {children}
            <CurrentSessionInfoPopup
                session={activeSession}
                popupRef={activeSessionPopupRef}
            />
        </SafeAreaView>
    );
};

export default SwipingScreenLayout;
