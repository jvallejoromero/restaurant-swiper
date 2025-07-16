import {Text, View} from "react-native";
import React, {useEffect, useState} from "react";

const QRCodeScanner = () => {
    const [hasCameraPermission, setHasCameraPermission] = useState<boolean>(false);
    const [scanned, setScanned] = useState<boolean>(false);

    useEffect(() => {
    }, []);

    return (
        <View>
            <Text>QRCodeScanner</Text>
        </View>
    );
}

export default QRCodeScanner;