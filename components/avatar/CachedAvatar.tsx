import {View} from "react-native";
import React from "react";
import {IMAGES} from "@/constants/images";
import {Image} from "expo-image";

type CachedAvatarProps = {
    userId: string;
    photoUrl: string | undefined;
    size?: number;
    className?: string;
}

const CachedAvatar = ({ photoUrl, userId, size=144, className }: CachedAvatarProps) => {

    return (
        <View
            style={{ width: size, height: size }}
            className={`${className ? className : 'rounded-full shadow-neutral-900 border-neutral-800/40 overflow-hidden'}`}
        >
            <Image
                source={photoUrl ? { uri: photoUrl } : IMAGES.default_avatar}
                style={{
                    width: "100%",
                    height: "100%",
                }}
                contentFit="cover"
                contentPosition="center"
                cachePolicy="disk"
                onLoad={(e) => {
                    (async() => {
                        console.log(" ");
                        console.log("loaded image for", userId, "via", e.cacheType);
                        const src = await Image.getCachePathAsync(e.source.url);
                        console.log("Used file at:", src);
                        console.log(" ");
                    })();
                }}
            />
        </View>
    );
}

export default CachedAvatar;