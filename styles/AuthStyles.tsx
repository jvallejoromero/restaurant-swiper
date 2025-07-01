import {ActivityIndicator, Dimensions, StyleSheet, Text, TouchableOpacity} from "react-native";
import {COLORS} from "@/constants/colors";
import React from "react";

const { width } = Dimensions.get("window");
export const CARD_WIDTH = width * 0.85;

export const AuthStatusMessage = ({ loading, err}: { loading: boolean, err: string }) => {
    if (loading) {
        return <ActivityIndicator size={15} />;
    } else if (!!err) {
        return <Text style={authStyles.error}>{err}</Text>;
    }
}

export const AuthActionButton = ({ label, disabled, onPress }: { label: string, disabled: boolean, onPress: () => {}}) => {
    return (
        <TouchableOpacity
            style={[authStyles.button, disabled && {opacity: 0.5}]}
            onPress={onPress}
            disabled={disabled}
        >
            <Text style={authStyles.buttonText}>{label}</Text>
        </TouchableOpacity>
    );
}

export const authStyles = StyleSheet.create({
    loadingIndicator: {
        justifyContent: "center",
        alignItems: "center",
    },
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    background: {
        flex: 1,
        resizeMode: "cover",
        justifyContent: "center",
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.35)",
    },
    card: {
        alignSelf: "center",
        width: CARD_WIDTH,
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 24,
        // shadow (iOS)
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        // elevation (Android)
        elevation: 6,
    },
    title: {
        fontSize: 28,
        fontWeight: "700",
        color: COLORS.primary,
        textAlign: "center",
        marginBottom: 20,
    },
    error: {
        color: "tomato",
        textAlign: "center",
        marginBottom: 12,
    },
    inputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        borderBottomWidth: 1,
        borderBottomColor: "#ddd",
        marginBottom: 16,
    },
    icon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        height: 42,
        fontSize: 16,
        color: "#333",
        paddingVertical: 4,
    },
    button: {
        backgroundColor: COLORS.primary,
        borderRadius: 12,
        height: 48,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 8,
    },
    buttonText: {
        color: "#fff",
        fontSize: 17,
        fontWeight: "600",
    },
    link: {
        marginTop: 16,
        color: COLORS.primary,
        textAlign: "center",
        fontSize: 15,
    },
});