import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome } from '@expo/vector-icons';

type LoadingCardProps = {
    title: string;
    subtitle: string;
}

export const LoadingCard = ({ title, subtitle }: LoadingCardProps) => {
    const shimmerAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.timing(shimmerAnim, {
                toValue: 1,
                duration: 3000,
                useNativeDriver: true,
            })
        ).start();
    }, []);

    const translateX = shimmerAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [-200, 200],
    });

    const Shimmer = ({ className, children}: { className: string, children?: React.ReactNode }) => {
        return (
            <View className={`${className} bg-[#F5F5F5] overflow-hidden justify-center items-center`}>
                {children}
                <Animated.View
                    style={[
                        {
                            ...StyleSheet.absoluteFillObject,
                            transform: [{ translateX }],
                        },
                    ]}
                >
                    <LinearGradient
                        colors={['transparent', 'rgba(255,255,255,0.15)', 'transparent']}
                        start={{ x: 0, y: 0.5 }}
                        end={{ x: 1, y: 0.5 }}
                        style={StyleSheet.absoluteFill}
                    />
                </Animated.View>
            </View>
        );
    }

    return (
        <View className="w-[95%] self-center bg-white border border-accent-grey/20 rounded-3xl shadow-lg shadow-black/30 my-6">
            <Shimmer className="h-96 w-full rounded-t-xl overflow-hidden">
                <View className="items-center gap-1">
                    <Text
                        numberOfLines={2}
                        ellipsizeMode={"tail"}
                        className="text-center text-black font-medium text-base px-6"
                    >
                        {title}
                    </Text>
                    <Text
                        numberOfLines={2}
                        ellipsizeMode={"tail"}
                        className="text-center text-neutral-700 text-sm px-6"
                    >
                        {subtitle}
                    </Text>
                </View>
            </Shimmer>

            <View className="p-4 gap-3">
                <Shimmer className="h-5 w-3/4 rounded-md items-start justify-center" />
                <Shimmer className="h-4 w-2/3 rounded-md items-start justify-center" />
            </View>

            <View className="flex-row justify-center gap-6 py-4 mb-2 rounded-b-xl">
                <View className="bg-white w-14 h-14 rounded-full border border-red-300 shadow shadow-black/20 items-center justify-center">
                    <FontAwesome name="close" size={22} color="#ef4444" />
                </View>
                <View className="bg-white w-14 h-14 rounded-full border border-yellow-300 shadow shadow-black/20 items-center justify-center">
                    <FontAwesome name="question" size={22} color="#f59e0b" />
                </View>
                <View className="bg-white w-14 h-14 rounded-full border border-green-300 shadow shadow-black/20 items-center justify-center">
                    <FontAwesome name="heart" size={22} color="#10b981" />
                </View>
            </View>
        </View>
    );
};
