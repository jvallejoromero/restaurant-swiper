import {
    Text,
    StyleSheet,
    View,
    Image,
    Animated, SafeAreaView
} from "react-native";
import React, {useEffect, useState, useRef, useContext} from "react";
import Swiper from "react-native-deck-swiper";
import {CardActionButtons} from "@/components/buttons/CardActionButtons";
import {useRouter} from "expo-router";
import {COLORS} from "@/constants/colors";
import {IMAGES} from "@/constants/images";
import { LinearGradient } from "expo-linear-gradient";
import ShineText from "@/components/text/ShineText";
import {createMockLocation, randomizeLocation} from "@/utils/LocationUtils";
import { UserLocationContext } from '@/context/UserLocationContext';
import { ForkAnimation } from "../animations/LoadingAnimations";
import {useGooglePlacesAPI} from "@/hooks/GooglePlacesAPIHook";
import GenericErrorScreen from "@/components/screens/GenericErrorScreen";
import {LocationObject} from "expo-location";

export type PlaceViewType = "restaurant" | "tourist_attraction";

interface PlaceViewProps {
    type: PlaceViewType;
}

const PlaceView = ({ type }: PlaceViewProps) => {
    const router = useRouter();

    const [cardIndex, setCardIndex] = useState<number>(0);
    const [swiperKey, setSwiperKey] = useState<number>(0);
    const [swipeProgressX] = useState(new Animated.Value(0));
    const [lastLocation, setLastLocation] = useState<LocationObject | null>(null);
    const swiperRef = useRef<Swiper<any> | null>(null);

    const { places, loadingPlaces, errorLoading, loadPlacesFromLocation } = useGooglePlacesAPI(type, false);
    const { userLocation: currentLocation } = useContext(UserLocationContext);

    const resetCardStack = () => {
        setSwiperKey(prev => prev + 1);
    }

    const handleSwiping = (posX: number, _posY: number) => {
        swipeProgressX.setValue(posX);
    };

    useEffect(() => { 
        setLastLocation(currentLocation);
    }, [currentLocation]);

    // Fetch new place data once all cards are swiped
    useEffect(() => {
        const needsToRefetch = (cardIndex >= places.length && places.length > 0) && !loadingPlaces;

        if (needsToRefetch) {
            console.log("All cards swiped, fetching new location...");
            resetCardStack();

            let newCoords;
            if (!lastLocation?.coords.latitude || !lastLocation?.coords.latitude) {
                newCoords = { newLatitude: 0, newLongitude: 0 };
            } else {
                newCoords = randomizeLocation(lastLocation.coords.latitude, lastLocation.coords.longitude, 5, 10);
            }

            const newLocation = createMockLocation(newCoords.newLatitude, newCoords.newLongitude);
            setLastLocation(newLocation);

            void loadPlacesFromLocation(newLocation);
        }
    }, [cardIndex]);

    if (loadingPlaces) {
        return <ForkAnimation />;
    }

    if (errorLoading) {
        return <GenericErrorScreen message={errorLoading} />;
    }

    if (lastLocation && (lastLocation.coords.latitude === 0 && lastLocation.coords.longitude === 0)) {
        if (lastLocation.mocked) {
            return;
        }

        return <GenericErrorScreen message={"No places found on null island."} />
    }

    if (places.length === 0) {
        return <GenericErrorScreen message={"No places found."} />;
    }

    return (
        <View style={{flex: 1, backgroundColor: COLORS.background_color}}>
            <View style={{flex: 1, backgroundColor: COLORS.background_color, zIndex: 9999}}>

                {/*App Name On Top Of Card*/}
                <SafeAreaView style={{ position: 'absolute', top: 0, left: 0}}>
                    <Text style={{
                        fontSize: 28,
                        fontWeight: 'bold',
                        color: COLORS.primary,
                        paddingHorizontal: 20,
                        paddingTop: 20,
                        shadowColor: 'black',
                        shadowOpacity: 0.25,
                        shadowRadius: 5,
                        elevation: 10,
                    }}>
                        🍽️ forked
                    </Text>
                </SafeAreaView>

                <Swiper
                    ref={swiperRef}
                    key={swiperKey}
                    cards={places}
                    showSecondCard={true}
                    backgroundColor={"transparent"}
                    stackSize={2}
                    cardVerticalMargin={50}
                    cardHorizontalMargin={15}
                    stackSeparation={0}
                    infinite={false}
                    disableBottomSwipe={true}
                    stackAnimationFriction={20}
                    stackAnimationTension={25}
                    childrenOnTop={false}
                    overlayOpacityHorizontalThreshold={50}
                    animateOverlayLabelsOpacity={false}
                    renderCard={(place: Place) => {

                        // Return this component if place is undefined for some reason
                        if (!place) {
                            return (
                                <View style={styles.card}>
                                    <Image
                                        source={IMAGES.no_image_found}
                                        style={[styles.cardImage,{resizeMode: "contain"}]}
                                    />
                                    <LinearGradient
                                        colors={['transparent', 'rgba(0,0,0,0.8)']}
                                        style={styles.gradientOverlay}
                                    >
                                        <Text style={styles.cardName}>Unknown</Text>
                                        <Text style={styles.cardText}>We couldn't find anything nearby..</Text>
                                    </LinearGradient>
                                </View>
                            );
                        }

                        // Render the place card and description
                        return (
                            <View style={styles.card} key={place.id}>
                                {place.photoUrl ? (
                                    <Image
                                        source={{ uri: place.photoUrl }}
                                        style={styles.cardImage}
                                    />
                                ) : (
                                    <Image
                                        source={IMAGES.no_image_found}
                                        style={[styles.cardImage, {resizeMode: "contain"}]} // different styling for the fallback image
                                        resizeMode="contain"
                                    />
                                )}
                                <LinearGradient
                                    // Fade from transparent to semi-opaque black
                                    colors={['transparent', 'rgba(0,0,0,0.8)']}
                                    // colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.9)']}
                                    style={styles.gradientOverlay}
                                >
                                    <Text style={styles.cardName} numberOfLines={1} ellipsizeMode="tail">{place.name}</Text>
                                    {place?.openNow && (
                                        <ShineText
                                            text="Open Now"
                                            style={styles.cardTextGreen}
                                        />
                                    )}
                                    <Text style={styles.cardText} numberOfLines={1} ellipsizeMode="tail">{place.vicinity}</Text>
                                    {place.rating ? (
                                        <Text style={styles.cardText}>{place.rating}/5 stars, {place.distanceFromUser} km away</Text>
                                    ) : (
                                        <Text style={styles.cardText}>No rating available, {place.distanceFromUser} km away</Text>
                                    )}
                                </LinearGradient>
                            </View>
                        );
                    }}
                    onSwiping={(x,y) => {
                        handleSwiping(x,y);
                    }}
                    onSwiped={(index) => {
                        console.log('Swiped: ', (index + 1), "/", places.length);
                        setCardIndex(cardIndex + 1);
                        swipeProgressX.setValue(0); // reset swipe progress
                    }}
                    onSwipedLeft={() => {
                        console.log('<==== Swiped Left');
                    }}
                    onSwipedRight={() => {
                        console.log('      Swiped Right ====>');
                    }}
                    onSwipedTop={(index) => {
                        setCardIndex(cardIndex - 1);
                        swiperRef.current?.swipeBack();

                        if (type === 'restaurant') {
                            router.push({
                                pathname: '/restaurant/[id]',
                                params: { id: places[index].id },
                            });
                        } else if (type === 'tourist_attraction') {
                            router.push({
                                pathname: '/attraction/[id]',
                                params: {id: places[index].id}
                            });
                        }
                        return false;
                    }}
                    cardIndex={cardIndex}
                    onSwipedAll={() => {}}
                    animateCardOpacity={true}
                    overlayLabels={{
                        left: {
                            element: (
                                <Image
                                    source={IMAGES.nope_overlay}
                                    style={{
                                        width: 110,
                                        height: 110,
                                        transform: [{ rotate: '35deg' }],
                                    }}
                                />
                            ),
                            style: {
                                wrapper: {
                                    flexDirection: 'column',
                                    alignItems: 'flex-end',
                                    justifyContent: 'flex-start',
                                    marginTop: 50,
                                    marginLeft: -20,
                                },
                            },
                        },
                        right: {
                            element: (
                                <Image
                                    source={IMAGES.like_overlay}
                                    style={{
                                        width: 100,
                                        height: 100,
                                        transform: [{ rotate: '-30deg' }],
                                    }}
                                />
                            ),
                            style: {
                                wrapper: {
                                    flexDirection: 'column',
                                    alignItems: 'flex-start',
                                    justifyContent: 'flex-start',
                                    marginTop: 55,
                                    marginLeft: 20,
                                },
                            },
                        },
                    }}
                />
                <CardActionButtons
                    onLike={() => {
                        swiperRef.current?.swipeRight();
                    }}
                    onDislike={() => {
                        swiperRef.current?.swipeLeft();
                    }}
                    onInfo={() => {
                        swiperRef.current?.swipeTop();
                    }}
                    swipeProgressX={swipeProgressX}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    textOverlay: {
        position: 'absolute',
        bottom: 45, // Adjust positioning as needed
        left: 20,
        right: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Darker overlay for text contrast
        padding: 10,
        borderRadius: 8,
    },
    gradientOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '40%',              // Height of the gradient
        borderBottomLeftRadius: 10, // Match card's border radius
        borderBottomRightRadius: 10, // Match card's border radius
        justifyContent: 'flex-end', // Push text content to the bottom
        paddingHorizontal: 15, // Left/Right padding for text
        paddingBottom: 55,    // Bottom padding for text
    },
    card: {
        flex: 0.85,
        marginTop: 40,
        backgroundColor: COLORS.background_color,
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.50,
        shadowRadius: 3.84,

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

export default PlaceView;