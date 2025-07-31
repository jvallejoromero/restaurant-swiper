import "react-native-gesture-handler";
import { Stack } from "expo-router";
import './globals.css';
import {ServicesProvider} from "@/context/ServicesContext";
import {UserLocationProvider} from "@/context/UserLocationContext";
import { COLORS } from "@/constants/colors";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SwipingSessionProvider } from "@/context/SwipingSessionContext";
import {ToastProvider} from "@/context/ToastContext";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";

export default function RootLayout() {
  return (
      <GestureHandlerRootView style={{ flex: 1 }}>
          <ToastProvider>
              <BottomSheetModalProvider>
                  <UserLocationProvider>
                      <ServicesProvider>
                          <SwipingSessionProvider>
                              <Stack
                                  screenOptions={{
                                      contentStyle: { backgroundColor: COLORS.background_color },
                                      headerStyle:  { backgroundColor: COLORS.background_color },
                                      headerShown: false,
                                  }}
                              >
                                  <Stack.Screen
                                      name="(tabs)"
                                      options={{ headerShown: false }}
                                  />
                              </Stack>
                          </SwipingSessionProvider>
                      </ServicesProvider>
                  </UserLocationProvider>
              </BottomSheetModalProvider>
          </ToastProvider>
      </GestureHandlerRootView>
  );
}
