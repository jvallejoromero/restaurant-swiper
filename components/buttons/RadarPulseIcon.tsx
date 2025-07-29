import React from "react";
import { View, Text } from "react-native";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    withSequence, withDelay,
} from "react-native-reanimated";
import {COLORS} from "@/constants/colors";

type RadarPulseIconProps = {
    icon: string;
    size?: number;
}

const RadarPulseIcon = ({ icon, size = 24 }: RadarPulseIconProps) => {
    const scale = useSharedValue(1);
    const opacity = useSharedValue(0.5);

    React.useEffect(() => {
        const pulseDuration = 1200;
        const totalCycle = 5000;
        const delayDuration = totalCycle - pulseDuration;
        scale.value = withRepeat(
            withSequence(
                withTiming(2, { duration: pulseDuration }),
                withDelay(delayDuration, withTiming(1, { duration: 0 }))
            ),
            -1,
            false
        );
        opacity.value = withRepeat(
            withSequence(
                withTiming(0, { duration: 1200 }),
                withDelay(delayDuration, withTiming(0.5, { duration: 0 }))
            ),
            -1,
            false
        );
    }, []);

    const animatedCircle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: opacity.value,
    }));

    return (
        <View
            style = {{ width: size, height: size }}
            className="justify-center items-center"
        >
            <Animated.View
                pointerEvents="none"
                style={[
                    animatedCircle,
                    {
                        position: "absolute",
                        width: 24,
                        height: 24,
                        borderRadius: 999,
                        backgroundColor: COLORS.primary,
                    },
                ]}
            />
            <Text className="z-5">{icon}</Text>
        </View>
    );
};

export default RadarPulseIcon;
