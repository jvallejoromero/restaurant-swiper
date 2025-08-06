import { FlatList, Pressable, Text, View } from "react-native";
import React, { useState } from "react";
import { COLORS } from "@/constants/colors";
import { Image } from "expo-image";
import { getTimeSince } from "@/utils/DateUtils";
import { SessionMatch } from "@/services/DatabaseService";
import { Place, PlaceType } from "@/types/Places.types";

type SessionMatchesProps = {
    matches: SessionMatch[];
    places: Place[];
};

type MatchTab = PlaceType | "latest";

const SessionMatches = ({ matches, places }: SessionMatchesProps) => {
    const [activeTab, setActiveTab] = useState<MatchTab>("latest");

    const enrichedMatches = matches.flatMap(match => {
        const place = places.find(p => p.id === match.placeId);
        return place ? [{ ...match, place }] : [];
    });

    const filteredMatches =
        activeTab === "latest"
            ? enrichedMatches.sort((a, b) => b.matchedAt.toMillis() - a.matchedAt.toMillis())
            : enrichedMatches
                .filter(m => m.place.type === activeTab)
                .sort((a, b) => b.matchedAt.toMillis() - a.matchedAt.toMillis());

    const getLabel = (tab: MatchTab) => {
        if (tab === "latest") return "Recent";
        if (tab === "restaurant") return "Restaurants";
        return "Attractions";
    };

    const TabButtons = () => {
        const tabs: MatchTab[] = ["latest", "restaurant", "tourist_attraction"];

        return (
            <View className="flex-row justify-center gap-2 pb-4">
                {tabs.map(tab => (
                    <Pressable
                        key={tab}
                        onPress={() => setActiveTab(tab)}
                        className="px-6 py-2 rounded-full"
                        style={{
                            backgroundColor: activeTab === tab ? COLORS.primary : "#e5e7eb",
                        }}
                    >
                        <Text
                            className={`text-sm font-semibold ${
                                activeTab === tab ? "text-white" : "text-accent-gray"
                            }`}
                        >
                            {getLabel(tab)}
                        </Text>
                    </Pressable>
                ))}
            </View>
        );
    };

    const Header = () => (
        <Text className="text-2xl font-bold text-accent-gray text-center pt-4 pb-2">
            Session Matches ({ filteredMatches.length })
        </Text>
    );

    if (filteredMatches.length === 0) {
        return (
            <View className="flex-1 px-4">
                <View className="px-4 gap-2">
                    <Header />
                    <TabButtons />
                </View>
                <View className="flex-1 items-center justify-center px-4">
                    <Text className="text-lg text-center text-accent-gray">
                        No matches{activeTab !== "latest" ? ` for ${getLabel(activeTab)}` : ""} yet.
                    </Text>
                </View>
            </View>
        );
    }

    return (
        <View className="px-4 gap-2">
            <Header />
            <TabButtons />
            <FlatList
                data={filteredMatches}
                keyExtractor={(item) => item.placeId}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ gap: 16, flexGrow: 1, paddingBottom: 200 }}
                renderItem={({ item }) => (
                    <View className="bg-white rounded-xl shadow-sm border border-gray-100">
                        <Image
                            source={{ uri: item.place.photoUrl }}
                            style={{
                                width: "100%",
                                height: 120,
                                borderTopLeftRadius: 12,
                                borderTopRightRadius: 12,
                            }}
                            contentFit="cover"
                            cachePolicy="memory"
                            transition={300}
                        />
                        <View className="p-3 gap-0.5">
                            <Text className="text-base font-semibold" numberOfLines={1}>
                                {item.place.name}
                            </Text>
                            <Text className="text-xs text-accent-gray" numberOfLines={1}>
                                {item.place.vicinity}
                            </Text>
                            <Text className="text-[11px] text-accent-gray mt-1">
                                Liked by {item.matchedBy.length}{" "}
                                {item.matchedBy.length === 1 ? "user" : "users"}
                            </Text>
                            <Text className="text-[11px] text-accent-gray">
                                {getTimeSince(item.matchedAt.toDate())}
                            </Text>
                        </View>
                    </View>
                )}
            />
        </View>
    );
};

export default SessionMatches;
