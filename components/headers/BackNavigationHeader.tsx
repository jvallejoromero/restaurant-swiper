import {View} from "react-native";
import React from "react";
import ChevronBackButton from "@/components/buttons/ChevronBackButton";
import Subheader from "@/components/headers/Subheader";

const BackNavigationHeader = ({ label }: { label: string}) => {
    return (
        <View className="w-full flex-row justify-center items-center">
            <ChevronBackButton />
            <Subheader text={label} />
        </View>
    );
}

export default BackNavigationHeader;