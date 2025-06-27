import {Text, View} from "react-native";
import React from "react";
import {GoBackButton} from "@/components/buttons/GoBackButton";

const GenericErrorScreen = ({ message }: { message: string }) => {
    return (
        <View className="relative flex-1 items-center justify-center bg-background">
            <Text>{message}</Text>
            <GoBackButton />
        </View>
    );
}

export default GenericErrorScreen;