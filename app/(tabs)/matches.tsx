import React, {useRef} from "react";
import { View } from "react-native";
import { useActiveSwipingSession } from "@/context/SwipingSessionContext";
import SessionMatches from "@/components/screens/matches/SessionMatches";
import AppLogoHeader from "@/components/headers/AppLogoHeader";
import SessionStatusButton from "@/components/buttons/SessionStatusButton";
import CurrentSessionInfoPopup from "@/components/popups/CurrentSessionInfoPopup";
import {PopupMessageRef} from "@/components/popups/PopupMessage";
import {useServices} from "@/context/ServicesContext";
import {ForkAnimation} from "@/components/animations/LoadingAnimations";

const Matches = () => {
    const { user } = useServices();
    const { sessionResolved, loading, activeSession, matches, places } = useActiveSwipingSession();

    const activeSessionPopupRef = useRef<PopupMessageRef>(null);

    if (sessionResolved === null || loading) {
        return <ForkAnimation />;
    }

    return (
        <View className="flex-1 pt-safe flex-col gap-3">
            <View className="px-5 mt-4 flex-row justify-between items-center">
                <AppLogoHeader />
                {user && (
                    <SessionStatusButton
                        active={!!activeSession}
                        onPress={() => activeSession && activeSessionPopupRef.current?.open()}
                    />
                )}
            </View>

            {activeSession && (
                <SessionMatches matches={matches} places={places} />
            )}

            <CurrentSessionInfoPopup
                session={activeSession}
                popupRef={activeSessionPopupRef}
            />
        </View>
    );
};

export default Matches;
