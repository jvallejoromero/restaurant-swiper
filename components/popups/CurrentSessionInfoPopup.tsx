import {ActivityIndicator, Share, Text, TouchableOpacity, View} from "react-native";
import React, {RefObject, useCallback, useEffect, useState} from "react";
import * as Location from "expo-location";
import * as Clipboard from "expo-clipboard";
import PopupMessage, {PopupMessageRef} from "@/components/popups/PopupMessage";
import {MaterialCommunityIcons} from "@expo/vector-icons";
import {COLORS} from "@/constants/colors";
import SessionQRCode from "@/components/session/SessionQRCode";
import {SwipingSession} from "@/services/DatabaseService";
import {useServices} from "@/context/ServicesContext";
import {useToast} from "@/context/ToastContext";
import {ToastType} from "@/hooks/ToastHook";

type CurrentSessionInfoProps = {
    session: SwipingSession | null;
    popupRef: RefObject<PopupMessageRef | null>;
}

type GeoInfo = {
    city: string | null;
    region: string | null;
    country: string | null;
    fallback: string;
}

const ActionButton = ({ label, loading, onPress }: { label: string, loading: boolean, onPress: () => {}}) => {
    return (
        <TouchableOpacity
            onPress={onPress}
            className="mt-4 py-2 bg-primary rounded-lg"
        >
            {loading ? (
                <ActivityIndicator size={22} color={"white"} />
            ) : (
                <Text className="text-white text-lg text-center font-semibold">{label}</Text>
            )}
        </TouchableOpacity>
    );
}

const CurrentSessionInfoPopup = ({ session, popupRef }: CurrentSessionInfoProps) => {
    const { user, database } = useServices();
    const { showToast } = useToast();

    const [inviteUrl, setInviteUrl] = useState("");
    const [geoInfo, setGeoInfo] = useState<GeoInfo>({ city: null, region: null, country: null, fallback: "Your area" });
    const [isButtonActive, setIsButtonActive] = useState<boolean>(false);
    const [liveParticipantCount, setLiveParticipantCount] = useState<number | undefined>(undefined);

    useEffect(() => {
        if (!session) {
            return;
        }
        Location.reverseGeocodeAsync(session.location.coords).then((info) => {
            if (info.length) {
                const { city, region, country } = info[0];
                setGeoInfo({ city, region, country, fallback: "Your area" });
            }
        });
        const unsub = database.onSessionUpdates(session.id, (realTimeSession: SwipingSession) => {
            setLiveParticipantCount(realTimeSession.participantCount);
        });
        setInviteUrl(`https://forked-app.com/join-session?id=${session?.id}`);

        return unsub;
    }, [session]);

    const onCopyLink = useCallback(() => {
        void Clipboard.setStringAsync(inviteUrl);
        showToast("Copied to Clipboard");
    }, [inviteUrl, showToast]);

    const onShare = useCallback(async () => {
        try {
            await Share.share({
                message: `Join my session "${session?.title}": ${inviteUrl}`,
            });
        } catch {}
    }, [session?.title, inviteUrl]);

    if (!session) {
        return null;
    }

    const handleEndSession = async() => {
        setIsButtonActive(true);
        try {
            await database.endSession(session.id);
        } catch (error) {
            if (error instanceof Error) {
                showToast(error.message, ToastType.ERROR);
            } else {
                showToast(`An unknown error occurred:\n${String(error)}`);
            }
            setIsButtonActive(false);
            return;
        }
        setIsButtonActive(false);
        popupRef.current?.close();
        showToast("You ended the session.");
    }

    const handleLeaveSession = async() => {
        if (!user?.uid) return;
        setIsButtonActive(true);
        try {
            await database.removeUserFromSession(session.id, user.uid);
        } catch (error) {
            showToast("An error occurred while leaving the session. Please contact the developer.", ToastType.ERROR);
            setIsButtonActive(false);
            return;
        }
        setIsButtonActive(false);
        showToast(`You left the session.`);
    }

    return (
        <PopupMessage
            ref={popupRef}
            className="bg-neutral-100 rounded-xl p-6 w-[90%] max-w-sm shadow-xl shadow-neutral-900/40"
        >
            <View className="px-4 gap-4">
                <View className="flex-row justify-between">
                    <Text className="text-xl font-semibold">
                        {session.title}
                    </Text>
                    <TouchableOpacity
                        onPress={() => popupRef.current?.close()}
                        hitSlop={{ top: 50, bottom: 50, left: 50, right: 50 }}
                    >
                        <MaterialCommunityIcons
                            name="close"
                            size={18}
                            color={COLORS.accent_grey}
                        />
                    </TouchableOpacity>
                </View>

                <Text className="text-lg">Invite your friends and start swiping!</Text>
                <View className="flex-row justify-between">
                    <View className="flex-row items-center gap-2">
                        <MaterialCommunityIcons
                            name="map-marker"
                            size={24}
                            color={COLORS.primary}
                        />
                        <Text className="font-semibold">
                            {geoInfo.city ?? geoInfo.country ?? geoInfo.country ?? geoInfo.fallback}
                        </Text>
                    </View>
                    <View className="flex-row items-center gap-2">
                        <MaterialCommunityIcons
                            name="account-group"
                            size={24}
                            color={COLORS.primary}
                        />
                        <Text className="font-semibold">
                            {liveParticipantCount}{" "}Participating
                        </Text>
                    </View>
                </View>

                <View className="gap-5">
                    <SessionQRCode sessionId={session.id} />
                    <Text className="text-sm text-gray-600">
                        Scan to join or use the share button below
                    </Text>
                </View>

                <View className="flex-row justify-around">
                    <TouchableOpacity
                        onPress={onCopyLink}
                        className="px-4 py-2 border border-gray-300 rounded-lg"
                    >
                        <Text>Copy Link</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={onShare}
                        className="px-4 py-2 bg-primary rounded-lg"
                    >
                        <Text className="text-white">Share</Text>
                    </TouchableOpacity>
                </View>
                {user?.uid === session.createdBy ? (
                    <ActionButton label={"End Session"} loading={isButtonActive} onPress={handleEndSession} />
                ) : (
                    <ActionButton label={"Leave Session"} loading={isButtonActive} onPress={handleLeaveSession} />
                )}
            </View>
        </PopupMessage>
    );
}

export default CurrentSessionInfoPopup;