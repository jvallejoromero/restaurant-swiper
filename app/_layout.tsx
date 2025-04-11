import { Stack } from "expo-router";
import './globals.css';

export default function RootLayout() {
  return <Stack >
    <Stack.Screen
        name="restaurants/[id]"
        options={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
    />
    <Stack.Screen
        name="(tabs)"
        options={{headerShown: false}}
    />
  </Stack>
}
