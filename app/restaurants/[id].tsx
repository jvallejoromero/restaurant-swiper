import {Image, Text, View, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Linking} from 'react-native'
import MapView, { Marker } from 'react-native-maps';
import React, {useRef, useState, useEffect} from 'react'
import {useLocalSearchParams, useRouter} from "expo-router";
import {COLORS} from "@/constants/colors";
import {ChevronLeft, ChevronRight, LinkIcon} from 'lucide-react-native';

const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_API_KEY;
const width = Dimensions.get("window").width;

// types for Google API response
type PlaceDetails = {
    name: string;
    address: string;
    formatted_address: string;
    business_status: string;
    formatted_phone_number: string;
    international_phone_number: string;
    url: string;
    vicinity: string;
    website: string;

    curbside_pickup: boolean;
    delivery: boolean;
    dine_in: boolean;
    reservable: boolean;
    serves_beer: boolean;
    serves_breakfast: boolean;
    serves_brunch: boolean;
    serves_dinner: boolean;
    serves_lunch: boolean;
    serves_vegetarian_food: boolean;
    serves_wine: boolean;
    takeout: boolean;
    wheelchair_accessible_entrance: boolean;

    price_level: number;
    rating: number;
    user_ratings_total: number;

    opening_hours: PlaceOpeningHours;
    current_opening_hours: PlaceOpeningHours;
    editorial_summary: PlaceEditorialSummary;
    geometry: Geometry;

    reviews: Array<PlaceReview>;
    photos: Array<string>;
}

// Contains a summary of the place. A summary is comprised of a textual overview, and also includes the language code for these if applicable. Summary text must be presented as-is and can not be modified or altered.
type PlaceEditorialSummary = {
    language: string;
    overview: string;
}

// An object describing the location.
type Geometry = {
    location: LatLngLiteral;
    viewport: Bounds;
}

// An object describing a specific location with Latitude and Longitude in decimal degrees
type LatLngLiteral = {
    lat: number;
    lng: number;
}

// A rectangle in geographical coordinates from points at the southwest and northeast corners
type Bounds = {
    northeast: LatLngLiteral;
    southeast: LatLngLiteral;
}

// An object describing the opening hours of a place.
type PlaceOpeningHours = {
    open_now: boolean;
    periods: Array<PlaceOpeningHours>
    special_days: Array<PlaceSpecialDay>;
    type: string;
    weekday_text: Array<string>;
}

type PlaceSpecialDay = {
    date: string;
    exceptional_hours: boolean;
}

type PlaceReview = {
    author_name: string;
    relative_time_description: string;
    language: string;
    original_language: string;
    text: string;
    profile_photo_url: string;
    time: number;
    rating: number;
    translated: boolean;
}


