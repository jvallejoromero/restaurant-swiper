import {Stack} from "expo-router";

export default function AuthLayout() {

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen
                name="index"
                options={{ gestureEnabled: false }}
            />
            <Stack.Screen
                name="login"
                options={{ gestureEnabled: false }}
            />
            <Stack.Screen
                name="signup"
                options={{ gestureEnabled: false }}
            />
        </Stack>
    );
}
