import { SafeAreaView, ScrollView, Text, View } from "react-native";
import React from "react";
import { useActiveSwipingSession } from "@/context/SwipingSessionContext";
import {SwipingSession} from "@/services/DatabaseService";

const SWIPING_SESSION_KEYS: (keyof SwipingSession)[] = [
    "id",
    "createdBy",
    "createdAt",
    "expiresAt",
    "status",
    "participantCount",
    "location",
    "places",
    "title",
    "description",
    "radius",
    "filters",
];

function orderObject<T extends object>(obj: T | null | undefined, keys: (keyof T)[]): Partial<T> | null {
    if (!obj) return null;
    const ordered: Partial<T> = {};
    for (const key of keys) {
        if (key in obj) {
            ordered[key] = obj[key];
        }
    }
    return ordered;
}

const DebugActiveSessionScreen = () => {
    const { activeSession, participants, places, swipes, sessionResolved, loading, error } = useActiveSwipingSession();

    return (
        <SafeAreaView className="flex-1">
            <ScrollView className="p-4">
                <View className="gap-2">
                    <Text className="font-bold text-lg">🔍 Swiping Session Debug Info</Text>

                    <Text className="text-xs">🟢 activeSession:</Text>
                    <Text className="text-xs font-mono bg-gray-100 p-2 rounded">
                        {JSON.stringify(orderObject(activeSession, SWIPING_SESSION_KEYS), null, 2)}
                    </Text>

                    <Text className="text-xs">👥 participants:</Text>
                    <Text className="text-xs font-mono bg-gray-100 p-2 rounded">
                        {JSON.stringify(participants, null, 2)}
                    </Text>

                    <Text className="text-xs">📍 places:</Text>
                    <Text className="text-xs font-mono bg-gray-100 p-2 rounded">
                        {JSON.stringify(places, null, 2)}
                    </Text>

                    <Text className="text-xs">👉 swipes:</Text>
                    <Text className="text-xs font-mono bg-gray-100 p-2 rounded">
                        {JSON.stringify(swipes, null, 2)}
                    </Text>

                    <Text className="text-xs">⏳ loading: {String(loading)}</Text>
                    <Text className="text-xs">✅ sessionResolved: {String(sessionResolved)}</Text>

                    {error && (
                        <>
                            <Text className="text-xs text-red-600">⚠️ error:</Text>
                            <Text className="text-xs font-mono bg-red-100 p-2 rounded">{error.message}</Text>
                        </>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default DebugActiveSessionScreen;
