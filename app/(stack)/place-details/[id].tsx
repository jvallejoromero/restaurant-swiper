import {useLocalSearchParams} from "expo-router";
import LegacyPlaceDetailsView from "@/components/screens/LegacyPlaceDetailsView";
import React from "react";
import {useServices} from "@/context/ServicesContext";
import {GoogleLegacyApiService} from "@/services/GoogleLegacyApiService";
import {GoogleApiService} from "@/services/GoogleApiService";
import PlaceDetailsView from "@/components/screens/PlaceDetailsView";
import GenericErrorScreen from "@/components/screens/GenericErrorScreen";

const PlaceDetails = () => {
    const { googleApi } = useServices();

    const params = useLocalSearchParams<{ id: string }>();
    if (!params?.id) {
        return null;
    }

    if (googleApi instanceof GoogleLegacyApiService) {
        return <LegacyPlaceDetailsView id={params.id} />;
    } else if (googleApi instanceof GoogleApiService) {
        return <PlaceDetailsView id={params.id} />;
    } else {
        return <GenericErrorScreen message={"Unsupported api version"} />;
    }
}

export default PlaceDetails;