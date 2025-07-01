import {StyleSheet, Text, TouchableOpacity } from "react-native";
import React from "react";
import {COLORS} from "@/constants/colors";

type GenericButtonProps = {
    onPress?: () => void;
    color?: string;
    text: string;
}

const GenericButton = ({ onPress, text, color }: GenericButtonProps) => {
    return (
        <TouchableOpacity
            style={[styles.button, { backgroundColor: color ? color : COLORS.primary }]}
            onPress={onPress}
        >
            <Text style={styles.buttonText}>{text}</Text>
        </TouchableOpacity>
    );
}

export default GenericButton;

const styles = StyleSheet.create({
    button: {
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