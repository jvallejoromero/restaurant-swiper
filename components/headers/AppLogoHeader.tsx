import {SafeAreaView, Text, View} from "react-native";
import React from "react";
import {COLORS} from "@/constants/colors";

const AppLogoHeader = () => {
    return (
        <Text style={{
            fontSize: 28,
            fontWeight: 'bold',
            color: COLORS.primary,
            shadowColor: 'black',
            shadowOpacity: 0.25,
            shadowRadius: 5,
            elevation: 10,
        }}>
            🍽️ forked
        </Text>
    );
};


export default AppLogoHeader;