import {View, Text, Animated, SafeAreaView} from "react-native";
import { useEffect, useRef } from "react";
import { Place } from "@/types/Places.types";
import { Image } from "expo-image";

type MatchPopupProps = {
    place: Place;
    additionalCount: number;
    onHide: () => void;
};

export default function MatchPopup({ place, onHide, additionalCount }: MatchPopupProps) {
    const slideAnim = useRef(new Animated.Value(-100)).current;
    const timeoutRef = useRef<number | null>(null);

    useEffect(() => {
        Animated.timing(slideAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
        }).start();

        timeoutRef.current = setTimeout(() => {
            Animated.timing(slideAnim, {
                toValue: -100,
                duration: 300,
                useNativeDriver: true,
            }).start(() => onHide());
        }, 4000);

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [place.id]);

    return (
        <SafeAreaView className="z-50">
            <Animated.View
                style={[
                    {
                        position: 'absolute',
                        left: 16,
                        right: 16,
                        padding: 16,
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: 'white',
                        borderRadius: 16,
                        transform: [{ translateY: slideAnim }],
                    }
                ]}
            >
                <View className="flex flex-row gap-3">
                    {place.photoUrl && (
                        <View className="w-10 h-10 rounded-full overflow-hidden">
                            <Image
                                source={{ uri: place.photoUrl }}
                                style={{
                                    width: "100%",
                                    height: "100%",
                                }}
                                contentFit="cover"
                                transition={300}
                            />
                        </View>
                    )}
                    <View className="flex-1">
                        <Text className="text-base font-bold">🎉 It’s a Match!</Text>
                        <Text className="text-sm text-gray-600">{place.name}</Text>
                        {additionalCount > 0 && (
                            <Text className="text-xs text-gray-400 mt-1">+{additionalCount} more match{additionalCount > 1 ? 'es' : ''}</Text>
                        )}
                    </View>
                </View>
            </Animated.View>
        </SafeAreaView>
    );
}
