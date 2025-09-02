import React, {useMemo, useState} from "react";
import {ActivityIndicator, FlatList, Pressable, Text, View} from "react-native";
import {COLORS} from "@/constants/colors";
import {Image} from "expo-image";
import {getTimeSince} from "@/utils/DateUtils";
import {SessionMatch} from "@/services/DatabaseService";
import {Place, PlaceType} from "@/types/Places.types";
import {useFirebasePhotoUri} from "@/hooks/useFirebasePhotoUri";

type SessionMatchesProps = {
    matches: SessionMatch[];
    places: Place[];
};

type MatchTab = PlaceType | "latest";
type MatchItem = SessionMatch & { place: Place };

const PAGE_SIZE = 10;

const SessionMatches = ({ matches, places }: SessionMatchesProps) => {
    const [activeTab, setActiveTab] = useState<MatchTab>("latest");
    const [page, setPage] = useState(1);
    const [loadingMore, setLoadingMore] = useState(false);

    const enrichedMatches = useMemo(() => {
        return matches.flatMap(match => {
            const place = places.find(p => p.id === match.placeId);
            return place ? [{ ...match, place }] : [];
        });
    }, [matches, places]);

    const filteredMatches = useMemo(() => {
        return activeTab === "latest"
            ? enrichedMatches.sort((a, b) => b.matchedAt.toMillis() - a.matchedAt.toMillis())
            : enrichedMatches
                .filter(m => m.place.type === activeTab)
                .sort((a, b) => b.matchedAt.toMillis() - a.matchedAt.toMillis());
    }, [activeTab, enrichedMatches]);

    const visibleMatches = filteredMatches.slice(0, page * PAGE_SIZE);

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
                        onPress={() => {
                            setActiveTab(tab);
                            setPage(1);
                        }}
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
            Session Matches ({filteredMatches.length})
        </Text>
    );

    const MatchCard = ({ item }: { item: MatchItem }) => {
        const resolvedUrl = useFirebasePhotoUri(item.place.photoUrl);
        return (
            <View className="bg-white rounded-xl shadow-sm border border-gray-100">
                <Image
                    source={{ uri: resolvedUrl }}
                    style={{
                        width: "100%",
                        height: 120,
                        borderTopLeftRadius: 12,
                        borderTopRightRadius: 12,
                    }}
                    contentFit="cover"
                    cachePolicy="disk"
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
        );
    }

    const handleLoadMore = () => {
        if (loadingMore || visibleMatches.length >= filteredMatches.length) return;
        setLoadingMore(true);
        setTimeout(() => {
            setPage(prev => prev + 1);
            setLoadingMore(false);
        }, 500);
    };

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
                data={visibleMatches}
                keyExtractor={(item) => item.placeId}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ gap: 16, paddingBottom: 200 }}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.6}
                ListFooterComponent={
                    loadingMore ? (
                        <View className="py-4">
                            <ActivityIndicator size="small" color={COLORS.accent_grey} />
                        </View>
                    ) : null
                }
                renderItem={({ item }) => <MatchCard key={item.place.id} item={item} />}
            />
        </View>
    );
};

export default SessionMatches;
