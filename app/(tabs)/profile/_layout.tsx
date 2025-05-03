import React from "react";
import { Stack } from "expo-router";

export default function ProfileLayout() {
    return (
        <Stack>
            <Stack.Screen name="index" options={{ headerShown: false, gestureEnabled: false }} />
            <Stack.Screen name="onboarding" options={{ headerShown: false,  gestureEnabled: false }} />
            <Stack.Screen name="login"  options={{ headerShown: false,  gestureEnabled: false }} />
            <Stack.Screen name="signup" options={{ headerShown: false,  gestureEnabled: false }} />
        </Stack>
    );
}
