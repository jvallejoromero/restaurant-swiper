import {
    FlatList,
    Image,
    ListRenderItem,
    Pressable,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    Text,
    View,
} from "react-native";
import React, {useCallback, useRef, useState} from "react";
import BackNavigationHeader from "@/components/headers/BackNavigationHeader";
import Separator from "@/components/ui/Separator";
import {Feather} from "@expo/vector-icons";
import {CardsSwipeAnimation} from "@/components/animations/LoadingAnimations";
import {BottomSheetModal} from "@gorhom/bottom-sheet";
import CreateSessionSheet, {CreateSessionOptions} from "@/components/screens/session/CreateSessionSheet";
import {useServices} from "@/context/ServicesContext";
import {Place} from "@/types/Places.types";
import {useActiveSwipingSession} from "@/context/SwipingSessionContext";
import PopupMessage, {PopupMessageRef} from "@/components/popups/PopupMessage";
import GenericButton from "@/components/buttons/GenericButton";
import CurrentSessionInfoPopup from "@/components/popups/CurrentSessionInfoPopup";
import {router} from "expo-router";
import BigActionButton from "@/components/buttons/BigActionButton";
import {useToast} from "@/context/ToastContext";
import {ToastType} from "@/hooks/useToastHook";

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

const OutlineCard = ({ onPress }: { onPress?: () => void }) => (
    <Pressable
        className="w-48 h-64 mr-4 my-2 rounded-lg border-2 border-dashed border-accent-grey/50 items-center justify-center"
        onPress={onPress}
    >
        <Feather name="plus" size={32} color="#555" />
        <Text className="text-accent-grey mt-2">Create Session</Text>
    </Pressable>
);

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

export default function SessionsScreen() {
    const sheetRef = useRef<BottomSheetModal>(null);
    const cannotCreateSessionRef = useRef<PopupMessageRef>(null);
    const activeSessionPopupRef = useRef<PopupMessageRef>(null);

    const [loadingSession, setLoadingSession] = useState<boolean>(false);

    const { loading, user, database } = useServices();
    const { activeSession } = useActiveSwipingSession();
    const { showToast } = useToast();

    const openBottomSheet = useCallback(() => {
        sheetRef.current?.present();
    }, []);

    if (loading || !user) {
        return null;
    }

    const handleCreateSession = async({title, description, radius, filters, participants, location} : CreateSessionOptions) => {
        if (activeSession) {
            sheetRef.current?.dismiss();
            showToast("You already have an active session. Please end it before creating a new one.", ToastType.ERROR);
            return;
        }

        const places: Place[] = [];
        const allParticipants = [...participants, user.uid];
        setLoadingSession(true);
        try {
            await database.createSession(user.uid, title, description, radius, filters, places, allParticipants, location);
        } catch (err) {
            if (err instanceof Error) {
                showToast(err.message, ToastType.ERROR);
            } else {
                showToast(`An unknown error occurred\n${String(err)}`, ToastType.ERROR);
            }
            setLoadingSession(false);
            return;
        }
        setLoadingSession(false);
        sheetRef.current?.dismiss();
        router.dismissAll();
        router.push("/");
        showToast("Created new session", ToastType.SUCCESS);
    }

    const ActiveSessionWarning = () => {
        return (
            <PopupMessage
                ref={cannotCreateSessionRef}
                className="bg-neutral-100 rounded-xl p-6 w-[90%] max-w-sm"
                bgClassname="bg-black/60"
            >
                <View className="items-center gap-3">
                    <Text className="text-2xl font-bold text-primary">
                        Warning
                    </Text>
                    <Text className="text-lg text-gray-600 text-center leading-snug">
                        You already have an active session.
                        {"\n"}Please end it before creating a new one.
                    </Text>
                    <GenericButton
                        text="Okay"
                        onPress={() => cannotCreateSessionRef.current?.close()}
                    />
                </View>
            </PopupMessage>
        );
    }

    const RecentSessions = () => {
        return (
            <View>
                <Text className="text-black font-medium">
                    Recent Sessions {activeSession && "(1 in progress)"}
                </Text>
                <FlatList
                    data={[1, 2, 3]}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    snapToInterval={ (192) }
                    decelerationRate="fast"
                    keyExtractor={(_, i) => i.toString()}
                    renderItem={() => <OutlineCard onPress={() => {
                        if (activeSession) {
                            cannotCreateSessionRef.current?.open();
                            return;
                        }
                        openBottomSheet();
                    }} />}
                />
            </View>
        );
    }

    return (
        <SafeAreaView className="relative flex-1 bg-background">
            <BackNavigationHeader label="Sessions" />
            <Separator className="mt-4 mx-6" />
            <ScrollView refreshControl={<RefreshControl refreshing={false} onRefresh={()=>{console.log("Refreshing...")}} />}>
                <View className="px-6 pb-12 gap-4">
                    <View className={"mt-2 min-h-[250px]"}>
                        <CardsSwipeAnimation width={250} height={250} />
                        <Text className="text-center font-semibold text-lg text-accent-grey">
                            Ready to swipe your way through the city’s best spots?
                        </Text>
                    </View>
                    {activeSession !== null ? (
                        <BigActionButton
                            label={"Tap to view current session"}
                            active={true}
                            onPress={() => {
                                activeSessionPopupRef.current?.open();
                            }}
                        />
                    ) : (
                        <View className="gap-1">
                            <BigActionButton label={"Create Session"} iconName={"plus"} onPress={openBottomSheet} />
                            <BigActionButton
                                label={"Scan QR Code"}
                                iconName={"qrcode-scan"}
                                onPress={() => router.push("/profile/qr-code-scanner")}
                            />
                        </View>
                    )}
                    <RecentSessions />
                </View>
            </ScrollView>
            <CreateSessionSheet
                loading={loadingSession}
                sheetRef={sheetRef}
                onCreate={handleCreateSession}
            />
            <ActiveSessionWarning />
            <CurrentSessionInfoPopup session={activeSession} popupRef={activeSessionPopupRef} />
        </SafeAreaView>
    );
}
