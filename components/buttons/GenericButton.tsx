import {StyleSheet, Text, TouchableOpacity } from "react-native";
import React from "react";
import {COLORS} from "@/constants/colors";

type GenericButtonProps = {
    onPress?: () => void;
    text: string;
}

const GenericButton = ({ onPress, text }: GenericButtonProps) => {
    return (
        <TouchableOpacity
            style={[styles.button]}
            onPress={onPress}
        >
            <Text style={styles.buttonText}>{text}</Text>
        </TouchableOpacity>
    );
}

export default GenericButton;

const styles = StyleSheet.create({
    button: {
        backgroundColor: COLORS.primary,
        borderRadius: 24,
        height: 48,
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
    },
    buttonText: {
        color: COLORS.accent_white,
        fontSize: 16,
        fontWeight: "600",
    },
});