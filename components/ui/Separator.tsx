import {StyleSheet, Text, View} from "react-native";
import React from "react";

const Separator = ({ className }: { className?: string }) => {
    return (
        <View style={styles.separator} className={className} />
    );
}

export default Separator;

const styles = StyleSheet.create({
    separator: {
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: 'rgba(0,0,0,0.1)',
    },
});