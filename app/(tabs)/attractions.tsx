import {SafeAreaView, View} from "react-native";
import React from "react";
import TouristAttractionView from "@/components/screens/TouristAttractionView";
import AppLogoHeader from "@/components/headers/AppLogoHeader";

const Attractions = () => {
    return(
        <SafeAreaView className="flex-1">
            <View className="px-5 mt-4">
                <AppLogoHeader />
            </View>
            <TouristAttractionView />
        </SafeAreaView>
    );
}

export default Attractions;