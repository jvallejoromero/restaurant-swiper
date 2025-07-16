import {Image, View} from "react-native";
import React, {useEffect, useState} from "react";
import {IMAGES} from "@/constants/images";
import {cacheProfilePicture} from "@/utils/CacheUtils";

type CachedAvatarProps = {
    userId: string;
    photoUrl: string | undefined;
    size?: number;
    className?: string;
}

const CachedAvatar = ({ photoUrl, userId, size=144, className }: CachedAvatarProps) => {
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
        <View
            style={{ width: size, height: size }}
            className={`${className ? className : 'rounded-full shadow-neutral-900 border-neutral-800/40 overflow-hidden'}`}
        >
            <Image
                source={localUri ? { uri: localUri } : IMAGES.default_avatar}
                resizeMode="cover"
                className="w-full h-full self-center"
            />
        </View>
    );
}

export default CachedAvatar;