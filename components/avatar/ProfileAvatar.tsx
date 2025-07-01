import {Image, View} from "react-native";
import React from "react";
import {IMAGES} from "@/constants/images";

const ProfileAvatar = ({ className }: { className?: string }) => {
    return (
        <View className={`h-[144] w-[144] rounded-full border-2 border-neutral-800/20 overflow-hidden ${className}`}>
            <Image
                source={IMAGES.default_avatar}
                className="h-[165] w-[165] -translate-y-1 self-center"
            />
        </View>
    );
}

export default ProfileAvatar;