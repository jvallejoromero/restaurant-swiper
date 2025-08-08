import {useLocalSearchParams} from "expo-router";
import LegacyPlaceDetailsView from "@/components/screens/LegacyPlaceDetailsView";
import React from "react";

const PlaceDetails = () => {
    const params = useLocalSearchParams<{ id: string }>();
    if (!params?.id) {
        return null;
    }

    return (
        <LegacyPlaceDetailsView id={params.id} />
    );
}

export default PlaceDetails;