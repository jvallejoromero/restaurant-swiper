import {View, SafeAreaView, Text, TouchableOpacity} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import {useRouter} from "expo-router";
import React from "react";
import {useServices} from "@/context/ServicesContext";
import ProfileAvatar from "@/components/avatar/ProfileAvatar";
import Separator from "@/components/ui/Separator";
import BackNavigationHeader from "@/components/headers/BackNavigationHeader";
import * as ImagePicker from "expo-image-picker";
import CachedAvatar from "@/components/avatar/CachedAvatar";


type ProfileEntry = {
    label: string;
    value?: string;
    iconName: React.ComponentProps<typeof Ionicons>["name"];
};

export default function EditProfileScreen() {
    const router = useRouter();
    const { user, userProfile, database, storage, loading } = useServices();

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
            console.log("Could not upload profile picture", error);
        }
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
                <TouchableOpacity activeOpacity={1} onPress={handlePfpChange}>
                    <Text className="text-lg font-medium color-primary">Modify profile picture</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-background">
            <BackNavigationHeader label={"Edit Profile"} />
            <ProfilePictureHeader />
            <Separator className={"my-4 mx-6"} />
            <ProfileInfoEntries />
        </SafeAreaView>
    );
}