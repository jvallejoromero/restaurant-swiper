import {SafeAreaView, View} from "react-native";
import React, {useRef} from "react";
import TouristAttractionView from "@/components/screens/TouristAttractionView";
import AppLogoHeader from "@/components/headers/AppLogoHeader";
import SessionStatusButton from "@/components/buttons/SessionStatusButton";
import CurrentSessionInfoPopup from "@/components/popups/CurrentSessionInfoPopup";
import {useServices} from "@/context/ServicesContext";
import {useActiveSwipingSession} from "@/context/SwipingSessionContext";
import {PopupMessageRef} from "@/components/popups/PopupMessage";

const Attractions = () => {
    const { user } = useServices();
    const { activeSession } = useActiveSwipingSession();
    const activeSessionPopupRef = useRef<PopupMessageRef>(null);

    const handleSessionButtonPress = async () => {
        if (activeSession) {
            activeSessionPopupRef.current?.open();
        }
    }

    return(
        <SafeAreaView className="flex-1">
            <View className="px-5 mt-4 flex-row justify-between items-center">
                <AppLogoHeader />
                {user !== null && <SessionStatusButton active={activeSession !== null} onPress={handleSessionButtonPress} />}
            </View>
            <TouristAttractionView />
            <CurrentSessionInfoPopup session={activeSession} popupRef={activeSessionPopupRef} />
        </SafeAreaView>
    );
}

export default Attractions;