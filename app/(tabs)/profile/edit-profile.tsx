import {View, SafeAreaView, Text, TouchableOpacity} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import {useRouter} from "expo-router";
import React from "react";
import {useServices} from "@/context/ServicesContext";
import ProfileAvatar from "@/components/avatar/ProfileAvatar";
import Separator from "@/components/ui/Separator";
import BackNavigationHeader from "@/components/headers/BackNavigationHeader";

type ProfileEntry = {
    label: string;
    value?: string;
    iconName: React.ComponentProps<typeof Ionicons>["name"];
};

export default function EditProfileScreen() {
    const router = useRouter();
    const {user, userProfile} = useServices();

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

    const ProfilePictureHeader = () => {
        return (
            <View className="items-center justify-center mt-8 gap-2">
                <ProfileAvatar />
                <TouchableOpacity activeOpacity={1} onPress={() => console.log("change pfp")}>
                    <Text className="text-lg font-medium color-primary">Modify profile picture</Text>
                </TouchableOpacity>
            </View>
        );
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

    return (
        <SafeAreaView className="flex-1 bg-background">
            <BackNavigationHeader label={"Edit Profile"} />
            <ProfilePictureHeader />
            <Separator className={"my-4 mx-6"} />
            <ProfileInfoEntries />
        </SafeAreaView>
    );
}