import React from 'react'
import {useLocalSearchParams} from "expo-router";
import PlaceDetailsView from "@/components/PlaceDetailsView";

const AttractionDetails = () => {
    const params = useLocalSearchParams<{id: string}>();
    return (
        <PlaceDetailsView id={params.id}/>
    )
}

export default AttractionDetails;