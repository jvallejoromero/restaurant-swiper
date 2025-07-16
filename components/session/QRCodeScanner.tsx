import {
    View,
    StyleSheet,
} from "react-native";
import React from "react";
import {BarcodeScanningResult, CameraView} from "expo-camera";
import {CameraType} from "expo-image-picker";

type QRCodeScreenProps = {
    scanned: boolean;
    onBarcodeScanned: (result: BarcodeScanningResult) => void;
}

const QRCodeScanner = ({ scanned, onBarcodeScanned }: QRCodeScreenProps) => {
    return (
        <View className="relative p-3 shadow shadow-black/50">
            <View className="w-80 h-80 overflow-hidden rounded-sm">
                <CameraView
                    style={StyleSheet.absoluteFillObject}
                    facing={CameraType.back}
                    barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
                    onBarcodeScanned={scanned ? undefined : onBarcodeScanned}
                />
            </View>
            <View className="absolute top-0 left-0 w-[30px] h-[30px] border-t-2 border-l-2 border-primary" />
            <View className="absolute top-0 right-0 w-[30px] h-[30px] border-t-2 border-r-2 border-primary" />
            <View className="absolute bottom-0 left-0 w-[30px] h-[30px] border-b-2 border-l-2 border-primary" />
            <View className="absolute bottom-0 right-0 w-[30px] h-[30px] border-b-2 border-r-2 border-primary" />
        </View>
    );
}

export default QRCodeScanner;
