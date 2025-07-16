import {
    Linking,
    Text,
    TouchableOpacity,
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
import {useServices} from "@/context/ServicesContext";
import CurrentSessionInfoPopup from "@/components/popups/CurrentSessionInfoPopup";
import {PopupMessageRef} from "@/components/popups/PopupMessage";
import QRCodeScanner from "@/components/session/QRCodeScanner";

let lastScanTime = 0;

const MiniButton = ({ label, onPress }: { label: string, onPress: () => void }) => {
    return (
        <TouchableOpacity
            className="bg-primary px-4 py-3 rounded-md shadow shadow-black/20"
            onPress={onPress}
        >
            <Text className="font-medium text-white">{label}</Text>
        </TouchableOpacity>
    );
}

const ScanResults = ({ result }: { result: BarcodeScanningResult}) => {
    const [canOpenUrl, setCanOpenUrl] = useState<boolean | undefined>(undefined);
    const [session, setSession] = useState<SwipingSession | null | undefined>(undefined);
    const popupRef = useRef<PopupMessageRef>(null);

    const { database } = useServices();

    useEffect(() => {
        setCanOpenUrl(undefined);
        setSession(undefined);

        (async() => {
            const canOpenUrl = await Linking.canOpenURL(result.data);
            if (canOpenUrl) {
                setSession(null);
                setTimeout(() => {
                    setCanOpenUrl(canOpenUrl);
                }, 500);
                return;
            }
            setCanOpenUrl(false);
            const requestedSession = await database.getSession(result.data);
            setSession(requestedSession);
        })();
    }, [result.data]);

    useEffect(() => {
        if (session) {
            popupRef.current?.open();
        }
    }, [session]);

    const handleOpenUrl = async (url: string) => {
        await Linking.openURL(url);
    }

    if ((canOpenUrl === undefined || session === undefined)) {
        return <ActivityIndicator size={12} />;
    }

    return (
        <View className="px-8">
            <Text className="text-center">Scan Result:</Text>
            <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                className="text-center underline text-primary"
                onPress={() => handleOpenUrl(result.data)}
            >
                {session
                    ? `Valid Session Found`
                    : result.data}
            </Text>
            <CurrentSessionInfoPopup session={session} popupRef={popupRef} />
        </View>
    );
}

const QRCodeScannerScreen = () => {
    const [permission, setPermission] = useState<PermissionResponse | null>(null);
    const [scanned, setScanned] = useState<boolean>(false);
    const [scanResult, setScannedResult] = useState<BarcodeScanningResult | null>(null);

    useEffect(() => {
        (async() => {
            await requestPermission();
        })();
    }, []);

    const requestPermission = async () => {
        const res = await Camera.requestCameraPermissionsAsync();
        setPermission(res);
    }

    const handleBarcodeScanned = (result: BarcodeScanningResult) => {
        const now = Date.now();
        if (now - lastScanTime < 500) return;
        lastScanTime = now;

        setScanned(true);
        setScannedResult(result);
    };

    const resetScanned = () => {
        setScanned(false);
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
                    scanned={scanned}
                    onBarcodeScanned={handleBarcodeScanned}
                />
                {scanResult ? (
                    <ScanResults result={scanResult} />
                ) : (
                    <Text className="text-center font-medium text-ellipsis">
                        Align the QR code inside the frame to scan automatically.
                    </Text>
                )}
                {scanned && <MiniButton label={"Scan Again"} onPress={resetScanned} />}
            </View>
        </SafeAreaView>
    );
}

export default QRCodeScannerScreen;
