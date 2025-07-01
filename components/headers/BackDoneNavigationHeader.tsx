import {Text, TouchableOpacity, View} from "react-native";
import React from "react";
import BackNavigationHeader from "./BackNavigationHeader";

type BackDoneNavigationHeaderProps = {
    label: string;
    onPressDone: () => void;
}

const BackDoneNavigationHeader = ({ label, onPressDone }: BackDoneNavigationHeaderProps) => {
    return (
        <View className="relative flex-row px-2 items-center justify-center">
            <BackNavigationHeader label={label} />
            <TouchableOpacity className="absolute right-5" onPress={onPressDone}>
                <Text className="text-xl text-primary font-semibold">Done</Text>
            </TouchableOpacity>
        </View>
    );
}

export default BackDoneNavigationHeader;