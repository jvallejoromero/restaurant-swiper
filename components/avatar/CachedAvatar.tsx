import {Image, View} from "react-native";
import React, {useEffect, useState} from "react";
import {IMAGES} from "@/constants/images";
import {cacheProfilePicture} from "@/utils/CacheUtils";

type CachedAvatarProps = {
    photoUrl: string | undefined;
    userId: string;
    className?: string;
}

const CachedAvatar = ({ photoUrl, userId, className }: CachedAvatarProps) => {
    const [localUri, setLocalUri] = useState<string | null>(null);

    useEffect(() => {
        if (!photoUrl) {
            setLocalUri(null);
            return;
        }

        let mounted = true;
        cacheProfilePicture(photoUrl, userId)
            .then(path => mounted && setLocalUri(path))
            .catch(() => mounted && setLocalUri(null));

        return () => { mounted = false; };
    }, [photoUrl]);

    return (
        <View className={`h-[144] w-[144] rounded-full shadow-neutral-900 border-neutral-800/40 overflow-hidden ${className}`}>
            <Image
                source={localUri ? { uri: localUri } : IMAGES.default_avatar}
                className="h-[165] w-[165] self-center"
            />
        </View>
    );
}

export default CachedAvatar;