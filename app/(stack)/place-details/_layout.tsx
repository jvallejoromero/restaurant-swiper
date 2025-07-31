import { Stack } from "expo-router";

console.log("Loaded place layout");

export default function PlaceLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                animation: 'slide_from_right',
                gestureEnabled: true,
            }}
        >
            <Stack.Screen name="[id]" />
        </Stack>
    );
}
