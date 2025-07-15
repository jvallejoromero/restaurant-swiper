import {Pressable, StyleSheet, Text, View} from "react-native";
import React, {ComponentProps} from "react";
import {LinearGradient} from "expo-linear-gradient";
import {Feather, MaterialCommunityIcons} from "@expo/vector-icons";

type BigActionButtonProps = {
    label: string;
    iconName?: ComponentProps<typeof MaterialCommunityIcons>["name"];
    iconSize?: number;
    className?: string;
    active?: boolean;
    onPress: () => void;
}

const BigActionButton = ({ label, iconName, iconSize=22, className, active=false, onPress }: BigActionButtonProps) => {
    return (
        <Pressable
            onPress={onPress}
            pressRetentionOffset={{ top: 30, bottom: 30, left: 30, right: 30 }}
            className={`${className ? className : `w-full h-24 rounded-2xl`}`}
        >
            <LinearGradient
                colors={active ? ["#4CAF50", "#66BB6A", "#81C784"] : ["#d52e4c", "#e53946", "#e53946", "#b71c1c"]}
                start={[0, 0]}
                end={[1, 1]}
                style={styles.gradientCard}
            >
                {iconName && <MaterialCommunityIcons name={iconName} size={iconSize} color="white" />}
                <Text className="text-white ml-3 text-xl font-medium">
                    {label}
                </Text>
            </LinearGradient>
        </Pressable>
    );
}

export default BigActionButton;

const styles = StyleSheet.create({
    gradientCard: {
        flex: 1,
        paddingHorizontal: 20,
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 16,
    },
});