import {SafeAreaView, ScrollView, Text, View} from "react-native";
import React from "react";
import {useActiveSwipingSession} from "@/context/SwipingSessionContext";

const DebugActiveSessionScreen = () => {
    const { activeSession, participants, places, swipes, loading, allLoaded, error } = useActiveSwipingSession();

    return (
        <SafeAreaView className="flex-1">
            <ScrollView className="p-4">
                <View className="gap-2">
                    <Text className="font-bold text-lg">🔍 Swiping Session Debug Info</Text>

                    <Text className="text-xs">🟢 activeSession:</Text>
                    <Text className="text-xs bg-gray-100 p-2 rounded">{JSON.stringify(activeSession, null, 2)}</Text>

                    <Text className="text-xs">👥 participants:</Text>
                    <Text className="text-xs bg-gray-100 p-2 rounded">{JSON.stringify(participants, null, 2)}</Text>

                    <Text className="text-xs">📍 places:</Text>
                    <Text className="text-xs bg-gray-100 p-2 rounded">{JSON.stringify(places, null, 2)}</Text>

                    <Text className="text-xs">👉 swipes:</Text>
                    <Text className="text-xs bg-gray-100 p-2 rounded">{JSON.stringify(swipes, null, 2)}</Text>

                    <Text className="text-xs">⏳ loading: {String(loading)}</Text>
                    <Text className="text-xs">✅ allLoaded: {String(allLoaded)}</Text>

                    {error && (
                        <>
                            <Text className="text-xs text-red-600">⚠️ error:</Text>
                            <Text className="text-xs bg-red-100 p-2 rounded">{error.message}</Text>
                        </>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

export default DebugActiveSessionScreen;