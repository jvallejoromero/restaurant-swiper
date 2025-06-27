import React from "react";
import PlaceDetailsView from "@/components/PlaceDetailsView";
import {useLocalSearchParams} from "expo-router";

const RestaurantDetails = () => {
    const params = useLocalSearchParams<{id: string}>();
    return (
        <PlaceDetailsView id={params.id}/>
    );
}

export default RestaurantDetails;