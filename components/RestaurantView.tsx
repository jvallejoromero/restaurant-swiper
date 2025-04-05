import {Text, StyleSheet, View, Image} from 'react-native'
import React, {useEffect, useState} from 'react'
import Swiper from 'react-native-deck-swiper'
import {GOOGLE_API_KEY} from '@env'

// Define the type for the Google Places API response
type Restaurant = {
    id: string;
    name: string;
    vicinity: string;
    rating: number;
    description?: string; // You might not always have a description in the API
    photoUrl: string | null;
};

const initialCards =
    [{id:1, name: "Restaurant 1"},
    {id:2, name: "Restaurant 2"},
    {id:3, name: "Restaurant 3"},
    {id:GOOGLE_API_KEY, name: "Restaurant 4"},];

const RestaurantView = () => {
    const [cards, setCards] = useState(initialCards);
    const [cardIndex, setCardIndex] = useState(0);
    const [swiperKey, setSwiperKey] = useState(0);

    const resetCardStack = () => {
        setCards(initialCards);
        setCardIndex(0);
        setSwiperKey(prev => prev + 1);
    }

    // fetch data from Google API
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);

    useEffect(() => {
        const fetchRestaurants = async () => {
            try {
                const response = await fetch(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=37.352865,-121.849643&radius=5000&type=restaurant&key=${GOOGLE_API_KEY}`);
                const data = await response.json();

                console.log("Fetched results:");
                console.log(data);

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

                }));

                setRestaurants(restaurants);
            } catch (error) {
                console.log("Error fetching restaurants: "+ error);
            }
        }
        fetchRestaurants();
    }, []);

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
                        resetCardStack();
                    }}
                    backgroundColor={"#F2F2F2"}
                    stackSize={3}
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
        elevation: 5, // shadow for Android
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.5,
        shadowRadius: 2,
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