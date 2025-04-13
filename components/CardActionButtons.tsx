import {View, TouchableOpacity, StyleSheet, Animated, Image} from 'react-native';
import { XIcon, HeartIcon, HelpCircleIcon } from 'lucide-react-native';
import React from "react";
import {IMAGES} from "@/constants/images";


type CardActionButtonProps = {
    onDislike: () => void;
    onInfo: () => void;
    onLike: () => void;
    swipeProgressX: Animated.Value; // Track the swipe progress
};

export default function CardActionButtons({ onDislike, onInfo, onLike, swipeProgressX }: CardActionButtonProps) {

    // Button size animation (scale up when swiped)
    const dislikeButtonScale = swipeProgressX.interpolate({
        inputRange: [-350, 0], // Scale based on swipe progress
        outputRange: [2, 1], // Scale factor for left, no swipe, and right
        extrapolate: 'clamp',
    });

    const likeButtonScale = swipeProgressX.interpolate({
        inputRange: [0, 350], // Scale based on swipe progress
        outputRange: [1, 2.75], // Scale factor for left, no swipe, and right
        extrapolate: 'clamp',
    });

    return (
        <View style={styles.buttonsContainer}>
            <TouchableOpacity onPress={onDislike} style={styles.button} >
                <Animated.View style={{ transform: [{ scale: dislikeButtonScale }]}}>
                    <Image
                        source={IMAGES.button_dislike}
                        style={{width: 35, height: 35}}
                        resizeMode="contain"
                    />
                </Animated.View>
            </TouchableOpacity>

            <TouchableOpacity onPress={onInfo} style={styles.button}>
                <Image
                    source={IMAGES.button_info}
                    style={{width: 25, height: 25}}
                    resizeMode="contain"
                />
            </TouchableOpacity>

            <TouchableOpacity onPress={onLike} style={styles.button}>
                <Animated.View style={{ transform: [{ scale: likeButtonScale }] }}>
                    <Image
                        source={IMAGES.button_heart_icon}
                        style={{width: 35, height: 35}}
                        resizeMode="contain"
                    />
                </Animated.View>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    buttonsContainer: {
        position: 'absolute',
        bottom: 10,
        zIndex: 1,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 20,
        paddingHorizontal: 20,
    },
    button: {
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 50,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 4, // for Android shadow
        position: 'relative',
    },
    button_fill: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        borderRadius: 40,
        height: '100%',
        zIndex: -1, // Keeps the fill behind the icon
    },
});
