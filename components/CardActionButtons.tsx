import { View, TouchableOpacity, StyleSheet , Animated} from 'react-native';
import { XIcon, HeartIcon, HelpCircleIcon } from 'lucide-react-native';


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
        outputRange: [1.25, 1], // Scale factor for left, no swipe, and right
        extrapolate: 'clamp',
    });

    const likeButtonScale = swipeProgressX.interpolate({
        inputRange: [0, 350], // Scale based on swipe progress
        outputRange: [1, 1.25], // Scale factor for left, no swipe, and right
        extrapolate: 'clamp',
    });

    return (
        <View style={styles.buttonsContainer}>
            <TouchableOpacity onPress={onDislike} style={styles.button} >
                <Animated.View style={{ transform: [{ scale: dislikeButtonScale }]}}>
                    <XIcon size={35} color="#FF006F" />
                </Animated.View>
            </TouchableOpacity>

            <TouchableOpacity onPress={onInfo} style={styles.button}>
                <HelpCircleIcon size={25} color="#FFA500" />
            </TouchableOpacity>

            <TouchableOpacity onPress={onLike} style={styles.button}>
                <Animated.View style={{ transform: [{ scale: likeButtonScale }] }}>
                    <HeartIcon size={35} color="#FF006F" />
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
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 4,
        elevation: 5, // for Android shadow
        borderWidth: 1,
        borderColor: '#E5E5E5',
        overflow: 'hidden',
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
