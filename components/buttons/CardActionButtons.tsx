import {View, TouchableOpacity, StyleSheet, Animated, Image, ImageSourcePropType} from 'react-native';
import React from "react";
import {IMAGES} from "@/constants/images";

type CardActionButtonProps = {
    onDislike: () => void;
    onInfo: () => void;
    onLike: () => void;
    swipeProgressX: Animated.Value;
};

const ButtonImage = ({ imageSrc, size }: { imageSrc: ImageSourcePropType, size: number }) => {
    return (
        <>
            <Image
                source={imageSrc}
                style={{
                    width: size, height: size, shadowOpacity: 0.1, shadowRadius: 0.25, shadowOffset: { width: 1, height: 2 }}}
                resizeMode="contain"
            />
        </>
    );
}

export const CardActionButtons = ({ onDislike, onInfo, onLike, swipeProgressX }: CardActionButtonProps) => {
    const dislikeButtonScale = swipeProgressX.interpolate({
        inputRange: [-350, 0], // Scale based on swipe progress
        outputRange: [1.4, 1], // Scale factor for left, and right
        extrapolate: 'clamp',
    });

    const likeButtonScale = swipeProgressX.interpolate({
        inputRange: [0, 350], // Scale based on swipe progress
        outputRange: [1, 1.4], // Scale factor for left and right
        extrapolate: 'clamp',
    });

    return (
        <View style={styles.buttonsContainer}>
            <TouchableOpacity onPress={onDislike} style={styles.button} >
                <Animated.View style={{ transform: [{ scale: dislikeButtonScale }]}}>
                    <ButtonImage imageSrc={IMAGES.button_dislike} size={35} />
                </Animated.View>
            </TouchableOpacity>

            <TouchableOpacity onPress={onInfo} style={styles.button}>
                <ButtonImage imageSrc={IMAGES.button_info} size={25} />
            </TouchableOpacity>

            <TouchableOpacity onPress={onLike} style={styles.button}>
                <Animated.View style={{ transform: [{ scale: likeButtonScale }] }}>
                    <ButtonImage imageSrc={IMAGES.button_heart_icon} size={35} />
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
        borderWidth: 1,
        borderColor: 'rgba(217,217,217,0.6)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 4, // for Android shadow
        position: 'relative',
        overflow: 'hidden',
    },
    button_fill: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        borderRadius: 40,
        height: '100%',
        zIndex: -1,
    },
});
