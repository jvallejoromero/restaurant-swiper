import { Text, View, StyleSheet, TouchableOpacity, ScrollView, Linking, SafeAreaView } from "react-native";
import React, { useState, useEffect } from "react";
import { LinkIcon } from "lucide-react-native";
import { PlaceDetails } from "@/types/GoogleResponse.types";
import { ForkAnimation } from "@/components/animations/LoadingAnimations";
import GenericErrorScreen from "@/components/screens/GenericErrorScreen";
import ScrollableImageGallery from "@/components/image/ScrollableImageGallery";
import TitleText from "../headers/TitleText";
import BusinessStatusMessage from "@/components/status/BusinessStatusMessage";
import Subheader from "@/components/headers/Subheader";
import PlaceDetailsMap from "@/components/maps/PlaceDetailsMap";
import MapLink from "../buttons/MapLink";
import { FONTS } from "@/constants/fonts";
import BackNavigationHeader from "@/components/headers/BackNavigationHeader";
import Separator from "@/components/ui/Separator";
import { useServices } from "@/context/ServicesContext";
import { GoogleApiService } from "@/services/GoogleApiService";
import {useActiveSwipingSession} from "@/context/SwipingSessionContext"; // updated service

type PlaceDetailsProps = {
    id: string;
};

const PlaceWebsite = ({ url }: { url: string }) => {
    if (!url) return null;
    return (
        <View>
            <Subheader text={"Website"} />
            <TouchableOpacity onPress={() => Linking.openURL(url)}>
                <View style={{ flexDirection: "row", gap: 4 }}>
                    <Text style={{ color: "blue", fontSize: 15 }}>Go To Site</Text>
                    <LinkIcon color="blue" size={16} />
                </View>
            </TouchableOpacity>
        </View>
    );
};

const PlaceMapSection = ({ lat, lng, name, address }: { lat: number; lng: number; name: string; address: string }) => {
    return (
        <View className="gap-2">
            <Subheader text={"Location"} />
            <PlaceDetailsMap latitude={lat} longitude={lng} title={name} />

            <View style={{ gap: 2 }}>
                <Subheader text={"Address"} />
                <Text style={styles.text}>{address}</Text>
            </View>
        </View>
    );
};

const PlaceDetailsView = ({ id }: PlaceDetailsProps) => {
    const { googleApi } = useServices();
    const { database } = useServices();
    const { activeSession, sessionResolved, loading } = useActiveSwipingSession();

    if (!(googleApi instanceof GoogleApiService)) {
        return <GenericErrorScreen message="PlaceDetailsView requires the new API service" />;
    }

    const [placeDetails, setPlaceDetails] = useState<PlaceDetails | null>(null);
    const [isFetchingData, setFetchingData] = useState<boolean>(true);

    useEffect(() => {
        if (sessionResolved === null || loading) {
            return;
        }
        const loadDetails = async () => {
            let details;
            if (activeSession) {
                details = await database.getPlaceDetailsForSession(googleApi, activeSession.id, id);
            } else {
                details = await googleApi.fetchPlaceDetails(id);
            }
            setPlaceDetails(details);
            setFetchingData(false);
        };

        void loadDetails();
    }, [activeSession, sessionResolved, loading, id]);

    if (isFetchingData) {
        return <ForkAnimation />;
    }

    if (!placeDetails) {
        return <GenericErrorScreen message={"Could Not Load Place Information"} />;
    }

    const latitude = placeDetails.geometry.location?.latitude;
    const longitude = placeDetails.geometry.location?.longitude;

    return (
        <SafeAreaView className="flex-1 flex-col items-start justify-start bg-background">
            <BackNavigationHeader label={"Place Details"} />
            <Separator className={"my-3 mx-6"} />
            <ScrollView>
                <ScrollableImageGallery photoRefs={placeDetails.photos} />
                <View style={{ padding: 16, gap: 12 }}>
                    <View>
                        <TitleText text={placeDetails.name.text} />
                    </View>

                    <BusinessStatusMessage status={placeDetails.business_status} />
                    <PlaceWebsite url={placeDetails.url} />

                    <PlaceMapSection
                        lat={latitude}
                        lng={longitude}
                        name={placeDetails.name.text}
                        address={placeDetails.formatted_address}
                    />
                    <MapLink latitude={latitude} longitude={longitude} />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default PlaceDetailsView;

const styles = StyleSheet.create({
    text: {
        fontSize: FONTS.default_size,
    },
});
