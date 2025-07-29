import {SafeAreaView, View} from "react-native";
import RestaurantView from "@/components/screens/RestaurantView";
import AppLogoHeader from "@/components/headers/AppLogoHeader";
import React from "react";

const Index = () => {
  return (
      <SafeAreaView className="flex-1">
          <View className="px-5 mt-4">
              <AppLogoHeader />
          </View>
          <RestaurantView />
      </SafeAreaView>
  );
}

export default Index;