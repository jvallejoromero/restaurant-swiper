import {StyleSheet, Text, View} from "react-native";
import React from "react";

const Subheader = ({ text }: {text: string}) => {
    return (
        <Text style={styles.subheading}>{text}</Text>
    );
}

export default Subheader;

const styles = StyleSheet.create({
    subheading: {
        fontSize: 18,
        fontWeight: '600',
    },
});