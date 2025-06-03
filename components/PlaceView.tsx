import {
    Text,
    StyleSheet,
    View,
    Image,
    Animated, SafeAreaView
} from 'react-native'
import React, {useEffect, useState, useRef} from 'react'
import Swiper from 'react-native-deck-swiper'
import * as Location from 'expo-location';
import {LocationObject} from "expo-location";
import CardActionButtons from "@/components/CardActionButtons";
import {useRouter} from "expo-router";
import {COLORS} from "@/constants/colors";
import LottieView from 'lottie-react-native';
import {IMAGES} from "@/constants/images";
import { LinearGradient } from 'expo-linear-gradient';
import ShineText from "@/components/ShineText";

const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_API_KEY;

interface PlaceViewProps {
    type: string;
}

const PlaceView: React.FC<PlaceViewProps> = ({ type }) => {
    // use states for resetting the card stack
    const [cardIndex, setCardIndex] = useState(0);
    const [swiperKey, setSwiperKey] = useState(0);

    // use state for list of places
    const [places, setPlaces] = useState<Place[]>([]);
    const [radius, setRadius] = useState(10000);
    const [latitude, setLatitude] = useState<number | null>(null);
    const [longitude, setLongitude] = useState<number | null>(null);

    const [nextPageToken, setNextPageToken] = useState<string | null>(null);

    const [seenPlaces, setSeenPlaces] = useState<Set<string>>(new Set());  // Track seen place IDs
    const [isFetching, setIsFetching] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    // use states for updating latitude and longitude
    const [location, setLocation] = useState<LocationObject | null>(null);

    // use state for keeping track of swipe progress
    const [swipeProgressX] = useState(new Animated.Value(0));

    // reference for the Swiper component
    const swiperRef = useRef<Swiper<any> | null>(null);

    // navigation hook
    const router = useRouter();

    // force Swiper refresh
    const resetCardStack = () => {
        setSwiperKey(prev => prev + 1);
    }

    // handle swiping progress
    const handleSwiping = (posX: number, _posY: number) => {
        // Update swipeProgress value as the user swipes
        // Clamp the progress value to ensure it stays within -1 to 1 range
        swipeProgressX.setValue(posX);
    };

    // Shuffle function to randomize the array
    const shuffleArray = (array: Place[]) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]]; // Swap elements
        }
        return array;
    };

    // Randomize coordinates by a few miles
    const randomizeLocation = (latitude: number, longitude: number, minMiles: number, maxMiles: number) => {
        // Random distance in miles between minMiles and maxMiles
        const randomDistanceInMiles = Math.random() * (maxMiles - minMiles) + minMiles;

        // Convert miles to degrees (1 degree latitude ~ 69 miles, longitude varies with latitude)
        const latOffset = randomDistanceInMiles / 69;
        const lngOffset = randomDistanceInMiles / (69 * Math.cos((latitude * Math.PI) / 180));

        // Random angle in radians (0 - 2*PI) to cover all directions uniformly
        const randomAngle = Math.random() * 2 * Math.PI;

        // Calculate offset using polar coordinates (angle and distance)
        const randomLat = latitude + latOffset * Math.sin(randomAngle); // Use sin for latitude offset
        const randomLng = longitude + lngOffset * Math.cos(randomAngle); // Use cos for longitude offset

        return { newLatitude: randomLat, newLongitude: randomLng };
    };

    // get distance between two coordinates in kilometers

    // convert degrees to radians
    const toRad = (degrees: number) => {
        return degrees * Math.PI / 180;
    }

    // get distance in kilometers between two coordinates using the Haversine formula
    const haversine = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371; // Radius of the Earth in kilometers
        const dLat = toRad(lat2 - lat1);  // Difference in latitude
        const dLon = toRad(lon2 - lon1);  // Difference in longitude

        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c; // Distance in kilometers
        return parseFloat(distance.toFixed(2));
    }

    // get the user's location
    useEffect(() => {
        // Request permission to access location
        Location.requestForegroundPermissionsAsync().then((response) => {
            if (response.status !== 'granted') {
                console.log("Location permission denied");
                return;
            }
            return Location.getCurrentPositionAsync();
        }).then((location) => {
            if (location) {
                console.log("--- Current location information ---");
                console.log("Latitude: ", location.coords.latitude);
                console.log("Latitude: ", location.coords.longitude);
                setLocation(location);
            }
        }).catch((error) => {
            console.log("Could not fetch location:");
            console.log(error);
        });
    }, []);

    // function to fetch place data
    const fetchPlaces = (nextPageToken:string | null) => {
        if (location?.coords.latitude && location?.coords.longitude) {
            setIsUpdating(true);

            let apiUrl = "";
            if (latitude && longitude) {
                console.log("--- Randomizing Location ---");
                console.log('New Location: ', latitude,",",longitude);

                apiUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=${type}&key=${GOOGLE_API_KEY}`;
            } else {
                apiUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location?.coords.latitude},${location?.coords.longitude}&radius=${radius}&type=${type}&key=${GOOGLE_API_KEY}`;
            }

            if (nextPageToken) {
                console.log("Has next page token: ", true);
                apiUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?key=${GOOGLE_API_KEY}&pagetoken=${nextPageToken}`;
            }

            console.log("---- New API request ---- ");
            console.log(apiUrl);
            console.log("---- END New API request ---- ");

            fetch(apiUrl).
            then((response) => response.json()).
            then((data) => {

                console.log("---- New API Response ---- ");
                console.log("RESPONSE: ", data.status, " LENGTH: " + data.results.length);
                console.log("---- END New API Response ---- ");

                if (data.results) {
                    // Filter out results that are not strictly places.
                    const filteredResults = data.results.filter((item: any) => {
                        // Discard unwanted results
                        const types = item.types || [];
                        return types.includes(type)
                            && !types.includes("lodging")
                            && !types.includes("movie_theater")
                            && !types.includes("theatre");
                    });

                    // Map the API data to match the Place type
                    const places: Place[] = filteredResults.map((item: any) => ({
                        id: item.place_id, // unique ID from the API
                        name: item.name,
                        vicinity: item.vicinity,
                        rating: item.rating,
                        description: item.description || "No description available", // handle missing descriptions
                        photoUrl: item.photos?.[0]
                            ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1200&photo_reference=${item.photos[0].photo_reference}&key=${GOOGLE_API_KEY}`
                            : null,
                        images: item.photos?.map((photo: { photo_reference: string }) => `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1200&photo_reference=${photo.photo_reference}&key=${GOOGLE_API_KEY}`) ??
                            [item.icon], // Fallback if no photos are available
                        openNow: item.opening_hours?.open_now,
                        latitude: item.geometry?.location.latitude,
                        longitude: item.geometry?.location.longitude,
                        distanceFromUser: haversine(location?.coords.latitude, location?.coords.longitude, item.geometry?.location.lat, item.geometry?.location.lng),
                    }))

                    // Filter out places that the user has already seen
                    const newPlaces = places.filter((place) => !seenPlaces.has(place.id));

                    // Update places state
                    setPlaces((prevPlaces) => [...prevPlaces, ...shuffleArray(newPlaces)]);
                    // setPlaces((prevPlaces) => [...prevPlaces, ...newPlaces]);

                    // Update seen places by adding new place IDs to the set
                    setSeenPlaces((prevSeen) => {
                        const updatedSeen = new Set(prevSeen);
                        newPlaces.forEach((place) => {
                            updatedSeen.add(place.id);
                        });
                        return updatedSeen;
                    });

                    if (data.next_page_token) {
                        setNextPageToken(data.next_page_token);
                    } else {
                        setIsUpdating(false);
                    }
                } else {
                    console.log("No places found!")
                }
            }).catch((error) => {
                console.log("Error fetching places:");
                console.log(error);
            });
        }
    }


    // fetch initial data from Google API
    useEffect(() => {
        if (location && !nextPageToken) {
            fetchPlaces(null);
        }
    }, [location]);

    // fetch next page data from Google API
    useEffect(() => {
        if (nextPageToken) {
            // Delay actual call if pagetoken is present
            const delayFetch = setTimeout(() => {
                fetchPlaces(nextPageToken);
            }, 2000);
            return () => clearTimeout(delayFetch);
        }
    }, [nextPageToken]);

    // Update place date based on new coordinates
    useEffect(() => {
        if (latitude && longitude) {
            console.log("--- Fetching places based on new coordinates ---");
            setIsFetching(true);
            setNextPageToken(null); // Clear old token
            fetchPlaces(null); // This will use the updated latitude and longitude
            setIsFetching(false);
            resetCardStack();
        }
    }, [latitude, longitude]);

    // Fetch new place data once all cards are swiped
    useEffect(() => {
        if (cardIndex >= places.length && places.length > 0 && !isFetching && location?.coords.latitude && location?.coords.longitude) {
            console.log("All cards swiped, fetching new location...");
            if (!isFetching) {
                const newLocation = randomizeLocation(location.coords.latitude, location.coords.longitude, 5, 10);

                if (newLocation.newLatitude === location.coords.latitude && newLocation.newLongitude === location.coords.longitude) {
                    console.log("Same location as last time — skipping");
                    return;
                }

                setLatitude(newLocation.newLatitude);
                setLongitude(newLocation.newLongitude);
            }
        }
    }, [cardIndex]);

    if (isUpdating) {
        // Choose a loading animation randomly
        const random = Math.random();

        let animationPath = '';
        if (random < 0.5) {
            animationPath = require('../assets/animations/red-fork-animation.json');
        } else {
            animationPath = require('../assets/animations/plate-animation.json');
        }
        return (
            <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background_color}}>
                <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                    <LottieView
                        source={animationPath}
                        autoPlay
                        loop
                        style={{ width: 200, height: 200 }}
                    />
                </View>
            </View>
        );
    }

    // Render the Swiper only when data is available
    if (places.length === 0) {}

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

export default PlaceView