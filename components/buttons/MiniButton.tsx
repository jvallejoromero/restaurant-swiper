import {Text, TouchableOpacity} from "react-native";
import React from "react";

const MiniButton = ({ label, onPress }: { label: string, onPress: () => void }) => {
    return (
        <TouchableOpacity
            className="bg-primary px-4 py-3 rounded-md shadow shadow-black/20"
            onPress={onPress}
        >
            <Text className="font-medium text-white">{label}</Text>
        </TouchableOpacity>
    );
}

export default MiniButton;