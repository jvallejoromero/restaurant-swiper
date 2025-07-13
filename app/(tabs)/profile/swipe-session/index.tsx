import {
    SafeAreaView,
    View,
    Text,
    Pressable,
    FlatList,
    Image,
    ListRenderItem,
    StyleSheet,
    ScrollView,
    RefreshControl
} from "react-native";
import React from "react";
import BackNavigationHeader from "@/components/headers/BackNavigationHeader";
import Separator from "@/components/ui/Separator";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import {CardsSwipeAnimation} from "@/components/animations/LoadingAnimations";

type MockData = {
    id: string;
    title: string;
    updatedAt: Date;
    coverImageUrl: string;
}

const mockSessions: MockData[] = [
    {
        id: "1",
        title: "Downtown Brunch Crawl",
        updatedAt: new Date("2025-07-01T11:30:00"),
        coverImageUrl: "https://picsum.photos/seed/brunch/200/140",
    },
    {
        id: "2",
        title: "Hidden Gem Tour",
        updatedAt: new Date("2025-06-28T15:45:00"),
        coverImageUrl: "https://picsum.photos/seed/gems/200/140",
    },
    {
        id: "3",
        title: "Coffee Shop Hop",
        updatedAt: new Date("2025-06-25T08:00:00"),
        coverImageUrl: "https://picsum.photos/seed/coffee/200/140",
    },
];

export default function SessionsScreen() {

    const renderSession: ListRenderItem<MockData> = ({ item }) => (
        <View className="w-48 h-64 mr-4 my-2 rounded-lg shadow shadow-black/30">
            <View className="flex-1 bg-white rounded-lg overflow-hidden">
                <Image
                    source={{ uri: item.coverImageUrl }}
                    className="h-32 w-full"
                    resizeMode="cover"
                />
                <View className="p-4 flex-1 justify-between">
                    <Text className="text-accent-grey font-semibold text-lg">
                        {item.title}
                    </Text>
                    <Text className="text-accent-grey text-sm">
                        {item.updatedAt.toLocaleDateString()}
                        {" "}
                        {item.updatedAt.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                        })}
                    </Text>
                </View>
            </View>
        </View>
    );

    return (
        <SafeAreaView className="relative flex-1 bg-background">
            <BackNavigationHeader label="Sessions" />
            <Separator className="mt-4 mx-6" />
            <ScrollView refreshControl={<RefreshControl refreshing={false} onRefresh={()=>{console.log("Refreshing...")}} />}>
                <View className="px-6 gap-4">
                    <View>
                        <CardsSwipeAnimation width={250} height={250} />
                        <Text className="text-center font-semibold text-lg text-accent-grey">
                            Ready to swipe your way through the city’s best spots?
                        </Text>
                    </View>
                    <Pressable
                        onPress={() => {}}
                        className="w-full h-28 rounded-2xl overflow-hidden"
                    >
                        <LinearGradient
                            colors={["#d52e4c", "#e53946", "#e53946", "#b71c1c"]}
                            start={[0, 0]}
                            end={[1, 1]}
                            style={styles.gradientCard}
                        >
                            <Feather name="plus" size={32} color="white" />
                            <Text className="text-white ml-3 text-xl font-semibold">
                                Create Session
                            </Text>
                        </LinearGradient>
                    </Pressable>
                    <View>
                        <Text className="text-black font-medium">
                            Recent Sessions
                        </Text>
                        <FlatList<MockData>
                            data={mockSessions}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            snapToInterval={ (192) }
                            decelerationRate="fast"
                            keyExtractor={(item) => item.id}
                            renderItem={renderSession}
                        />
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    gradientCard: {
        flex: 1,
        paddingHorizontal: 20,
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 16,
    },
});
