import {View} from "react-native";
import RestaurantView from "@/components/screens/RestaurantView";

export default function Index() {
  return (
    <View className="flex-1 bg-background">
        <View className="flex-1 mt-5">
            <RestaurantView />
        </View>
    </View>
  );
}
