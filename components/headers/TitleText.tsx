import {Text, StyleSheet} from "react-native";
import React from "react";

const TitleText = ({ text, className }: { text?: string, className?: string }) => {
    if (!text) {
        return null;
    }

    return (
        <Text style={styles.title} className={className}>{text}</Text>
    );
}

export default TitleText;

const styles = StyleSheet.create({
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 2,
    },
});