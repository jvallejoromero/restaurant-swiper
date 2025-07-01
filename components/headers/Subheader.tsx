import {StyleSheet, Text, View} from "react-native";
import React from "react";

type SubheaderProps = {
    text: string;
    className?: string;
}

const Subheader = ({ text, className }: SubheaderProps) => {
    return (
        <Text style={styles.subheading} className={className}>{text}</Text>
    );
}

export default Subheader;

const styles = StyleSheet.create({
    subheading: {
        fontSize: 18,
        fontWeight: '600',
    },
});