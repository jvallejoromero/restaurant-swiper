import {View} from "react-native";
import React from "react";
import TouristAttractionView from "@/components/TouristAttractionView";

const Attractions = () => {
    return(
        <View className="flex-1 bg-background">
            <View className="flex-1 mt-5">
                <TouristAttractionView />
            </View>
        </View>
    )
}

export default Attractions;