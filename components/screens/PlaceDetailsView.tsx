import {Text, View, StyleSheet, TouchableOpacity, ScrollView, Linking} from "react-native";
import React, { useState, useEffect} from "react"
import {LinkIcon} from "lucide-react-native";
import {PlaceDetails} from "@/utils/GoogleResponseTypes";
import {fetchPlaceDetails} from "@/utils/GoogleAPIUtils";
import {ForkAnimation} from "@/components/animations/LoadingAnimations";
import GenericErrorScreen from "@/components/screens/GenericErrorScreen";
import {GoBackButton} from "@/components/buttons/GoBackButton";
import ScrollableImageGallery from "@/components/image/ScrollableImageGallery";
import TitleText from "../headers/TitleText";
import TitleSubheader from "@/components/headers/TitleSubheader";
import BusinessStatusMessage from "@/components/status/BusinessStatusMessage";
import Subheader from "@/components/headers/Subheader";
import {getDollarsFromPriceLevel, getStringPriceLevel} from "@/utils/GoogleResponseUtils";
import {getStarsFromRating} from "@/utils/GoogleResponseUtils";
import BusinessOpeningHours from "@/components/status/BusinessOpeningHours";
import ReviewCard from "@/components/cards/ReviewCard";
import PlaceDetailsMap from "@/components/maps/PlaceDetailsMap";
import MapLink from "../buttons/MapLink";
import {FONTS} from "@/constants/fonts";

type PlaceDetailsProps = {
    id: string;
}

const PlaceRating = ({ rating }: { rating: number}) => {
    if (!rating) {
        return  <Subheader text={"No rating available"} />;
    }

    return (
        <View>
            <Subheader text={`Rating (${rating} / 5)`}/>
            <Text style={styles.text}>{getStarsFromRating(rating)}</Text>
        </View>
    );
}

const PlacePricing = ({ details }: { details: PlaceDetails }) => {
    return (
        <View>
            <Subheader text={`Pricing: ${getStringPriceLevel(details.price_level)}`} />
            <Text style={{fontSize: 16}}>{getDollarsFromPriceLevel(details.price_level)}</Text>
        </View>
    );
}

const PlaceWebsite = ({ website }: { website: string }) => {
    if (!website) return null;
    return (
        <View>
            <Subheader text={"Website"} />
            <TouchableOpacity onPress={() => Linking.openURL(website)}>
                <View style={{ flexDirection: 'row', gap: 4 }}>
                    <Text style={{ color: 'blue', fontSize: 15}}>Go To Site</Text>
                    <LinkIcon color="blue" size={16} />
                </View>
            </TouchableOpacity>
        </View>
    );
}

const PlacePhoneNumber = ({ phoneNumber }: { phoneNumber: string }) => {
    if (!phoneNumber) return null;
    return (
        <View>
            <Subheader text={"Phone number"} />
            <Text style={styles.text}>{phoneNumber}</Text>
        </View>
    );
}

const PlaceServices = ({ details }: { details: PlaceDetails }) => {
    return (
        <>
            <View
                style={{gap: 2,}}
            >
                <Subheader text={"Offers"} />
                <View
                    style={{gap: 7,}}
                >
                    {details.takeout && (
                        <Text style={styles.text}>Takeout ✅</Text>
                    )}
                    {details.curbside_pickup && (
                        <Text style={styles.text}>Curbside Pickup ✅</Text>
                    )}
                    {details.delivery && (
                        <Text style={styles.text}>Delivery ✅</Text>
                    )}
                    {details.dine_in && (
                        <Text style={styles.text}>Dining In ✅</Text>
                    )}
                    {details.reservable && (
                        <Text style={styles.text}>Reservations ✅</Text>
                    )}
                    {details.wheelchair_accessible_entrance && (
                        <Text style={styles.text}>Wheelchair Accessibility ✅</Text>
                    )}
                </View>
            </View>

            <View
                style={{gap: 2,}}
            >
                <Subheader text={"Serving Options"} />
                <View
                    style={{gap: 7,}}
                >
                    {details.serves_breakfast && (
                        <Text style={styles.text}>Breakfast ✅</Text>
                    )}
                    {details.serves_brunch && (
                        <Text style={styles.text}>Brunch ✅</Text>
                    )}
                    {details.serves_lunch && (
                        <Text style={styles.text}>Lunch ✅</Text>
                    )}
                    {details.serves_dinner && (
                        <Text style={styles.text}>Dinner ✅</Text>
                    )}
                    {details.serves_vegetarian_food && (
                        <Text style={styles.text}>Vegetarian ✅</Text>
                    )}
                    {details.serves_beer && (
                        <Text style={styles.text}>Beer ✅</Text>
                    )}
                    {details.serves_wine && (
                        <Text style={styles.text}>Wine ✅</Text>
                    )}
                </View>
            </View>
        </>
    );
}

