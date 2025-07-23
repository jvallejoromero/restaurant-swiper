import {
    View,
    SafeAreaView,
    Text,
    TouchableOpacity,
    StyleSheet,
    Animated,
    Modal,
    Pressable,
} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import {useRouter} from "expo-router";
import React, {useEffect, useRef, useState} from "react";
import {useServices} from "@/context/ServicesContext";
import Separator from "@/components/ui/Separator";
import BackNavigationHeader from "@/components/headers/BackNavigationHeader";
import * as ImagePicker from "expo-image-picker";
import CachedAvatar from "@/components/avatar/CachedAvatar";
import { LinearGradient } from "expo-linear-gradient";
import {useToast} from "@/context/ToastContext";
import {ToastType} from "@/hooks/ToastHook";

type ProfileEntry = {
    label: string;
    value?: string;
    iconName: React.ComponentProps<typeof Ionicons>["name"];
};

type ModifyPfpEntry = {
    label: string;
    iconName: React.ComponentProps<typeof Ionicons>["name"];
}

const modifyPfpOptions: ModifyPfpEntry[] = [
    { label: "Choose from library", iconName: "images-outline" },
    { label: "Take a picture", iconName: "camera-outline" },
    { label: "Delete profile picture", iconName: "trash-outline" },
];

export default function EditProfileScreen() {
    const router = useRouter();
    const { user, userProfile, database, storage, loading } = useServices();
    const { showToast } = useToast();

    const [isPfpOptionsOpen, setIsPfpOptionsOpen] = useState<boolean>(false);

    const modifyPfpButtonRef = useRef<React.ComponentRef<typeof TouchableOpacity> | null>(null);
    const [anchor, setAnchor] = useState({ x: 0, y: 0, width: 0, height: 0 });

    const profileEntries: ProfileEntry[] = [
        { label: "Email", value: user?.email, iconName: "mail-outline" },
        { label: "Display Name", value: userProfile?.displayName, iconName: "person-outline" },
        { label: "Username", value: user?.username, iconName: "at-outline" },
    ];

    const handleOptionPress = (option: string) => {
        const pressed = option.replaceAll(" ", "").toLowerCase();
        if (pressed === "email") {
            console.log("change email");
        } else if (pressed === "displayname") {
            router.push("/profile/edit-displayname");
        } else if (pressed === "username") {
            router.push("/profile/edit-username");
        }
    }

    const openPfpOptionsMenu = () => {
        if (!modifyPfpButtonRef.current) {
            return;
        }
        modifyPfpButtonRef.current.measureInWindow((x, y, width, height) => {
            setAnchor({ x: x, y: y, width: width, height: height });
            setIsPfpOptionsOpen(true);
        });
    }

    const handlePfpOptionPress = async (option: string) => {
        const pressed = option.replaceAll(" ", "").toLowerCase();
        if (pressed === "choosefromlibrary") {
            await handlePfpChange();
        } else if (pressed === "takeapicture") {
            await handleTakePicture();
        } else if (pressed === "deleteprofilepicture") {
            if (!userProfile?.photoURL) {
                showToast("Your profile picture is already empty!");
                return;
            }
            await database.updateUserProfile(user?.uid!, {photoURL: ""});
            await storage.deleteProfilePicture(user?.uid!);
            showToast("Deleted Profile Picture", ToastType.SUCCESS);
        }
    }

    const handlePfpChange = async() => {
        if (!user || loading) {
            return;
        }

        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
            alert("Permission to access photos is required to change the profile picture!");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images", "livePhotos"],
            quality: 0.7,
            allowsEditing: true,
            allowsMultipleSelection: false,
            aspect: [1,1],
            base64: false,
        });

        if (result.canceled || result.assets.length === 0) {
            return;
        }

        const { uri } = result.assets[0];
        try {
            const pfpUrl = await storage.uploadProfilePicture(user.uid, uri);
            await database.updateUserProfile(user.uid, { photoURL: pfpUrl });
        } catch (error) {
            console.warn("Could not upload profile picture", error);
            showToast("Could not upload profile picture", ToastType.ERROR);
            return;
        }
        showToast("Updated profile picture", ToastType.SUCCESS);
    }

    const handleTakePicture = async() => {
        if (!user || loading) {
            return;
        }

        const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
        const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (cameraStatus !== "granted" || mediaStatus !== "granted") {
            alert("Camera access is required to take a picture!");
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            aspect: [1,1],
            quality: 0.7,
            base64: false,
        });

        if (result.canceled || result.assets.length === 0) {
            return;
        }

        const { uri } = result.assets[0];
        try {
            const pfpUrl = await storage.uploadProfilePicture(user.uid, uri);
            await database.updateUserProfile(user.uid, { photoURL: pfpUrl });
        } catch (error) {
            console.warn("Could not upload profile picture", error);
            showToast("Could not upload profile picture", ToastType.ERROR);
            return;
        }
        showToast("Updated profile picture", ToastType.SUCCESS);
    }

    const ProfileInfoEntry = ({ label, value, iconName, onPress }: {label: string, value: string | undefined, iconName: React.ComponentProps<typeof Ionicons>["name"], onPress: () => void }) => {
        const isValueEmpty = value?.trim() === "" || value === undefined || value === null;
        const fontStyle =  isValueEmpty ? "font-normal" : "font-medium";
        return (
            <TouchableOpacity onPress={onPress}>
                <View className="flex-row items-center justify-center gap-4">
                    <Ionicons name={iconName} size={20} color="#555" />
                    <Text className="text-lg text-[#555]">{label}</Text>
                    <Text className={`flex-1 text-lg text-black text-right ${fontStyle}`} numberOfLines={1} ellipsizeMode="tail">
                        {isValueEmpty ? "None Set" : value}
                    </Text>
                    <Ionicons name={"chevron-forward-outline"} size={18} color="#999" />
                </View>
            </TouchableOpacity>
        );
    }

    const ProfileInfoEntries = () => {
        return (
            <View className="px-6 gap-2">
                {profileEntries.map(({ label, value, iconName}, index) => {
                    return (
                        <ProfileInfoEntry
                            key={index}
                            label={label}
                            value={value}
                            iconName={iconName}
                            onPress={() => handleOptionPress(label)}
                        />
                    );
                })}
            </View>
        );
    }

    const ProfilePictureHeader = () => {
        return (
            <View className="items-center justify-center mt-8 gap-2">
                <CachedAvatar photoUrl={userProfile?.photoURL} userId={user?.uid!} />
                <TouchableOpacity ref={modifyPfpButtonRef} activeOpacity={1} onPress={openPfpOptionsMenu}>
                    <Text className="text-lg font-medium color-primary">Modify profile picture</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const ProfilePictureOptionsModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
        const opacity = useRef(new Animated.Value(0)).current;
        const scale   = useRef(new Animated.Value(1.0)).current;

        useEffect(() => {
            if (isOpen) {
                opacity.setValue(0);
                scale.setValue(1.15);

                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }).start();
                Animated.spring(scale, {
                    toValue: 1,
                    friction: 8,
                    tension: 200,
                    useNativeDriver: true,
                }).start();
            } else {
                opacity.setValue(0);
                scale.setValue(1);
            }
        }, [isOpen]);

        return (
            <Modal
                transparent
                visible={isOpen}
                onRequestClose={onClose}
                statusBarTranslucent={true}
            >
                <View className="flex-1" pointerEvents={"box-none"}>
                    <Pressable style={StyleSheet.absoluteFill} onPress={onClose} pointerEvents={"auto"} />
                    <Animated.View
                        style={{
                            opacity,
                            transform: [{ scale }],
                        }}
                    >
                        <LinearGradient
                            style={{
                                position: "absolute",
                                minWidth: 0,
                                minHeight: 0,
                                borderRadius: 12,
                                backgroundColor: 'rgba(0,0,0,0.8)',
                                top: anchor.y + anchor.height + 4,
                                left: anchor.x,
                            }}
                            colors={["#00000033", "#0000004D"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 0, y: 1 }}
                        >
                            {modifyPfpOptions.map(({ label, iconName }, index) => {
                                const isLast = index === modifyPfpOptions.length - 1;
                                return (
                                    <TouchableOpacity
                                        key={label}
                                        className={`flex-row items-center p-3  gap-2 
                                        ${!isLast && "border-b border-accent-grey/20"
                                        }`}
                                        onPress={() => {
                                            onClose();
                                            setTimeout(() => {
                                                void handlePfpOptionPress(label);
                                            }, 100);
                                        }}
                                    >
                                        <Ionicons name={iconName} size={24} color="white" />
                                        <Text className="text-white text-lg">{label}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </LinearGradient>
                    </Animated.View>
                </View>
            </Modal>
        );
    }

    return (
        <SafeAreaView className="relative flex-1 bg-background">
            <BackNavigationHeader label={"Edit Profile"} />
            <ProfilePictureHeader />
            <Separator className={"my-4 mx-6"} />
            <ProfileInfoEntries />
            <ProfilePictureOptionsModal isOpen={isPfpOptionsOpen} onClose={() => setIsPfpOptionsOpen(false)}/>
        </SafeAreaView>
    );
}