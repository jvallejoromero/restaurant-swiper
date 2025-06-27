import {Linking, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import React from "react";
import {LinkIcon} from "lucide-react-native";

const MapLink = ({ latitude, longitude }: { latitude: number, longitude: number }) => {
    return (
        <TouchableOpacity onPress={() => Linking.openURL(`https://www.google.com/maps?q=${latitude},${longitude}`).catch((err) => console.log(err))}>
            <View style={{ flexDirection: 'row', gap: 4}}>
                <Text style={{ color: 'blue', fontSize: 16}}>Open In Maps</Text>
                <LinkIcon color="blue" size={16} />
            </View>
        </TouchableOpacity>
    );
}

export default MapLink;