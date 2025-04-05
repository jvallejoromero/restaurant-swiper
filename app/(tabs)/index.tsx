import {Text, View} from "react-native";
import RestaurantView from "@/components/RestaurantView";

export default function Index() {
  return (
    <View className="flex-1 bg-primary">
        <View className="flex-1 mt-5">
            <RestaurantView/>
        </View>
    </View>
  );
}
