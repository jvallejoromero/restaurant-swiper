import {Linking, Text, TouchableOpacity, View, StyleSheet, SafeAreaView, Pressable} from "react-native";
import React, {useEffect, useState} from "react";
import {BarcodeScanningResult, Camera, CameraView, PermissionResponse} from "expo-camera";
import GenericLoadingScreen from "@/components/screens/GenericLoadingScreen";
import {CameraType} from "expo-image-picker";
import BackNavigationHeader from "@/components/headers/BackNavigationHeader";
import Separator from "@/components/ui/Separator";

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

    const handleOpenUrl = async (url: string) => {
        const canOpenUrl = await Linking.canOpenURL(url);
        if (!canOpenUrl) {
            alert(`Cannot open URL: ${url}`);
            return;
        }
        
        await Linking.openURL(url);
    }

    return (
        <View>
            <Text className="text-center">
                Scan Result:
            </Text>
            <Text
                className="text-center underline text-primary"
                onPress={() => handleOpenUrl(result.data)}
            >
                {result.data}
            </Text>
        </View>
    );
}

const QRCodeScanner = () => {
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
                <View className="relative p-3 shadow shadow-black/50">
                    <View className="w-80 h-80 overflow-hidden rounded-sm">
                        <CameraView
                            style={StyleSheet.absoluteFillObject}
                            facing={CameraType.back}
                            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
                            onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
                        />
                    </View>
                    <View className="absolute top-0 left-0 w-[30px] h-[30px] border-t-2 border-l-2 border-primary" />
                    <View className="absolute top-0 right-0 w-[30px] h-[30px] border-t-2 border-r-2 border-primary" />
                    <View className="absolute bottom-0 left-0 w-[30px] h-[30px] border-b-2 border-l-2 border-primary" />
                    <View className="absolute bottom-0 right-0 w-[30px] h-[30px] border-b-2 border-r-2 border-primary" />
                </View>

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

export default QRCodeScanner;
