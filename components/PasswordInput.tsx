import React, { useState } from "react";
import {
    View,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    TextInputProps,
    StyleProp,
    ViewStyle,
} from "react-native";
import { Feather } from "@expo/vector-icons";

interface PasswordInputProps extends TextInputProps {
    placeholder?: string;
    /** Style for the outer container */
    containerStyle?: StyleProp<ViewStyle>;
}

export default function PasswordInput({placeholder = "Password", containerStyle, style: inputStyle, ...props}: PasswordInputProps) {
    // password is hidden by default (visible=false)
    const [visible, setVisible] = useState(false);

    return (
        <View style={[styles.container, containerStyle]}>
            <TextInput
                {...props}
                style={[styles.input, inputStyle]}
                placeholder={placeholder}
                placeholderTextColor="#888"
                secureTextEntry={!visible}
                autoCapitalize="none"
                autoCorrect={false}
            />
            <TouchableOpacity
                onPress={() => setVisible(prev => !prev)}
                style={styles.toggleButton}
                activeOpacity={0.7}
            >
                <Feather
                    name={visible ? "eye" : "eye-off"}
                    size={20}
                    color="#888"
                />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: "#000",
    },
    toggleButton: {
        marginLeft: 8,
        padding: 4,
    },
});
