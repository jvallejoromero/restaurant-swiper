import {ActivityIndicator, StyleSheet, View} from "react-native";
import React from "react";

const GenericLoadingScreen = () => {
    return (
        <View style={[StyleSheet.absoluteFillObject, { justifyContent: 'center', alignItems: 'center' }]}>
            <ActivityIndicator size="small" />
        </View>
    );
}

export default GenericLoadingScreen;