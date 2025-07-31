import {useLocalSearchParams} from "expo-router";
import PlaceDetailsView from "@/components/screens/PlaceDetailsView";
import React from "react";

const PlaceDetails = () => {
    const params = useLocalSearchParams<{ id: string }>();
    if (!params?.id) {
        return null;
    }

    return (
        <PlaceDetailsView id={params.id} />
    );
}

export default PlaceDetails;