import {Text, TouchableOpacity} from "react-native";
import React from "react";
import {useNavigation} from "expo-router";

export const GoBackButton = () => {
    const navigation = useNavigation();

    const handlePress = () => {
        if (!navigation.canGoBack()) {
            return;
        }
        navigation.goBack();
    }

    return (
        <TouchableOpacity className="absolute self-center bottom-0 bg-primary mb-12 py-[15] px-[75] rounded-full" onPress={handlePress}>
            <Text className="text-white font-semibold text-md">Go Back</Text>
        </TouchableOpacity>
    );
};