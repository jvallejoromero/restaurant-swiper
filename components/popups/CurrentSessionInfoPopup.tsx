import {ActivityIndicator, Share, Text, TouchableOpacity, View} from "react-native";
import React, {RefObject, useCallback, useEffect, useState} from "react";
import * as Location from "expo-location";
import * as Clipboard from "expo-clipboard";
import PopupMessage, { PopupMessageRef } from "@/components/popups/PopupMessage";
import {MaterialCommunityIcons} from "@expo/vector-icons";
import {COLORS} from "@/constants/colors";
import SessionQRCode from "@/components/session/SessionQRCode";
import { SwipingSession } from "@/services/DatabaseService";
import {useServices} from "@/context/ServicesContext";
import { useToast } from "@/context/ToastContext";

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

const CurrentSessionInfoPopup = ({ session, popupRef }: CurrentSessionInfoProps) => {
    const { user, database } = useServices();
    const { showToast } = useToast();

    const [inviteUrl, setInviteUrl] = useState("");
    const [geoInfo, setGeoInfo] = useState<GeoInfo>({ city: null, region: null, country: null, fallback: "Your area" });
    const [endingSession, setEndingSession] = useState<boolean>(false);

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
        setInviteUrl(`https://forked-app.com/join-session?id=${session?.id}`);
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
        setEndingSession(true);
        await database.endSession(session.id);
        setEndingSession(false);
        popupRef.current?.close();
    }

    return (
        <PopupMessage
            ref={popupRef}
            className="bg-neutral-100 rounded-xl p-6 w-[90%] max-w-sm shadow-xl shadow-neutral-900/40"
        >
            <View className="relative px-4 gap-4">
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

                <Text className="text-lg">The session’s live—swipe and dive in!</Text>
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
                            {session.participantCount}{" "}Participating
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
                {user?.uid === session.createdBy && (
                    <TouchableOpacity
                        onPress={handleEndSession}
                        className="mt-4 py-2 bg-primary rounded-lg"
                    >
                        {endingSession ? (
                            <ActivityIndicator size={22} color={"white"} />
                        ) : (
                            <Text className="text-white text-lg text-center font-semibold">End Session</Text>
                        )}
                    </TouchableOpacity>
                )}
            </View>
        </PopupMessage>
    );
}

export default CurrentSessionInfoPopup;