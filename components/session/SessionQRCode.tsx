import {View} from "react-native";
import React from "react";
import QRCode from "react-native-qrcode-svg";
import {COLORS} from "@/constants/colors";
import {IMAGES} from "@/constants/images";

type SessionQRCodeProps = {
    sessionId: string;
}

const SessionQRCode = ({ sessionId }: SessionQRCodeProps) => {
    return (
        <View className="items-center">
            <QRCode
                value={sessionId}
                size={150}
                logo={IMAGES.forked_logo}
                color={COLORS.primary}
                ecl="H"
            />
        </View>
    );
}

export default React.memo(SessionQRCode, (prev, next) => prev.sessionId === next.sessionId);