import {Pressable, View} from "react-native";
import React from "react";
import {IMAGES} from "@/constants/images";
import {Image} from "expo-image";

type CachedAvatarProps = {
    userId: string;
    photoUrl: string | undefined;
    size?: number;
    className?: string;
    onPress?: () => void;
}

const CachedAvatar = ({ photoUrl, userId, size=144, className, onPress }: CachedAvatarProps) => {
    const Container = onPress ? Pressable : View;

    return (
        <Container
            onPress={onPress}
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
        </Container>
    );
}

export default CachedAvatar;