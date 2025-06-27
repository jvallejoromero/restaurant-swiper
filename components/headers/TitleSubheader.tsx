import {StyleSheet, Text, View} from "react-native";
import React from "react";

const TitleSubheader = ({ text, className }: { text?: string, className?: string }) => {
    if (!text) {
        return null;
    }

    return (
        <Text style={styles.text} className={className}>{text}</Text>
    );
}

export default TitleSubheader;

const styles = StyleSheet.create({
    text: {
        fontSize: 16,
        marginBottom: 10,
    },
});