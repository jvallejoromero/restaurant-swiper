import {SafeAreaView, Text} from "react-native";
import React from "react";
import {COLORS} from "@/constants/colors";

const AppLogoHeader = () => {
    return (
        <SafeAreaView style={{ position: 'absolute', top: 0, left: 0}}>
            <Text style={{
                fontSize: 28,
                fontWeight: 'bold',
                color: COLORS.primary,
                paddingHorizontal: 20,
                paddingTop: 20,
                shadowColor: 'black',
                shadowOpacity: 0.25,
                shadowRadius: 5,
                elevation: 10,
            }}>
                🍽️ forked
            </Text>
        </SafeAreaView>
    );
}

export default AppLogoHeader;