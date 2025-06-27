import {Image, StyleSheet, Text, View} from "react-native";
import React from "react";
import {PlaceReview} from "@/utils/GoogleResponseTypes";

const ReviewCard = ({ review }: {review: PlaceReview}) => {
    return (
        <>
            <View style={styles.reviewCard}>
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
                    <Text style={[styles.reviewText, {paddingTop: 10}]}>- Review Translated by Google</Text>
                )}
            </View>
        </>
    );
}

export default ReviewCard;

const styles = StyleSheet.create({
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
});