const PlaceReviews = ({ details }: { details: PlaceDetails }) => {
    return (
        <View>
            <Subheader text={`Reviews (${details.user_ratings_total ? details.user_ratings_total : 0})`} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginVertical: 12, paddingLeft: 12, paddingBottom: 20}}>
                {details.reviews.map((review, index) => (
                    <ReviewCard key={index} review={review} />
                ))}
            </ScrollView>
        </View>
    );
}

const PlaceMapSection = ({ lat, lng, details }: {lat: number, lng: number, details: PlaceDetails}) => {
    return (
        <>
            <Subheader text={"Location"} />
            <PlaceDetailsMap latitude={lat} longitude={lng} title={details.name} />

            <View style={{gap: 2}}>
                <Subheader text={"Address"}/>
                <Text style={styles.text}>{details.formatted_address}</Text>
            </View>
        </>
    );
}


const PlaceDetailsView = ({ id }: PlaceDetailsProps) => {
    const [placeDetails, setPlaceDetails] = useState<PlaceDetails | null>(null);
    const [isFetchingData, setFetchingData] = useState<boolean>(true);

    useEffect(() => {
        const loadDetails = async() => {
            const placeDetails = await fetchPlaceDetails(id);
            setPlaceDetails(placeDetails);
            setFetchingData(false);
        }

        loadDetails().then(() => {});
    }, []);

    if (isFetchingData) {
        return <ForkAnimation />;
    }

    if (!placeDetails) {
        return <GenericErrorScreen message={"Could Not Load Place Information"} />;
    }

    const latitude = placeDetails.geometry.location?.lat;
    const longitude = placeDetails.geometry.location?.lng;

    return (
        <View
            className="flex-1 flex-col items-start justify-start bg-background"
            style={{paddingBottom: 125}}
        >
            <ScrollView>
                <ScrollableImageGallery photoRefs={placeDetails.photos} />
                <View
                    style={{padding: 16, gap: 12}}
                >
                    <View>
                        <TitleText text={placeDetails.name} />
                        <TitleSubheader text={placeDetails.editorial_summary.overview} />
                    </View>

                    <BusinessStatusMessage openingHours={placeDetails.opening_hours} status={placeDetails.business_status} />
                    <BusinessOpeningHours details={placeDetails} />
                    <PlaceRating rating={placeDetails.rating} />
                    <PlacePricing details={placeDetails} />
                    <PlaceWebsite website={placeDetails.website} />
                    <PlacePhoneNumber phoneNumber={placeDetails.international_phone_number} />
                    <PlaceServices details={placeDetails} />
                    <PlaceReviews details={placeDetails} />

                    <View>
                        <PlaceMapSection lat={latitude} lng={longitude} details={placeDetails} />
                        <MapLink latitude={latitude} longitude={longitude} />
                    </View>
                </View>
            </ScrollView>
            <GoBackButton />
        </View>
    );
};

export default PlaceDetailsView

const styles = StyleSheet.create({
    text: {
        fontSize: FONTS.default_size,
    },
});