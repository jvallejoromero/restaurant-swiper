import {ImageSourcePropType, StyleSheet, Text, View} from "react-native";
import React from "react";
import {IMAGES} from "@/constants/images";
import {LinearGradient} from "expo-linear-gradient";
import ShineText from "@/components/text/ShineText";
import {Place} from "@/types/Places.types";
import {Image} from "expo-image";
import {useFirebasePhotoUri} from "@/hooks/useFirebasePhotoUri";

type CardSkeletonProps = {
    imageSrc: ImageSourcePropType | string;
    children: React.ReactNode;
}

const CardSkeleton = ({ imageSrc, children }: CardSkeletonProps) => {
    const hasImage = typeof imageSrc === "string";

    return (
        <View style={styles.card}>
            <Image
                cachePolicy={"disk"}
                source={hasImage ? { uri: imageSrc } : IMAGES.no_image_found}
                contentFit={hasImage ? "cover" : "contain"}
                style={styles.cardImage}
            />
            <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.8)']}
                style={styles.gradientOverlay}
            >
                {children}
            </LinearGradient>
        </View>
    );
}

const PlaceViewCard = ({ place }: { place: Place }) => {
    if (!place?.id || !place.name) {
        return (
            <CardSkeleton imageSrc={IMAGES.no_image_found}>
                <Text style={styles.cardName}>Unknown</Text>
                <Text style={styles.cardText}>We couldn't find anything nearby..</Text>
            </CardSkeleton>
        );
    }

    const resolvedPhoto = useFirebasePhotoUri(place.photoUrl);

    return (
        <CardSkeleton imageSrc={resolvedPhoto ?? IMAGES.no_image_found}>
            <Text style={styles.cardName} numberOfLines={1} ellipsizeMode="tail">{place.name}</Text>
            {place?.openNow && (
                <ShineText text="Open Now" style={styles.cardTextGreen} />
            )}
            <Text style={styles.cardText} numberOfLines={1} ellipsizeMode="tail">{place.vicinity}</Text>
            {place.rating ? (
                <Text style={styles.cardText}>{place.rating}/5 stars, {place.distanceFromUser} km away</Text>
            ) : (
                <Text style={styles.cardText}>{place.distanceFromUser} km away</Text>
            )}
        </CardSkeleton>
    );
}

export default PlaceViewCard;

const styles = StyleSheet.create({
    gradientOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '40%',
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
        justifyContent: 'flex-end',
        paddingHorizontal: 15,
        paddingBottom: 55,
    },
    card: {
        flex: 0.85,
        marginTop: 40,
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.50,
        shadowRadius: 3.84,
        pointerEvents: "box-none",
        elevation: 5,
    },
    cardName: {
        fontFamily: 'Roboto',
        fontSize: 25,
        fontWeight: "bold",
        color: "white",
    },
    cardText: {
        fontSize: 14,
        fontStyle: 'italic',
        color: "white",
    },
    cardTextGreen: {
        fontSize: 14,
        color: 'lightgreen',
        fontStyle: 'italic',
        fontWeight: 'bold'
    },
    cardImage: {
        flex: 1,
        width: "100%",
        height: 200,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        borderRadius: 10,
        resizeMode: 'cover',
    },
});