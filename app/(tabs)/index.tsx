import {SafeAreaView, View, Text, ScrollView} from "react-native";
import RestaurantView from "@/components/screens/RestaurantView";
import AppLogoHeader from "@/components/headers/AppLogoHeader";
import React, {useEffect, useRef} from "react";
import {useActiveSwipingSession} from "@/context/SwipingSessionContext";
import SessionStatusButton from "@/components/buttons/SessionStatusButton";
import {useServices} from "@/context/ServicesContext";
import CurrentSessionInfoPopup from "@/components/popups/CurrentSessionInfoPopup";
import {PopupMessageRef} from "@/components/popups/PopupMessage";

const Index = () => {
    const { user } = useServices();
    const { activeSession } = useActiveSwipingSession();

    const activeSessionPopupRef = useRef<PopupMessageRef>(null);

    const handleSessionButtonPress = async () => {
        if (activeSession) {
            activeSessionPopupRef.current?.open();
        }
    }

    return (
        <SafeAreaView className="flex-1">
            <View className="px-5 mt-4 flex-row justify-between items-center">
                <AppLogoHeader />
                {user !== null && <SessionStatusButton active={activeSession !== null} onPress={handleSessionButtonPress} />}
            </View>
            <RestaurantView />
            <CurrentSessionInfoPopup session={activeSession} popupRef={activeSessionPopupRef} />
        </SafeAreaView>
    );
}

export default Index;