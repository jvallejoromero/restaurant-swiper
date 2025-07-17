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
import BottomSheet from "@gorhom/bottom-sheet";
import {useQRCodeAnalyzer} from "@/hooks/QRCodeAnalyzerHook";

let lastScanTime = 0;

type ScanResultsProps = {
    canOpenUrl: boolean | undefined;
    url: string;
    session: SwipingSession | null | undefined;
    bottomSheetRef: React.RefObject<BottomSheet | null>;
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
                        onPress={() => bottomSheetRef.current?.expand()}
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

    const joinSessionSheetRef = useRef<BottomSheet>(null);
    const { canOpenUrl, session } = useQRCodeAnalyzer(scanResult);

    useEffect(() => {
        (async() => {
            await requestPermission();
        })();
    }, []);

    useEffect(() => {
        if (!session) {
            return;
        }
        const timeout = setTimeout(() => {
            joinSessionSheetRef.current?.expand();
        }, 100);

        return () => {
            clearTimeout(timeout);
        }
    }, [session]);

    const requestPermission = async () => {
        const res = await Camera.requestCameraPermissionsAsync();
        setPermission(res);
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
                loading={false}
                sheetRef={joinSessionSheetRef}
                session={session}
                onJoinSession={() => console.log("join session!")}
            />
        </SafeAreaView>
    );
}

export default QRCodeScannerScreen;
