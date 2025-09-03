import {Dimensions, ScrollView, Text, TouchableOpacity, View} from "react-native";
import React, {useRef, useState} from "react";
import {ChevronLeft, ChevronRight} from "lucide-react-native";
import {IMAGES} from "@/constants/images";
import {StyleSheet} from "react-native";
import {useFirebasePhotoUri} from "@/hooks/useFirebasePhotoUri";
import { Image } from "expo-image";

const width = Dimensions.get("window").width;

const ScrollableImageGallery = ({ photoRefs }: { photoRefs: string[] }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
    const scrollGalleryRef = useRef<ScrollView | null>(null);

    const scrollToIndex = (index: number) => {
        if (index >= 0 && index < photoRefs.length) {
            setCurrentImageIndex(index);
            scrollGalleryRef.current?.scrollTo({ x: index * width, animated: true });
        }
    };

    const GalleryPhoto = ({ uri }: { uri: string }) => {
        const resolvedUri = useFirebasePhotoUri(uri);
        return (
            <Image
                cachePolicy={"disk"}
                source={resolvedUri ? { uri: resolvedUri } : IMAGES.no_image_found}
                contentFit={resolvedUri ? "cover" : "contain"}
                style={{
                    width: width,
                    height: 250,
                }}
            />
        );
    }

    const GalleryPhotos = ({ photoRefs }: { photoRefs: string[] }) => {
        return (
            <>
                {photoRefs.length > 0 ? (
                    photoRefs.map((uri) => <GalleryPhoto key={uri} uri={uri} />)
                ) : (
                    <Image
                        source={IMAGES.no_image_found}
                        contentFit={"cover"}
                        style={{
                            width: width,
                            height: 250,
                        }}
                    />
                )}
            </>
        );
    }

    return (
        <View className="relative w-full h-[250]">
            <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                ref={scrollGalleryRef}
                onMomentumScrollEnd={(event) => {
                    const offsetX = event.nativeEvent.contentOffset.x;
                    const newIndex = Math.round(offsetX / width);
                    setCurrentImageIndex(newIndex);
                }}
            >
                <GalleryPhotos photoRefs={photoRefs} />
            </ScrollView>

            {/* Left Button */}
            {(photoRefs && photoRefs.length > 0) && (currentImageIndex >= 1) && (
                <>
                    <TouchableOpacity
                        onPress={() => scrollToIndex(currentImageIndex - 1)}
                        className="left-10"
                        style={styles.galleryButton}
                    >
                        <ChevronLeft color="white" size={24} />
                    </TouchableOpacity>
                </>
            )}

            {/* Right Button */}
            {(photoRefs && photoRefs.length > 0) && (currentImageIndex < (photoRefs.length-1)) && (
                <TouchableOpacity
                    onPress={() => scrollToIndex(currentImageIndex + 1)}
                    className="right-10"
                    style={styles.galleryButton}
                >
                    <ChevronRight color="white" size={24} />
                </TouchableOpacity>
            )}

            {/* Image Counter */}
            <View className="absolute self-center bottom-5 bg-black/40 p-2 rounded-lg">
                <Text className="text-white text-md">
                    {currentImageIndex + 1} / {photoRefs.length}
                </Text>
            </View>
        </View>
    );
}

export default ScrollableImageGallery;

const styles = StyleSheet.create({
    galleryButton: {
        position: 'absolute',
        transform: [{ translateY: -12 }],
        padding: 5,
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderRadius: 10,
        bottom: 10,
        zIndex: 1,
    },
});