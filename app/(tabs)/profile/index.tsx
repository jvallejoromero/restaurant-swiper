import React, {useEffect, useState} from "react";
import {ImageBackground, SafeAreaView, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {IMAGES} from "@/constants/images";
import {authStyles} from "@/styles/AuthStyles"
import {useServices} from "@/context/ServicesContext";
import {deleteUser, getAuth, sendEmailVerification} from "firebase/auth";
import {User} from "@/services/AuthService";
import {Ionicons} from "@expo/vector-icons";
import {LinearGradient} from "expo-linear-gradient";
import {router} from "expo-router";
import GenericLoadingScreen from "@/components/screens/GenericLoadingScreen";
import GenericButton from "@/components/buttons/GenericButton";
import TitleText from "@/components/headers/TitleText";
import {AppUserProfile} from "@/services/DatabaseService";
import ProfileAvatar from "@/components/avatar/ProfileAvatar";

export default function ProfileScreen() {
    const { auth, userProfile } = useServices();

    const [initializing, setInitializing] = useState(true);
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        (async () => {
            try {
                const fbUser = getAuth().currentUser;
                if (fbUser) {
                    await fbUser.reload();
                }
                const appUser = await auth.getCurrentUser();
                setUser(appUser ?? null);
            } catch (err) {
                console.warn('failed to refresh user:', err);
                setUser(null);
            } finally {
                setInitializing(false);
            }
        })();
    }, []);

    const handleSignout = async () => {
        setLoading(true);
        setTimeout(async () => {
            await auth.signOut();
            setLoading(false);
        }, 850);
    }

    const handleResend = async () => {
        setLoading(true);
        try {
            const fbUser = getAuth().currentUser;
            if (fbUser) {
                await sendEmailVerification(fbUser);
            }
        } catch (err) {
            console.warn('failed to send email verification:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setLoading(true);
        const fbUser = getAuth().currentUser;
        if (fbUser) {
            await fbUser.reload();
            const refreshed = await auth.getCurrentUser();
            setUser(refreshed);
        }
        setLoading(false);
    };

    const restartSignup = async() => {
        const auth = getAuth();
        const fbUser = auth.currentUser;
        if (!fbUser) return;

        try {
            await deleteUser(fbUser);
        } catch (err) {
            console.warn("Couldn’t delete unverified user:", err);
        }
        await auth.signOut();
        router.replace("/profile/auth/signup");
    }

    const EmailVerificationScreen = () => {
        return (
            <ImageBackground
                source={IMAGES.auth_bg}
                style={authStyles.background}
                blurRadius={5}
            >
                <SafeAreaView>
                    <View style={[authStyles.card]} className="items-center gap-4">
                        <Text className="text-xl font-semibold color-primary">Verify Your Email</Text>
                        <View className="items-center">
                            <Text className="text-lg">We sent a verification link to:</Text>
                            <Text className="font-semibold text-lg">{user?.email}</Text>
                        </View>
                        <View className="w-full gap-2">
                            <GenericButton text={"Resend email"} onPress={handleResend} />
                            <GenericButton text={"I'm verified"} onPress={handleRefresh} />
                        </View>
                        <View className="w-full gap-1">
                            <Text className="text-primary text-lg text-center">Did you enter the wrong email?</Text>
                            <TouchableOpacity onPress={restartSignup}>
                                <Text className="text-primary text-md text-center underline">Go back to sign up</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </SafeAreaView>
            </ImageBackground>
        );
    }
    
    const AccountInfoIcon = ({ iconName }: { iconName: React.ComponentProps<typeof Ionicons>["name"] }) => {
        return <Ionicons name={iconName} size={20} color="#555" />;
    }
    
    const AccountInfoEntry = ({ iconName, label, value }: { iconName: React.ComponentProps<typeof Ionicons>["name"], label: string, value: string }) => {
        return (
            <View className="w-full flex-row items-center gap-4">
                <AccountInfoIcon iconName={iconName} />
                <Text className="flex-1 text-lg text-[#555]">{label}</Text>
                <Text className="text-lg font-medium">{value}</Text>
            </View>
        );
    }

    const ProfileHeader = () => {
        return (
            <ImageBackground
                source={IMAGES.profile_header_bg}
                className="min-h-[250px] w-full items-center justify-center"
                blurRadius={5}
            >
                <LinearGradient
                    colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.22)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={StyleSheet.absoluteFillObject}
                >
                    <View className="items-center justify-center pt-safe">
                        <TouchableOpacity className="absolute mt-safe top-0 right-8" onPress={() => router.push("/profile/edit-profile")}>
                            <Ionicons name="create-outline" size={24} color="#fff" />
                        </TouchableOpacity>
                        <View className="flex-col gap-2">
                            <ProfileAvatar />
                            <Text className="text-white text-center font-semibold text-2xl">
                                {userProfile?.displayName}
                            </Text>
                        </View>
                    </View>
                </LinearGradient>
            </ImageBackground>
        );
    }

    const ChevronButton = ({ label, iconName, onPress }: { label: string, iconName: React.ComponentProps<typeof Ionicons>["name"], onPress: () => void }) => {
        return (
            <TouchableOpacity className="flex-row items-center gap-4" onPress={onPress}>
                <AccountInfoIcon iconName={iconName} />
                <Text className="flex-1 text-black text-lg">{label}</Text>
                <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>
        );
    }

    const CriticalActionButton = ({ label, iconName, onPress }: { label: string, iconName: React.ComponentProps<typeof Ionicons>["name"], onPress: () => void }) => {
        return (
            <TouchableOpacity className="flex-row items-center gap-4" onPress={onPress}>
                <Ionicons name={iconName} size={20} color="#555" />
                <Text className="text-lg color-primary">{label}</Text>
            </TouchableOpacity>
        );
    }

    const ProfileInfoContent = ({ user, userProfile }: { user: User, userProfile: AppUserProfile | null }) => {
        return (
            <View className="flex-1 flex-col p-5 gap-3">
                <View className="gap-1">
                    <AccountInfoEntry label={"Email"} value={user.email} iconName={"mail-outline"} />
                    <AccountInfoEntry label={"Username"} value={userProfile ? userProfile.username : "Unknown"} iconName={"person-outline"} />
                </View>
                <View className="gap-1">
                    <ChevronButton label={"Settings"} iconName={"settings-outline"} onPress={() => {}} />
                    <ChevronButton label={"Sessions"} iconName={"rocket-outline"} onPress={() => {}} />
                </View>
                <View className="gap-1 mt-12">
                    <CriticalActionButton label={"Log Out"} iconName={"log-out-outline"} onPress={handleSignout} />
                    <CriticalActionButton label={"Delete Account"} iconName={"person-remove-outline"} onPress={() => {}} />
                </View>
            </View>
        );
    }

    if (initializing || loading) {
        return <GenericLoadingScreen />;
    }

    if (!user?.emailVerified) {
        return <EmailVerificationScreen />;
    }

    return (
        <View className="flex-1 bg-background">
            <ProfileHeader />
            <TitleText text={"Account Information"} className="mt-5 text-center" />
            <ProfileInfoContent user={user} userProfile={userProfile} />
        </View>
    );
}