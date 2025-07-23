import {
    View,
    SafeAreaView,
    Text,
    TouchableOpacity,
    Linking,
} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import {useRouter} from "expo-router";
import React, {useRef} from "react";
import {useServices} from "@/context/ServicesContext";
import Separator from "@/components/ui/Separator";
import BackNavigationHeader from "@/components/headers/BackNavigationHeader";
import * as ImagePicker from "expo-image-picker";
import CachedAvatar from "@/components/avatar/CachedAvatar";
import {useToast} from "@/context/ToastContext";
import {ToastType} from "@/hooks/ToastHook";
import PopupMessage, {PopupMessageRef} from "@/components/popups/PopupMessage";
import GenericButton from "@/components/buttons/GenericButton";
import BottomSheet from "@gorhom/bottom-sheet";
import ModifyProfilePictureSheet, { ModifyPfpEntry } from "@/components/screens/profile/ModifyProfilePictureSheet";

type ProfileEntry = {
    label: string;
    value?: string;
    iconName: React.ComponentProps<typeof Ionicons>["name"];
};

const modifyPfpOptions: ModifyPfpEntry[] = [
    { label: "Choose from library", iconName: "images-outline" },
    { label: "Take a picture", iconName: "camera-outline" },
    { label: "Delete profile picture", iconName: "trash-outline" },
];

export default function EditProfileScreen() {
    const modifyPfpBottomSheetRef = useRef<BottomSheet>(null);
    const noGalleryPermissionPopupRef = useRef<PopupMessageRef>(null);
    const noCameraPermissionPopupRef = useRef<PopupMessageRef>(null);

    const router = useRouter();
    const { user, userProfile, database, storage, loading } = useServices();
    const { showToast } = useToast();

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
            noGalleryPermissionPopupRef?.current?.open();
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
        showToast("Updated Profile Picture", ToastType.SUCCESS);
    }

    const handleTakePicture = async() => {
        if (!user || loading) {
            return;
        }

        const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
        const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (cameraStatus !== "granted" || mediaStatus !== "granted") {
            noCameraPermissionPopupRef.current?.open();
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
        showToast("Updated Profile Picture", ToastType.SUCCESS);
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
                <TouchableOpacity activeOpacity={1} onPress={() => modifyPfpBottomSheetRef.current?.expand()}>
                    <Text className="text-lg font-medium color-primary">Modify profile picture</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const NoCameraPermissionsPopup = () => {
        return (
            <PopupMessage
                ref={noCameraPermissionPopupRef}
                className="bg-neutral-100 rounded-xl p-6 w-[90%] max-w-sm"
                bgClassname="bg-black/60"
            >
                <View className="items-center gap-3">
                    <Text className="text-2xl font-bold text-primary">
                        No Camera Access
                    </Text>
                    <Text className="text-lg text-gray-600 text-center leading-snug">
                        Permission to access the camera is required to take photos!
                    </Text>
                    <View className="w-[90%] gap-1">
                        <GenericButton
                            text="Go To Settings"
                            onPress={() => Linking.openSettings()}
                        />
                        <GenericButton
                            text="Okay"
                            onPress={() => noCameraPermissionPopupRef.current?.close()}
                        />
                    </View>
                </View>
            </PopupMessage>
        );
    }

    const NoGalleryPermissionsPopup = () => {
        return (
            <PopupMessage
                ref={noGalleryPermissionPopupRef}
                className="bg-neutral-100 rounded-xl p-6 w-[90%] max-w-sm"
                bgClassname="bg-black/60"
            >
                <View className="items-center gap-3">
                    <Text className="text-2xl font-bold text-primary">
                        No Gallery Access
                    </Text>
                    <Text className="text-lg text-gray-600 text-center leading-snug">
                        Permission to access photos is required to change the profile picture!
                    </Text>
                    <View className="w-[90%] gap-1">
                        <GenericButton
                            text="Go To Settings"
                            onPress={() => Linking.openSettings()}
                        />
                        <GenericButton
                            text="Okay"
                            onPress={() => noGalleryPermissionPopupRef.current?.close()}
                        />
                    </View>
                </View>
            </PopupMessage>
        );
    }

    return (
        <SafeAreaView className="relative flex-1 bg-background">
            <BackNavigationHeader label={"Edit Profile"} />
            <ProfilePictureHeader />
            <Separator className={"my-4 mx-6"} />
            <ProfileInfoEntries />
            <ModifyProfilePictureSheet
                sheetRef={modifyPfpBottomSheetRef}
                entries={modifyPfpOptions}
                onOptionPress={handlePfpOptionPress}
            />
            <NoCameraPermissionsPopup />
            <NoGalleryPermissionsPopup />
        </SafeAreaView>
    );
}