import React from "react";
import { View, Text } from "react-native";
import { Image } from "expo-image";
import { IMAGES } from "@/constants/images";

const NoMoreSessionPlacesScreen = () => {
    return (
        <View className="flex-1 items-center justify-center px-6 py-12">
            <Image
                source={IMAGES.no_image_found}
                contentFit="contain"
                className="w-full h-52 mb-8"
            />
            <Text className="text-center text-2xl font-bold mb-2">
                You're all caught up!
            </Text>
            <Text className="text-center text-base italic">
                Please wait for the host to load more places for the session.
            </Text>
        </View>
    );
};

export default NoMoreSessionPlacesScreen;
