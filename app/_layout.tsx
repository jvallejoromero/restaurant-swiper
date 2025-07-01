import { Stack } from "expo-router";
import './globals.css';
import {ServicesProvider} from "@/context/ServicesContext";
import {UserLocationProvider} from "@/context/UserLocationContext";
import { COLORS } from "@/constants/colors";

export default function RootLayout() {
  return (
      <UserLocationProvider>
          <ServicesProvider>
              <Stack
                  screenOptions={{
                      contentStyle: {
                          backgroundColor: COLORS.background_color,
                      },
                      headerStyle: {
                          backgroundColor: COLORS.background_color,
                      },
                  }}
              >
                  <Stack.Screen
                      name="restaurant/[id]"
                      options={{
                          headerShown: false,
                          animation: 'slide_from_right',
                      }}
                  />
                  <Stack.Screen
                      name="attraction/[id]"
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
          </ServicesProvider>
      </UserLocationProvider>
  );
}
