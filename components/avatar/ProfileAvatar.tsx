import {Image, View} from "react-native";
import React from "react";
import {IMAGES} from "@/constants/images";
import CachedAvatar from "@/components/avatar/CachedAvatar";

type ProfileAvatarProps = {
    className?: string;
    userId: string;
    photoUrl?: string | undefined;
}

const ProfileAvatar = ({ className, userId, photoUrl}: ProfileAvatarProps) => {
    if (!photoUrl) {
        return (
            <View className={`h-[144] w-[144] rounded-full border border-neutral-800/40 overflow-hidden ${className}`}>
                <Image
                    source={IMAGES.default_avatar}
                    className="h-[165] w-[165] -translate-y-1 self-center"
                />
            </View>
        );
    }

    return <CachedAvatar photoUrl={photoUrl} userId={userId} />;
}

export default ProfileAvatar;