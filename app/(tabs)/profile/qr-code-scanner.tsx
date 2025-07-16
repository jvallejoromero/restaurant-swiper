import React from "react";
import QRCodeScanner from "@/components/session/QRCodeScanner";
import {View} from "react-native";

const QRCodeScannerScreen = () => {
    return (
        <View className="flex-1 bg-background items-center justify-center">
            <QRCodeScanner />
        </View>
    );
}

export default QRCodeScannerScreen;