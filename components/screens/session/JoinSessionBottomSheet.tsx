import {Text, View, TouchableOpacity, ScrollView} from "react-native";
import React, {useEffect, useMemo, useState} from "react";
import BottomSheet, {BottomSheetScrollView} from "@gorhom/bottom-sheet";
import {AppUserProfile, SessionParticipant, SwipingSession} from "@/services/DatabaseService";
import { Ionicons } from "@expo/vector-icons";
import { useServices } from "@/context/ServicesContext";
import MapView, {Marker} from "react-native-maps";
import CachedAvatar from "@/components/avatar/CachedAvatar";
import {useLocationName} from "@/hooks/LocationNameHook";
import {getTimeSince} from "@/utils/DateUtils";

type JoinSessionBottomSheetProps = {
    isJoiningSession: boolean;
    isLeavingSession: boolean;
    sheetRef: React.RefObject<BottomSheet | null>;
    onChange?: (index: number) => void;
    session: SwipingSession | null | undefined;
    participants?: SessionParticipant[];
    onJoinSession: (sessionId: string) => void;
    onLeaveSession: (sessionId: string) => void;
}

const JoinSessionBottomSheet = ({ isJoiningSession, isLeavingSession, sheetRef, onChange, session, participants, onJoinSession, onLeaveSession }: JoinSessionBottomSheetProps) => {
    const [sessionOwner, setSessionOwner] = useState<AppUserProfile | null>(null);
    const snapPoints = useMemo(() => ["25%", "50%", "75%", "90%"], []);

    const { user, database } = useServices();
    const { locationName } = useLocationName(session?.location);

    useEffect(() => {
        if (session) {
            (async () => {
                console.log("getting owner data..");
                console.log("user id:", session.createdBy);
                const profile = await database.getUserProfile(session.createdBy);
                setSessionOwner(profile);
            })();
        }
    }, [session?.id]);

    const handleLayout = () => {
        if (sessionOwner) {
            sheetRef.current?.expand();
        }
    }

    if (!session || sessionOwner === null) {
        return null;
    }

    const Header = () => (
        <View className="px-6 pt-4 pb-2 bg-white rounded-t-2xl flex-row items-center justify-between">
            <View className="w-12 h-1.5 bg-gray-300 rounded mx-auto" />
            <TouchableOpacity onPress={() => sheetRef.current?.close()}>
                <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
        </View>
    );

    return (
        <BottomSheet
            ref={sheetRef}
            index={-1}
            onChange={onChange}
            snapPoints={snapPoints}
            enablePanDownToClose
            backgroundStyle={{ borderRadius: 16 }}
            handleComponent={Header}
            handleIndicatorStyle={{ backgroundColor: "#d52e4c", width: 40 }}
        >
            <BottomSheetScrollView className="py-4 px-6" onLayout={handleLayout}>
                <View className="gap-4 mb-8">
                    <View>
                        <Text
                            className="text-2xl font-bold text-center"
                            numberOfLines={1}
                            ellipsizeMode="tail"
                        >
                            {session.title ?? "Untitled Session"}
                        </Text>
                        {session.description ? (
                            <Text
                                numberOfLines={2}
                                ellipsizeMode="tail"
                                className="text-gray-600 text-center"
                            >
                                {session.description}
                            </Text>
                        ) : null}
                    </View>

                    <MapView
                        style={{ height: 200, borderRadius: 12 }}
                        initialRegion={{
                            latitude: session.location.coords.latitude,
                            longitude: session.location.coords.longitude,
                            latitudeDelta: 0.1,
                            longitudeDelta: 0.1,
                        }}
                        scrollEnabled={false}
                        zoomEnabled={false}
                    >
                        <Marker coordinate={session.location.coords} />
                    </MapView>

                    <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center gap-1 flex-1 mr-8">
                            <Ionicons name="map-outline"  size={20} color="#555" />
                            <Text
                                className="text-gray-700"
                                numberOfLines={1}
                                ellipsizeMode="tail"
                            >
                                {locationName ?? "Loading location…"}
                            </Text>
                        </View>
                        <View className="flex-row items-center gap-1 flex-shrink-0">
                            <Ionicons name="scan-circle-outline" size={20} color="#555" />
                            <Text className="text-gray-700">
                                Radius: {session.radius} km
                            </Text>
                        </View>
                    </View>

                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {session.filters?.map((f) => (
                            <View
                                key={f}
                                className="bg-gray-200 px-3 py-1 rounded-full mr-2"
                            >
                                <Text className="text-gray-700">{f}</Text>
                            </View>
                        ))}
                    </ScrollView>

                    {sessionOwner && (
                        <View>
                            <View className="flex-row items-center gap-2">
                                <Text className="text-gray-700 text-lg">Session By:</Text>
                                <CachedAvatar
                                    userId={session.createdBy}
                                    photoUrl={sessionOwner.photoURL}
                                    size={24}
                                />
                                <Text className="text-gray-700 text-lg">
                                    {sessionOwner.displayName ?? sessionOwner.username}
                                </Text>
                            </View>
                            <View className="flex-row items-center gap-2">
                                <Text className="text-gray-700 text-lg">Created:</Text>
                                <Text className="text-gray-700 text-lg">
                                    {getTimeSince(session.createdAt.toDate())}
                                </Text>
                            </View>
                        </View>
                    )}

                    <View className="gap-2 mt-4 bg-white rounded-lg p-4 shadow-sm mb-4">
                        <Text className="font-medium text-gray-800 mb-1">How it works:</Text>
                        <Text className="text-gray-600">• You’ll swipe cards one at a time.</Text>
                        <Text className="text-gray-600">• Swipe right to like, left to skip.</Text>
                        <Text className="text-gray-600">• A match happens when everyone likes the same spot.</Text>
                    </View>
                </View>
            </BottomSheetScrollView>
            <View className="py-4 px-6 border-t border-gray-200 bg-white">
                <Text className="text-sm text-gray-500 mb-2">
                    {session.participantCount > 1 ? (
                        <Text>
                            {`Join ${sessionOwner.displayName ?? sessionOwner.username} and ${session.participantCount} others`}
                        </Text>
                    ) : (
                        <Text>
                            {`Be the first to join ${sessionOwner.displayName ?? sessionOwner.username}'s session`}
                        </Text>
                    )}
                </Text>
                {(participants && participants.some(u => u.id === user?.uid)) && !isJoiningSession ? (
                    <TouchableOpacity
                        onPress={() => onLeaveSession(session.id)}
                        disabled={isLeavingSession}
                        className={`py-3 rounded-lg items-center ${
                            isLeavingSession ? "bg-gray-300" : "bg-red-600"
                        }`}
                    >
                        <Text className="text-white text-lg font-semibold">
                            {isLeavingSession ? "Leaving..." : "Leave Session"}
                        </Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        onPress={() => onJoinSession(session.id)}
                        disabled={isJoiningSession}
                        className={`py-3 rounded-lg items-center ${
                            isJoiningSession ? "bg-gray-300" : "bg-red-600"
                        }`}
                    >
                        <Text className="text-white text-lg font-semibold">
                            {isJoiningSession ? "Joining..." : "Join Session"}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
        </BottomSheet>
    );
}

export default JoinSessionBottomSheet;