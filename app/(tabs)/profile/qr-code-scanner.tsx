import {
    Linking,
    Text,
    View,
    SafeAreaView,
    ActivityIndicator
} from "react-native";
import React, {useEffect, useRef, useState} from "react";
import {BarcodeScanningResult, Camera, PermissionResponse} from "expo-camera";
import GenericLoadingScreen from "@/components/screens/GenericLoadingScreen";
import BackNavigationHeader from "@/components/headers/BackNavigationHeader";
import Separator from "@/components/ui/Separator";
import {SwipingSession} from "@/services/DatabaseService";
import QRCodeScanner from "@/components/session/QRCodeScanner";
import MiniButton from "@/components/buttons/MiniButton";
import JoinSessionBottomSheet from "@/components/screens/session/JoinSessionBottomSheet";
import {BottomSheetModal} from "@gorhom/bottom-sheet";
import {useQRCodeAnalyzer} from "@/hooks/useQRCodeAnalyzer";
import {useServices} from "@/context/ServicesContext";
import {useActiveSwipingSession} from "@/context/SwipingSessionContext";
import { useToast } from "@/context/ToastContext";
import {ToastType} from "@/hooks/useToastHook";
import {router} from "expo-router";

let lastScanTime = 0;

type ScanResultsProps = {
    canOpenUrl: boolean | undefined;
    url: string;
    session: SwipingSession | null | undefined;
    bottomSheetRef: React.RefObject<BottomSheetModal | null>;
}

const ScanResults = ({ canOpenUrl, url, session, bottomSheetRef }: ScanResultsProps) => {
    const handleOpenUrl = async (url: string) => {
        await Linking.openURL(url);
    }

    if (canOpenUrl === undefined || session === undefined) {
        return <ActivityIndicator size={12} />
    }

    if (session) {
        return (
            <>
                <View className="flex-col items-center">
                    <Text>Valid Session Found!</Text>
                    <Text
                        className="text-primary underline"
                        onPress={() => bottomSheetRef.current?.present()}
                    >
                        View Information
                    </Text>
                </View>
            </>
        );
    }

    return (
        <View className="px-8 gap-1">
            <Text className="text-center">Scan Result:</Text>
            <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                className={`text-center ${canOpenUrl ? 'underline text-primary' : undefined}`}
                onPress={canOpenUrl ? () => handleOpenUrl(url) : undefined}
            >
                {url}
            </Text>
        </View>
    );
}

const QRCodeScannerScreen = () => {
    const [permission, setPermission] = useState<PermissionResponse | null>(null);
    const [scanResult, setScannedResult] = useState<BarcodeScanningResult | null>(null);
    const [isJoiningSession, setIsJoiningSession] = useState<boolean>(false);
    const [isLeavingSession, setIsLeavingSession] = useState<boolean>(false);
    const [isEndingSession, setIsEndingSession] = useState<boolean>(false);

    const joinSessionSheetRef = useRef<BottomSheetModal>(null);
    const { canOpenUrl, session } = useQRCodeAnalyzer(scanResult);
    const { user, database } = useServices();
    const { activeSession } = useActiveSwipingSession();
    const { showToast } = useToast();

    useEffect(() => {
        (async() => {
            await requestPermission();
        })();
    }, []);

    const resetView = () => {
        joinSessionSheetRef.current?.close();
        router.dismissAll();
        router.push("/");
    }

    const requestPermission = async () => {
        const res = await Camera.requestCameraPermissionsAsync();
        setPermission(res);
    }

    const handleJoinSession = async (sessionId: string) => {
        if (!user?.uid) return;
        if (activeSession !== null) {
            if (activeSession.id === sessionId) {
                showToast("You’re already in this session.", ToastType.INFO);
                return;
            }
            showToast("Please leave your current session first.", ToastType.ERROR);
            return;
        }

        setIsJoiningSession(true);
        try {
            const sessionToJoin = await database.getSession(sessionId);
            if (!sessionToJoin) {
                setIsJoiningSession(false);
                resetView();
                showToast("That session no longer exists!", ToastType.ERROR);
                return;
            }
            await database.addUserToSession(sessionId, user.uid);
        } catch (error) {
            showToast("An error occurred while joining the session. Please contact the developer.", ToastType.ERROR);
            setIsJoiningSession(false);
            return;
        }
        setIsJoiningSession(false);
        resetView();
        showToast("You joined the session.", ToastType.SUCCESS);
    }

    const handleLeaveSession = async (sessionId: string) => {
        if (!user?.uid) return;
        setIsLeavingSession(true);
        try {
            await database.removeUserFromSession(sessionId, user.uid);
        } catch (error) {
            showToast("An error occurred while leaving the session. Please contact the developer.", ToastType.ERROR);
            setIsLeavingSession(false);
            return;
        }
        setIsLeavingSession(false);
        resetView();
        showToast("You left the session.");
    }

    const handleEndSession = async (sessionId: string) => {
        setIsEndingSession(true);
        try {
            await database.endSession(sessionId);
        } catch (error) {
            if (error instanceof Error) {
                showToast(error.message, ToastType.ERROR);
            } else {
                showToast(`An unknown error occurred:\n${String(error)}`);
            }
            setIsEndingSession(false);
            return;
        }
        setIsEndingSession(false);
        resetView();
        showToast("You ended the session.");
    }

    const handleBarcodeScanned = (result: BarcodeScanningResult) => {
        const now = Date.now();
        if (now - lastScanTime < 500) return;
        lastScanTime = now;
        setScannedResult(result);
    };

    const resetScanned = () => {
        setScannedResult(null);
    }

    if (permission === null) {
        return <GenericLoadingScreen />;
    }

    if (!permission.granted) {
        if (!permission.canAskAgain) {
            return (
                <View className="flex-1 items-center justify-center gap-12">
                    <Text className="text-lg text-center text-wrap">
                        Camera access was permanently denied.
                        {"\n"}
                        Please enable it in Settings.
                    </Text>
                    <MiniButton label={"Go to settings"} onPress={() => Linking.openSettings()} />
                </View>
            );
        }
        return (
            <View className="flex-1 items-center justify-center gap-12">
                <Text className="text-lg text-center text-wrap">
                    Camera access is required to scan QR codes
                </Text>
                <MiniButton label={"Grant Access"} onPress={requestPermission} />
            </View>
        );
    }

    return (
        <SafeAreaView className="relative flex-1 bg-background">
            <BackNavigationHeader label="QR Code Scanner" />
            <Separator className="mt-4 mx-6" />
            <View className="items-center mt-20 gap-8">
                <QRCodeScanner
                    scanned={scanResult != null}
                    onBarcodeScanned={handleBarcodeScanned}
                />
                {scanResult ? (
                    <>
                        <ScanResults canOpenUrl={canOpenUrl} url={scanResult.data} session={session} bottomSheetRef={joinSessionSheetRef} />
                        <MiniButton label={"Scan Again"} onPress={resetScanned} />
                    </>
                ) : (
                    <Text className="text-center font-medium text-ellipsis">
                        Align the QR code inside the frame to scan automatically.
                    </Text>
                )}
            </View>
            <JoinSessionBottomSheet
                sheetRef={joinSessionSheetRef}
                session={session}
                alreadyInSession={session?.id === activeSession?.id}
                onJoinSession={handleJoinSession}
                onLeaveSession={handleLeaveSession}
                onEndSession={handleEndSession}
                isJoiningSession={isJoiningSession}
                isLeavingSession={isLeavingSession}
                isEndingSession={isEndingSession}
            />
        </SafeAreaView>
    );
}

export default QRCodeScannerScreen;
