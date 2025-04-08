import {Text, StyleSheet, View, Image} from 'react-native'
import React, {useEffect, useState} from 'react'
import Swiper from 'react-native-deck-swiper'
import * as Location from 'expo-location'
import {GOOGLE_API_KEY} from '@env'
import {LocationObject} from "expo-location";

// Define the type for the Google Places API response
type Restaurant = {
    id: string;
    name: string;
    vicinity: string;
    rating: number;
    description?: string; // You might not always have a description in the API
    photoUrl: string | null;
};

// Define the type for Google Places API parameters
type SearchPlacesParams = {
    query: string;
    latitude: number;
    longitude: number;
    radiusMeters?: number; // optional with a default
    maxResults?: number; // optional with a default
    minRating?: number; // optional with a default
    openNow?: boolean; // optional with a default
};

const RestaurantView = () => {
    // use states for resetting the card stack
    const [cardIndex, setCardIndex] = useState(0);
    const [swiperKey, setSwiperKey] = useState(0);

    // use state for list of restaurants
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [radius, setRadius] = useState(10000);
    const [latitude, setLatitude] = useState<number | null>(null);
    const [longitude, setLongitude] = useState<number | null>(null);

    const [nextPageToken, setNextPageToken] = useState<string | null>(null);

    const [seenRestaurants, setSeenRestaurants] = useState<Set<string>>(new Set());  // Track seen restaurant IDs
    const [isFetching, setIsFetching] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    // use states for updating latitude and longitude
    const [location, setLocation] = useState<LocationObject | null>(null);

    const resetCardStack = () => {
        setSwiperKey(prev => prev + 1);
    }

    // Shuffle function to randomize the array
    const shuffleArray = (array: Restaurant[]) => {
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

    async function searchPlaces({
                                    query,
                                    latitude,
                                    longitude,
                                    radiusMeters = 5000,
                                    maxResults = 100,
                                }: SearchPlacesParams) {
        const url = 'https://places.googleapis.com/v1/places:searchText';
        const headers = {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': GOOGLE_API_KEY,
            'X-Goog-FieldMask': 'places.displayName,places.location,places.businessStatus',
        };
        const body = {
            textQuery: query,
            includedType: 'restaurant',
            locationBias: {
                circle: {
                    center: {
                        latitude,
                        longitude,
                    },
                    radius: radiusMeters,
                },
            },
            maxResultCount: maxResults,
            languageCode: 'en-US',
            regionCode: 'us',
            strictTypeFiltering: false,
        };
        try {
            const res = await fetch(url, {
                method: 'POST',
                headers,
                body: JSON.stringify(body),
            });

            const data = await res.json();
            console.log(data.places);
            return data.places ?? []; // or handle errors here
        } catch (error) {
            console.error('Error fetching places:', error);
            return [];
        }
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

    // function to fetch restaurant data
    const fetchRestaurants = (nextPageToken:string | null) => {
        if (location?.coords.latitude && location.coords.longitude) {
            setIsUpdating(true);

            let apiUrl = "";
            if (latitude && longitude) {
                console.log("--- Randomizing Location ---");
                console.log('New Location: ', latitude,",",longitude);

                apiUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=restaurant&key=${GOOGLE_API_KEY}`;
            } else {
                apiUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location.coords.latitude},${location.coords.longitude}&radius=${radius}&type=restaurant&key=${GOOGLE_API_KEY}`;
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
                    // Map the API data to match the Restaurant type
                    const restaurants: Restaurant[] = data.results.map((item: any) => ({
                        id: item.place_id, // unique ID from the API
                        name: item.name,
                        vicinity: item.vicinity,
                        rating: item.rating,
                        description: item.description || "No description available", // handle missing descriptions
                        photoUrl: item.photos?.[0]
                            ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1200&photo_reference=${item.photos[0].photo_reference}&key=${GOOGLE_API_KEY}`
                            : null,

                    }))
                    // Filter out restaurants that the user has already seen
                    const newRestaurants = restaurants.filter((restaurant) => !seenRestaurants.has(restaurant.id));


                    // Update restaurants state
                    setRestaurants((prevRestaurants) => [...prevRestaurants, ...shuffleArray(newRestaurants)]);
                    // setRestaurants((prevRestaurants) => [...prevRestaurants, ...newRestaurants]);

                    // Update seen restaurants by adding new restaurant IDs to the set
                    setSeenRestaurants((prevSeen) => {
                        const updatedSeen = new Set(prevSeen);
                        newRestaurants.forEach((restaurant) => {
                            updatedSeen.add(restaurant.id);
                            console.log("Added: ", restaurant.name + " to seen restaurants.");
                        });
                        return updatedSeen;
                    });

                    if (data.next_page_token) {
                        setNextPageToken(data.next_page_token);
                    } else {
                        setIsUpdating(false);
                    }
                    // console.log("next page token is: " + nextPageToken);
                    // console.log(data);
                } else {
                    console.log("No restaurants found!")
                }
            }).catch((error) => {
                console.log("Error fetching restaurants:");
                console.log(error);
            });
        }
    }


    // fetch initial data from Google API
    useEffect(() => {
        if (location && !nextPageToken) {
            fetchRestaurants(null);
        }
    }, [location]);

    // fetch next page data from Google API
    useEffect(() => {
        if (nextPageToken) {
            // Delay actual call if pagetoken is present
            const delayFetch = setTimeout(() => {
                fetchRestaurants(nextPageToken);
            }, 2000);
            return () => clearTimeout(delayFetch);
        }
    }, [nextPageToken]);

    useEffect(() => {
        if (latitude && longitude) {
            console.log("--- Fetching restaurants based on new coordinates ---");
            setIsFetching(true);
            setNextPageToken(null); // Clear old token
            fetchRestaurants(null); // This will use the updated latitude and longitude
            setIsFetching(false);
            resetCardStack();
        }
    }, [latitude, longitude]); // Dependency array now watches latitude and longitude

    useEffect(() => {
        if (cardIndex >= restaurants.length && restaurants.length > 0 && !isFetching && location?.coords.latitude && location?.coords.longitude) {
            console.log("All cards swiped, fetching new location...");
            if (!isFetching) {
                const newLocation = randomizeLocation(location.coords.latitude, location.coords.longitude, 10, 15);
                if (newLocation.newLatitude === location.coords.latitude && newLocation.newLongitude === location.coords.longitude) {
                    console.log("Same location as last time — skipping");
                    return;
                }
                setLatitude(newLocation.newLatitude);
                setLongitude(newLocation.newLongitude);
            }
        }
    }, [cardIndex]);

    // Render the Swiper only when data is available
    if (restaurants.length === 0) {
        return (
            <View className="flex-1 justify-center items-center bg-primary">
                <Text className="flex-1 justify-center items-center">Loading...</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 justify-center items-center bg-primary">
            <View style={{flex: 1}}>
                <Swiper
                    key={swiperKey}
                    cards={restaurants}
                    renderCard={(restaurant: Restaurant) => {
                        if (restaurant != null && restaurant.photoUrl != null) {
                            if (isUpdating) {
                                return (
                                    <View className="flex-1 justify-center items-center bg-primary">
                                        <Text className="flex-1 justify-center items-center">SEARCHING FOR RESTAURANTS...</Text>
                                    </View>
                                );
                            } else {
                                return (
                                    <View style={styles.card}>
                                        {restaurant.photoUrl && (
                                            <Image source={{ uri: restaurant.photoUrl }} style={styles.cardImage} />
                                        )}
                                        <View style={styles.textOverlay}>
                                            <Text style={styles.cardName}>{restaurant.name}</Text>
                                            <Text style={styles.cardText}>{restaurant.description}</Text>
                                            <Text style={styles.cardText}>{restaurant.vicinity}</Text>
                                            <Text style={styles.cardText}>Rating: {restaurant.rating}</Text>
                                        </View>
                                    </View>
                                );
                            }
                        } else {
                            return (
                                <View className="flex-1 justify-center items-center bg-primary">
                                    <Text className="flex-1 justify-center items-center">NO IMAGE FOUND</Text>
                                </View>
                            );
                        }
                    }}
                    onSwiped={(index) => {
                        console.log('Swiped: ', index, "/", restaurants.length);
                        setCardIndex(cardIndex + 1);
                    }}
                    onSwipedLeft={(index) => {
                        console.log('<==== Swiped Left');
                    }}
                    onSwipedRight={(index) => {
                        console.log('      Swiped Right ====>');
                    }}
                    cardIndex={cardIndex}
                    onSwipedAll={() => {}}
                    animateCardOpacity={true}
                    overlayLabels={{
                        left: {
                            title: 'NOPE',
                            style: {
                                label: {
                                    color: 'red',
                                    fontSize: 30,
                                    fontWeight: 'bold',
                                },
                                wrapper: {
                                    flexDirection: 'column',
                                    alignItems: 'flex-end',
                                    justifyContent: 'flex-start',
                                    marginTop: 20,
                                    marginLeft: -20,
                                },
                            },
                        },
                        right: {
                            title: 'LIKE',
                            style: {
                                label: {
                                    color: 'green',
                                    fontSize: 30,
                                    fontWeight: 'bold',
                                },
                                wrapper: {
                                    flexDirection: 'column',
                                    alignItems: 'flex-start',
                                    justifyContent: 'flex-start',
                                    marginTop: 20,
                                    marginLeft: 20,
                                },
                            },
                        },
                    }}
                    backgroundColor={"transparent"}
                    cardVerticalMargin={50}
                    stackSize={3}
                    stackSeparation={15}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    textOverlay: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        backgroundColor: 'rgba(140,140,140,0.37)',
        padding: 10,
        borderRadius: 8,
    },
    card: {
        flex: 0.85,
        marginTop: 15,
        backgroundColor: "white",
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
        elevation: 10, // shadow for Android
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.5,
        shadowRadius: 15,
        overflow: 'hidden',
    },
    cardName: {
        fontSize: 22,
        fontWeight: "bold",
        color: "white",
    },
    cardText: {
      fontSize: 13,
      color: "white",
    },
    cardImage: {
        flex: 1,
        width: '100%',
        height: 200,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
    },
});

export default RestaurantView