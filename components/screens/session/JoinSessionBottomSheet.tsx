import {Text, View, TouchableOpacity} from "react-native";
import React, {useEffect, useMemo, useState} from "react";
import BottomSheet, {BottomSheetScrollView} from "@gorhom/bottom-sheet";
import {SwipingSession} from "@/services/DatabaseService";
import { Ionicons } from "@expo/vector-icons";
import { useServices } from "@/context/ServicesContext";

type JoinSessionBottomSheetProps = {
    loading: boolean;
    sheetRef: React.RefObject<BottomSheet | null>;
    index?: number;
    onChange?: (index: number) => void;
    session: SwipingSession | null | undefined;
    onJoinSession: () => void;
}

const snapPoints = useMemo(() => ["25%", "50%", "75%"], []);

const JoinSessionBottomSheet = ({ loading, sheetRef, index, onChange, session, onJoinSession }: JoinSessionBottomSheetProps) => {
    const { database } = useServices();

    useEffect(() => {
        if (session) {
            (async () => {
                console.log("getting owner data..");
                console.log("user id:", session.createdBy);
                let profile;
                try {
                    profile = await database.getUserProfile(session.createdBy);
                } catch (err) {
                    console.log(err);
                    alert("error fetching owner data.");
                }
                console.log(profile);
            })();

        }
    }, [session?.id]);

    if (session === undefined  || session === null) {
        return null;
    }

    return (
        <BottomSheet
            ref={sheetRef}
            index={index}
            onChange={onChange}
            snapPoints={snapPoints}
            enablePanDownToClose
            backgroundStyle={{ borderRadius: 16 }}
            handleIndicatorStyle={{ backgroundColor: "#d52e4c", width: 40 }}
        >
            <BottomSheetScrollView className="py-4 px-6">
                <Text className="text-2xl font-bold text-center">
                    {session.title ?? "Untitled Session"}
                </Text>

                <View className="flex-row items-center">
                    <Ionicons name="person-circle-outline" size={24} color="#555" />
                    <Text className="ml-2 text-gray-700">
                        {session.createdBy}·{" "}
                        {session.createdAt.toDate().toLocaleTimeString()}
                    </Text>
                </View>

                {session.description ? (
                    <Text className="text-gray-600">{session.description}</Text>
                ) : null}

                <TouchableOpacity
                    onPress={onJoinSession}
                    disabled={loading}
                    className={`py-3 rounded-lg items-center ${
                        loading ? "bg-gray-300" : "bg-red-600"
                    }`}
                >
                    <Text className="text-white text-lg font-semibold">
                        {loading ? "Joining…" : "Join Session"}
                    </Text>
                </TouchableOpacity>
            </BottomSheetScrollView>
        </BottomSheet>
    );
}

export default JoinSessionBottomSheet;