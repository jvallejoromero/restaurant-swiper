import {ScrollView, Text, TouchableOpacity, View} from "react-native";
import React, {useEffect, useMemo, useRef, useState} from "react";
import {BottomSheetModal, BottomSheetScrollView} from "@gorhom/bottom-sheet";
import {AppUserProfile, SwipingSession} from "@/services/DatabaseService";
import {Ionicons} from "@expo/vector-icons";
import {useServices} from "@/context/ServicesContext";
import MapView, {Marker} from "react-native-maps";
import CachedAvatar from "@/components/avatar/CachedAvatar";
import {useLocationName} from "@/hooks/useLocationName";
import {getTimeSince} from "@/utils/DateUtils";
import {useToast} from "@/context/ToastContext";
import {ToastType} from "@/hooks/useToastHook";
import {router} from "expo-router";

type JoinSessionBottomSheetProps = {
    isJoiningSession: boolean;
    isLeavingSession: boolean;
    isEndingSession: boolean;
    sheetRef: React.RefObject<BottomSheetModal | null>;
    onChange?: (index: number) => void;
    session: SwipingSession | null | undefined;
    alreadyInSession: boolean;
    onJoinSession: (sessionId: string) => void;
    onLeaveSession: (sessionId: string) => void;
    onEndSession: (sessionId: string) => void;
}

const ActionButton = ({ label, loadingLabel, loading, onPress}: { label: string, loadingLabel: string, loading: boolean, onPress: () => void }) => {
    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={loading}
            className={`py-3 rounded-lg items-center ${
                loading ? "bg-gray-300" : "bg-red-600"
            }`}
        >
            <Text className="text-white text-lg font-semibold">
                {loading ? loadingLabel : label}
            </Text>
        </TouchableOpacity>
    );
}

const getActionButtonDescription = (ownerName: string, participantCount: number, alreadyInSession: boolean): string => {
    if (alreadyInSession) {
        return "You are currently in this session.";
    }
    const countWithoutOwner =  Math.max(0, participantCount - 1);
    if (countWithoutOwner <= 0) {
        return `Be the first to join ${ownerName}'s session.`;
    } else if (countWithoutOwner === 1) {
        return `Join ${ownerName} and 1 other`;
    } else {
        return `Join ${ownerName} and ${countWithoutOwner} others`;
    }
}

const JoinSessionBottomSheet = ({
    isJoiningSession, isLeavingSession, isEndingSession,
    sheetRef, onChange, session, alreadyInSession,
    onJoinSession, onLeaveSession, onEndSession
}: JoinSessionBottomSheetProps) => {
    const [sessionOwner, setSessionOwner] = useState<AppUserProfile | null>(null);
    const [liveParticipantCount, setLiveParticipantCount] = useState<number>(0);
    const sawSession = useRef<boolean>(false);
    const snapPoints = useMemo(() => ["25%", "50%", "80%", "90%"], []);

    const { user, database } = useServices();
    const { locationName } = useLocationName(session?.location);
    const { showToast } = useToast();

    useEffect(() => {
        if (!session) {
            return;
        }
        (async () => {
            const profile = await database.getUserProfile(session.createdBy);
            setSessionOwner(profile);
        })();
        return database.onSessionUpdates(session.id, (realTimeSession: (SwipingSession | null)) => {
            if (!realTimeSession) {
                if (sawSession.current) {
                    sheetRef.current?.dismiss();
                    router.dismissAll();
                    router.push("/profile/swipe-session");
                    showToast("That session was deleted by the owner!", ToastType.ERROR);
                }
                return;
            }
            sawSession.current = true;
            setLiveParticipantCount(realTimeSession.participantCount);
        });
    }, [session?.id]);

    useEffect(() => {
        if (sessionOwner) {
            sheetRef.current?.present();
        }
    }, [sessionOwner]);

    if (!session || sessionOwner === null) {
        return null;
    }

    const Header = () => (
        <View className="px-6 pt-4 pb-2 bg-white rounded-full flex-row items-center justify-between">
            <View className="w-12 h-1.5 bg-gray-300 rounded mx-auto" />
            <TouchableOpacity onPress={() => sheetRef.current?.dismiss()}>
                <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
        </View>
    );

    const viewerIsOwner = user?.uid === session.createdBy;
    const canJoin = !alreadyInSession;
    const canEnd = alreadyInSession && viewerIsOwner;
    const canLeave = alreadyInSession && !viewerIsOwner;
    let actionLabel: string, loadingLabel: string, actionLoading: boolean, onAction: () => void;

    if (canJoin) {
        actionLabel = "Join Session";
        loadingLabel = "Joining...";
        actionLoading = isJoiningSession;
        onAction = () => onJoinSession(session.id);
    } else if (canLeave) {
        actionLabel = "Leave Session";
        loadingLabel = "Leaving...";
        actionLoading = isLeavingSession;
        onAction = () => onLeaveSession(session.id);
    } else if (canEnd) {
        actionLabel = "End Session";
        loadingLabel = "Ending...";
        actionLoading = isEndingSession;
        onAction = () => onEndSession(session.id);
    } else {
        actionLabel = "Join Session";
        loadingLabel = "Joining...";
        actionLoading = isJoiningSession;
        onAction = () => onJoinSession(session.id);
    }

    const descriptionText = isLeavingSession
        ? (viewerIsOwner
            ? "You are the owner of this session."
            : "You are currently in this session")
        : (viewerIsOwner
            ? "You are the owner of this session."
            : getActionButtonDescription(sessionOwner.displayName ?? sessionOwner.username, liveParticipantCount, alreadyInSession));


    return (
        <BottomSheetModal
            ref={sheetRef}
            index={4}
            onChange={onChange}
            snapPoints={snapPoints}
            enablePanDownToClose
            handleComponent={Header}
            backgroundStyle={{ shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 10 }}
        >
            <BottomSheetScrollView className="py-4 px-6">
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
            <View className="py-4 px-6 mb-safe border-t border-gray-200 bg-white">
                <Text
                    className="text-sm text-gray-500 mb-2"
                    numberOfLines={2}
                    ellipsizeMode="tail"
                >
                    {descriptionText}
                </Text>
                <ActionButton
                    label={actionLabel}
                    loadingLabel={loadingLabel}
                    loading={actionLoading}
                    onPress={onAction}
                />
            </View>
        </BottomSheetModal>
    );
}

export default JoinSessionBottomSheet;