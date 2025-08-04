import React from "react";
import {Text, View} from "react-native";

export const StatusTextScreen = ({ title, subtitle, children }: { title: string, subtitle: string, children?: React.ReactNode }) => {
    return (
        <View className={`flex-1 justify-center items-center px-6 ${children && "gap-10"}`}>
            <View className="gap-2">
                <Text className="text-center text-xl font-semibold text-gray-800">
                    {title}
                </Text>
                <Text className="text-base text-gray-500 text-center">
                    {subtitle}
                </Text>
            </View>
            {children && (
                <View className="w-full items-center">
                    {children}
                </View>
            )}
        </View>
    );
}