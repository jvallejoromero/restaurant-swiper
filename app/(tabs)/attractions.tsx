import {Text, View} from 'react-native'
import React from 'react'
import TouristAttractionView from "@/components/TouristAttractionView";

const Attractions = () => {
    return(
        <View className="flex-1 bg-primary">
            <View className="flex-1 mt-5">
                <TouristAttractionView/>
            </View>
        </View>
    )
}

export default Attractions