const RestaurantDetails = () => {
    const { id } = useLocalSearchParams();
    const router = useRouter();

    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [placeDetails, setPlaceDetails] = useState<PlaceDetails | null>(null);
    const [isFetchingData, setFetchingData] = useState(true);

    const scrollGalleryRef = useRef<ScrollView | null>(null);

    const handleBack = () => {
        router.back();  // Go back when button is pressed
    };

    // fetch restaurant details
    useEffect(() => {
        fetchPlaceDetails(id);
    }, []);


    const mapReviews = (reviews: any[]): PlaceReview[] => {
        if (!reviews || !Array.isArray(reviews)) {
            return []; // Return an empty array if reviews is not available or not an array
        }
        return reviews.map(review => ({
            author_name: review?.author_name,
            relative_time_description: review?.relative_time_description,
            language: review?.language,
            original_language: review?.original_language,
            text: review?.text,
            profile_photo_url: review?.profile_photo_url,
            time: review?.time,
            rating: review?.rating,
            translated: review?.translated,
        }));
    };

    const mapPhotos = (photos: any[]): string[] => {
        if (!photos || !Array.isArray(photos)) {
            return [];
        }
        return photos.map(photo => {
            return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1200&photo_reference=${photo.photo_reference}&key=${GOOGLE_API_KEY}`;
        });
    };

    const fetchPlaceDetails = (placeId: string | string[]) => {
        if (Array.isArray(placeId)) {placeId.join('');}
        const endpoint = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}`;
        const fields = 'adr_address,business_status,formatted_address,' +
            'geometry,name,photo,type,url,vicinity,wheelchair_accessible_entrance,' +
            'formatted_phone_number,international_phone_number,opening_hours,website,' +
            'curbside_pickup,delivery,dine_in,editorial_summary,price_level,rating,' +
            'reservable,reviews,serves_beer,serves_breakfast,serves_brunch,serves_dinner,' +
            'serves_lunch,serves_vegetarian_food,serves_wine,takeout,user_ratings_total';

        console.log("--- New API Request ---");
        console.log(`${endpoint}&fields=${fields}&key=${GOOGLE_API_KEY}`);
        console.log("--- END API Request ---");

        fetch(`${endpoint}&fields=${fields}&key=${GOOGLE_API_KEY}`).
        then((response) => response.json()).
        then((data) => {
            if (data.result) {
                const placeDetails: PlaceDetails = {
                    name: data.result.name,
                    address: data.result.adr_address,
                    formatted_address: data.result.formatted_address,
                    business_status: data.result.business_status,
                    formatted_phone_number: data.result.formatted_phone_number,
                    international_phone_number: data.result.international_phone_number,
                    url: data.result.url,
                    vicinity: data.result.vicinity,
                    website: data.result.website,

                    curbside_pickup: data.result.curbside_pickup,
                    delivery: data.result.delivery,
                    dine_in: data.result.dine_in,
                    reservable: data.result.reservable,
                    serves_beer: data.result.serves_beer,
                    serves_breakfast: data.result.serves_breakfast,
                    serves_brunch: data.result.serves_brunch,
                    serves_dinner: data.result.serves_dinner,
                    serves_lunch: data.result.serves_lunch,
                    serves_vegetarian_food: data.result.serves_vegetarian_food,
                    serves_wine: data.result.serves_wine,
                    takeout: data.result.takeout,
                    wheelchair_accessible_entrance: data.result.wheelchair_accessible_entrance,

                    price_level: data.result.price_level,
                    user_ratings_total: data.result.user_ratings_total,
                    rating: data.result.rating,

                    opening_hours: {
                        open_now: data.result.opening_hours?.open_now,
                        periods: data.result.opening_hours?.periods,
                        special_days: data.result.opening_hours?.special_days,
                        type: data.result.opening_hours?.type,
                        weekday_text: data.result.opening_hours?.weekday_text,
                    },
                    current_opening_hours: {
                        open_now: data.result.current_opening_hours?.open_now,
                        periods: data.result.current_opening_hours?.periods,
                        special_days: data.result.current_opening_hours?.special_days,
                        type: data.result.current_opening_hours?.type,
                        weekday_text: data.result.current_opening_hours?.weekday_text,
                    },
                    editorial_summary: {
                        language: data.result.editorial_summary?.language,
                        overview: data.result.editorial_summary?.overview,
                    },
                    geometry: {
                        location: {
                            lat: data.result.geometry?.location?.lat || 0,
                            lng: data.result.geometry?.location?.lng || 0,
                        },
                        viewport: data.result.geometry?.viewport || {
                            northeast: { lat: 0, lng: 0 },
                            southeast: { lat: 0, lng: 0 },
                        },
                    },

                    reviews: mapReviews(data.result.reviews),
                    photos: mapPhotos(data.result.photos),
                }
                console.log("Fetched data for ", placeDetails.name);
                setPlaceDetails(placeDetails);
            }
        }).catch((error) => {
            console.log("Could not fetch restaurant data.");
            console.error(error);
        });
        setFetchingData(false);
    };

    // Render loading state or error state when fetching
    if (isFetchingData) {
        return (
            <View style={styles.detailsContainer}>
                <Text>Loading Restaurant Data...</Text>
                <TouchableOpacity style={styles.continueSwipingButton} onPress={handleBack}>
                    <Text style={styles.buttonText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // Render error state if placeDetails is still null after fetching
    if (!placeDetails) {
        return (
            <View style={styles.detailsContainer}>
                <Text>Could Not Load Restaurant Information</Text>
                <TouchableOpacity style={styles.continueSwipingButton} onPress={handleBack}>
                    <Text style={styles.buttonText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }


    const scrollToIndex = (index: number) => {
        if (index >= 0 && index < placeDetails.photos.length) {
            setCurrentImageIndex(index);
            scrollGalleryRef.current?.scrollTo({ x: index * width, animated: true });
        }
    };

    const getStarsFromRating = (rating: number): string => {
        // Round the rating to the nearest whole number
        const roundedRating = Math.round(rating);

        // Create a string of stars, with full stars corresponding to the rating
        let stars = '';
        for (let i = 0; i < 5; i++) {
            if (i < roundedRating) {
                stars += '⭐️'; // Full star
            } else {
                stars += ''; // Empty star
            }
        }
        return stars;
    };

    const getDollarsFromPriceLevel = (price: number): string => {
        let dollars = '';
        for (let i = 0; i < price; i++) {
            dollars += '💵';
        }
        return dollars;
    }

    const getStringPriceLevel = () => {
        switch (placeDetails.price_level) {
            case 1:
                return 'Cheap';
            case 2:
                return 'Moderately Priced';
            case 3:
                return 'Expensive';
            case 4:
                return 'Very Expensive';
            default:
                return 'Unknown';
        }
    }

    // variables for place details
    const starRating = getStarsFromRating(placeDetails.rating);
    const priceLevel = getDollarsFromPriceLevel(placeDetails.price_level);

    const latitude = placeDetails.geometry.location?.lat;
    const longitude = placeDetails.geometry.location?.lng;

    return (
        <View style={styles.detailsContainer}>
            <ScrollView style={styles.imageGalleryWrapper}>
                <View>
                    {/* Left Button */}
                    {currentImageIndex >= 1 && (
                        <>
                            <TouchableOpacity
                                onPress={() => scrollToIndex(currentImageIndex - 1)}
                                style={[styles.galleryButton, { left: 10 }]}
                            >
                                <ChevronLeft color="white" size={24} />
                            </TouchableOpacity>
                        </>
                    )}

                    {/* Right Button */}
                    {currentImageIndex < (placeDetails.photos.length-1) && (
                        <TouchableOpacity
                            onPress={() => scrollToIndex(currentImageIndex + 1)}
                            style={[styles.galleryButton, { right: 10 }]}
                        >
                            <ChevronRight color="white" size={24} />
                        </TouchableOpacity>
                    )}

                    {/*Swipeable image gallery*/}
                    <ScrollView
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        ref={scrollGalleryRef}
                        onMomentumScrollEnd={(event) => {
                            const offsetX = event.nativeEvent.contentOffset.x;
                            const newIndex = Math.round(offsetX / width);
                            setCurrentImageIndex(newIndex);
                        }}
                    >
                        {placeDetails.photos.map((uri, index) => (
                            <Image key={index} source={{ uri }} style={styles.image} />
                        ))}
                    </ScrollView>

                    {/* Image Counter */}
                    <View style={styles.galleryImageCounter}>
                        <Text style={styles.galleryImageCounterText}>
                            {currentImageIndex + 1} / {placeDetails.photos.length}
                        </Text>
                    </View>
                </View>

                {/*Restaurant Details */}
                <View style={styles.detailsSection}>

                    {/*Restaurant Name*/}
                    <Text style={styles.title}>{placeDetails.name}</Text>

                    {/*Restaurant Description*/}
                    {placeDetails.editorial_summary?.overview && (
                        <Text style={styles.text}>{placeDetails.editorial_summary.overview}</Text>
                    )}

                    {/*Open Status*/}
                    {placeDetails.opening_hours.open_now && (
                        <Text style={styles.successText}>This place is currently open</Text>
                    )}
                    {!placeDetails.opening_hours.open_now && placeDetails.business_status === "OPERATIONAL" && (
                        <Text style={[styles.errorText]}>This place is currently closed</Text>
                    )}

                    {/*Business Status*/}
                    {placeDetails.business_status === "CLOSED_TEMPORARILY" && (
                        <Text style={styles.warningText}>This place is temporarily closed</Text>
                    )}
                    {placeDetails.business_status === "CLOSED_PERMANENTLY" && (
                        <Text style={styles.warningText}>This place is permanently closed</Text>
                    )}

                    {/*Opening Hours*/}
                    {placeDetails.opening_hours.weekday_text && placeDetails.business_status === "OPERATIONAL" && (
                        <>
                            <Text style={styles.subheading}>Opening Hours</Text>
                            <View style={{paddingTop: 5}}>
                                {placeDetails.opening_hours?.weekday_text?.map((hours, index) => (
                                    <Text key={index} style={styles.text}>{hours}</Text>
                                ))}
                            </View>
                        </>
                    )}

                    {/*Rating*/}
                    <Text style={[styles.subheading, {paddingTop: 10}]}>Rating ({placeDetails.rating} / 5)</Text>
                    <Text style={styles.text}>{starRating}</Text>

                    {/*Price*/}
                    <Text style={styles.subheading}>Price ({getStringPriceLevel()})</Text>
                    <Text style={styles.text}>{priceLevel}</Text>

                    {/*Website*/}
                    {placeDetails.website && (
                        <>
                            <Text style={styles.subheading}>Website</Text>
                            <TouchableOpacity onPress={() => Linking.openURL(placeDetails.website)}>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Text style={{ marginRight: 5, color: 'blue', fontSize: 15}}>Go To Site</Text>
                                    <LinkIcon color="blue" size={16} />
                                </View>
                            </TouchableOpacity>
                        </>
                    )}

                    {/*Phone Number*/}
                    {placeDetails.international_phone_number && (
                        <View style={{paddingTop: 0}}>
                            <Text style={styles.subheading}>Phone Number</Text>
                            <Text style={styles.text}>{placeDetails.international_phone_number}</Text>
                        </View>
                    )}

                    {/* Features */}
                    <Text style={styles.subheading}>Offers</Text>
                    <View style={{paddingTop: 5}}>
                        {placeDetails.takeout && (
                            <Text style={styles.text}>Takeout ✅</Text>
                        )}
                        {placeDetails.curbside_pickup && (
                            <Text style={styles.text}>Curbside Pickup ✅</Text>
                        )}
                        {placeDetails.delivery && (
                            <Text style={styles.text}>Delivery ✅</Text>
                        )}
                        {placeDetails.dine_in && (
                            <Text style={styles.text}>Dining In ✅</Text>
                        )}
                        {placeDetails.reservable && (
                            <Text style={styles.text}>Reservations ✅</Text>
                        )}
                        {placeDetails.wheelchair_accessible_entrance && (
                            <Text style={styles.text}>Wheelchair Accessibility ✅</Text>
                        )}
                    </View>

                    <Text style={styles.subheading}>Serving Options</Text>
                    <View style={{paddingTop: 5}}>
                        {placeDetails.serves_breakfast && (
                            <Text style={styles.text}>Breakfast ✅</Text>
                        )}
                        {placeDetails.serves_brunch && (
                            <Text style={styles.text}>Brunch ✅</Text>
                        )}
                        {placeDetails.serves_lunch && (
                            <Text style={styles.text}>Lunch ✅</Text>
                        )}
                        {placeDetails.serves_dinner && (
                            <Text style={styles.text}>Dinner ✅</Text>
                        )}
                        {placeDetails.serves_vegetarian_food && (
                            <Text style={styles.text}>Vegetarian ✅</Text>
                        )}
                        {placeDetails.serves_beer && (
                            <Text style={styles.text}>Beer ✅</Text>
                        )}
                        {placeDetails.serves_wine && (
                            <Text style={styles.text}>Wine ✅</Text>
                        )}
                    </View>

                    {/*Reviews*/}
                    <View style={{paddingTop:5}}>
                        <Text style={styles.subheading}>Reviews ({placeDetails.user_ratings_total})</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.reviewsContainer}>
                            {placeDetails.reviews.map((review, index) => (
                                <View key={index} style={styles.reviewCard}>
                                    <View style={styles.reviewHeader}>
                                        {review.profile_photo_url ? (
                                            <Image
                                                source={{ uri: review.profile_photo_url }}
                                                style={styles.reviewAvatar}
                                            />
                                        ) : (
                                            <View style={styles.reviewAvatarPlaceholder}>
                                                <Text style={styles.reviewInitials}>
                                                    {review.author_name?.[0]?.toUpperCase() || "?"}
                                                </Text>
                                            </View>
                                        )}
                                        <View style={styles.reviewAuthorInfo}>
                                            <Text style={styles.reviewAuthor}>{review.author_name}</Text>
                                            <Text style={styles.reviewRating}>{review.rating} ⭐</Text>
                                            <Text style={styles.reviewTimeDescription}>{review.relative_time_description}</Text>
                                        </View>
                                    </View>

                                    <Text style={styles.reviewText} numberOfLines={10}>"{review.text}"</Text>
                                    {review.translated && (
                                        <>
                                            <Text style={[styles.reviewText, {paddingTop: 10}]}>- Review Translated by Google</Text>
                                            {/*<Text style={styles.reviewText}>Original Language: {review.original_language}</Text>*/}
                                        </>
                                    )}
                                </View>
                            ))}
                        </ScrollView>
                    </View>

                    {/*Map Preview*/}
                    <Text style={styles.subheading}>Location</Text>
                    <View style={styles.mapContainer}>
                        <MapView
                            style={styles.map}
                            region={{
                                latitude,
                                longitude,
                                latitudeDelta: 0.01,
                                longitudeDelta: 0.01,
                            }}
                            scrollEnabled={true}
                            zoomEnabled={true}
                            pitchEnabled={false}
                            rotateEnabled={true}
                        >
                            <Marker coordinate={{ latitude, longitude }} title={placeDetails.name} />
                        </MapView>
                    </View>

                    {/*Address*/}
                    <View style={{paddingTop:5}}>
                        <Text style={styles.subheading}>Address</Text>
                        <Text style={styles.text}>{placeDetails.formatted_address}</Text>
                    </View>

                    {/* Open in Maps Button */}
                    <TouchableOpacity onPress={() => Linking.openURL(`https://www.google.com/maps?q=${latitude},${longitude}`).catch((err) => console.log(err))}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={{ marginRight: 5, color: 'blue', fontSize: 15}}>Open In Maps</Text>
                            <LinkIcon color="blue" size={16} />
                        </View>
                    </TouchableOpacity>

                </View>
            </ScrollView>

            {/*Go Back button*/}
            <TouchableOpacity style={styles.continueSwipingButton} onPress={() => handleBack()}>
                <Text style={styles.buttonText}>Go Back</Text>
            </TouchableOpacity>
        </View>
    );
};

export default RestaurantDetails

const styles = StyleSheet.create({
    detailsContainer: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        backgroundColor: COLORS.background_color,
        paddingBottom: 100,
    },
    imageGalleryWrapper: {
        position: 'relative',
        height: 250,
        width: '100%',
    },
    galleryButton: {
        position: 'absolute',
        transform: [{ translateY: -12 }],
        padding: 5,
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderRadius: 10,
        bottom: 10,
        zIndex: 1,
    },
    galleryImageCounter: {
        position: 'absolute',
        bottom: 10,
        left: '50%',
        transform: [{ translateX: '-50%'}],
        backgroundColor: 'rgba(0, 0, 0, 0.25)',
        padding: 5,
        borderRadius: 5,
    },
    galleryImageCounterText: {
        color: 'white',
        fontSize: 16,
    },
    continueSwipingButton: {
        position: 'absolute',
        zIndex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        bottom: 50,
        backgroundColor: COLORS.primary, // light red
        paddingVertical: 15,
        paddingHorizontal: 75,
        borderRadius: 9999, // pill shape
    },
    buttonText: {
        color: 'white', // darker red text
        fontWeight: 'bold',
        fontSize: 16,
    },
    scrollView: {
        flex: 1,
    },
    image: {
        width: width,
        height: 250,
        resizeMode: 'cover',
    },
    detailsSection: {
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    subheading: {
        fontSize: 18,
        fontWeight: '600',
        marginTop: 10,
    },
    text: {
        fontSize: 16,
        marginBottom: 10,
    },
    warningText: {
      color: 'orange',
      fontWeight: 'bold',
      fontSize: 18,
    },
    errorText: {
        color: 'red',
        fontWeight: 'bold',
        fontSize: 18,
    },
    successText: {
        color: 'green',
        fontWeight: 'bold',
        fontSize: 18,
    },
    reviewsContainer: {
        marginVertical: 12,
        paddingLeft: 12,
        paddingBottom: 20,
    },
    reviewCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginRight: 12,
        width: 250,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 6,
        elevation: 4,
    },
    reviewRating: {
        fontWeight: 'bold',
        marginBottom: 8,
        fontSize: 16,
    },
    reviewText: {
        fontStyle: 'italic',
        marginBottom: 8,
    },
    reviewAuthor: {
        fontSize: 12,
        color: '#666',
    },
    reviewTimeDescription: {
        fontSize: 12,
        fontStyle: 'italic',
        color: '#666',
    },
    reviewHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    reviewAuthorInfo: {
        flex: 1,
    },
    reviewAvatar: {
        width: 50,
        height: 50,
        borderRadius: 10,
        marginRight: 12,
    },
    reviewAvatarPlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#ccc',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    reviewInitials: {
        color: '#fff',
        fontWeight: 'bold',
    },
    mapContainer: {
        height: 250,
        width: '100%',
        borderRadius: 16,
        overflow: 'hidden',
        marginTop: 10,
        marginBottom: 8,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 6,
        elevation: 3,
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    openInMapsButton: {
        backgroundColor: COLORS.primary, // use your theme color
        paddingVertical: 10,
        paddingHorizontal: 40,
        borderRadius: 9999,
        alignSelf: 'center',
        marginTop: 20,
    },
    openInMapsButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
});