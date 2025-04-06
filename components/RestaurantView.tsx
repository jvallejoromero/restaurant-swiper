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

const RestaurantView = () => {
    // use states for resetting the card stack
    const [cardIndex, setCardIndex] = useState(0);
    const [swiperKey, setSwiperKey] = useState(0);

    // use state for list of restaurants
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [radius, setRadius] = useState(1500);
    const [latitude, setLatitude] = useState<number | null>(null);
    const [longitude, setLongitude] = useState<number | null>(null);

    const [nextPageToken, setNextPageToken] = useState<string | null>(null);

    // use states for updating latitude and longitude
    const [location, setLocation] = useState<LocationObject | null>(null);

    const resetCardStack = () => {
        setCardIndex(0);
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
    const randomizeLocation = (latitude: number, longitude: number) => {
        // Random offset between 1 to 2 miles (0.0145 to 0.029 degrees)
        const minOffset = 0.0145; // 1 mile
        const maxOffset = 0.029;  // 2 miles
        const latOffset = (Math.random() * (maxOffset - minOffset) + minOffset) * (Math.random() < 0.5 ? 1 : -1); // Random offset between 1-2 miles, both positive and negative
        const lonOffset = (Math.random() * (maxOffset - minOffset) + minOffset) * (Math.random() < 0.5 ? 1 : -1); // Random offset between 1-2 miles, both positive and negative

        const newLatitude = latitude + latOffset;
        const newLongitude = longitude + lonOffset;

        return { newLatitude, newLongitude };
    };

    // get the user's location
    useEffect(() => {
        // Request permission to access location
        Location.requestForegroundPermissionsAsync().then((response) => {
            if (response.status !== 'granted') {
                console.log("Location permission denied")
                return;
            }
            return Location.getCurrentPositionAsync();
        }).then((location) => {
            if (location) {
                console.log("--- Current location information ---")
                console.log("Latitude: ", location.coords.latitude);
                console.log("Latitude: ", location.coords.longitude);
                setLocation(location);
            }
        }).catch((error) => {
            console.log("Could not fetch location:");
            console.log(error);
        });
    }, []);

    // fetch data from Google API
    useEffect(() => {
        if (location?.coords.latitude && location?.coords.longitude) {
            const fetchRestaurants = (nextPageToken:string | null) => {
                let apiUrl = "";
                if (latitude && longitude) {
                    console.log("--- Randomized Location ---");
                    console.log('New Latitude: ', latitude);
                    console.log('New Longitude: ', longitude);

                    apiUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=restaurant&key=${GOOGLE_API_KEY}`;
                } else {
                    apiUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location.coords.latitude},${location.coords.longitude}&radius=${radius}&type=restaurant&key=${GOOGLE_API_KEY}`;
                }

                if (nextPageToken) {
                    apiUrl += `&pagetoken=${nextPageToken}`;
                }
                fetch(apiUrl).
                then((response) => response.json()).
                then((data) => {
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
                        setRestaurants((prevRestaurants) => {
                            // Create a Set of place_ids to track which restaurants are already in the list
                            const existingIds = new Set(prevRestaurants.map((restaurant) => restaurant.id));

                            // Filter out restaurants that are already in the state
                            const uniqueRestaurants = restaurants.filter((restaurant) => !existingIds.has(restaurant.id));

                            const updatedRestaurants = [...prevRestaurants, ...uniqueRestaurants];
                            return shuffleArray(updatedRestaurants);
                        });

                        if (data.next_page_token) {
                            setNextPageToken(data.next_page_token);
                        }

                        console.log(restaurants.length, " restaurants found");
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
            fetchRestaurants(nextPageToken);
        }
    }, [location, radius, longitude, latitude, nextPageToken]);

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
                    renderCard={(restaurant: Restaurant) => (
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
                    )}
                    onSwiped={(index) => console.log('Swiped: ', index)}
                    onSwipedLeft={(index) => console.log('Swiped Left: ', index)}
                    onSwipedRight={(index) => console.log('Swiped Right: ', index)}
                    cardIndex={cardIndex}
                    onSwipedAll={() => {
                        console.log('All cards swiped')
                        if (location) {
                            let newLocation = randomizeLocation(location?.coords.latitude, location?.coords.longitude);
                            setLatitude(newLocation.newLatitude);
                            setLongitude(newLocation.newLongitude);
                        }
                        resetCardStack();
                    }}
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