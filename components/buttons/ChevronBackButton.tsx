import {TouchableOpacity} from "react-native";
import React from "react";
import {Ionicons} from "@expo/vector-icons";
import {router} from "expo-router";

const ChevronBackButton = () => {
    return (
        <TouchableOpacity className="absolute left-3" onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24}/>
        </TouchableOpacity>
    );
}

export default ChevronBackButton;