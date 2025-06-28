import React from "react";
import PlaceDetailsView from "@/components/screens/PlaceDetailsView";
import {useLocalSearchParams} from "expo-router";

const RestaurantDetails = () => {
    const params = useLocalSearchParams<{ id: string }>();

    return (
        <PlaceDetailsView id={params.id}/>
    );
}

export default RestaurantDetails;