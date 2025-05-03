import React, {useEffect, useState} from "react";
import {
    ActivityIndicator,
    Dimensions,
    Image,
    ImageBackground,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import {COLORS} from "@/constants/colors";
import {IMAGES} from "@/constants/images";
import {authStyles} from "@/styles/AuthStyles"
import ShineText from "@/components/ShineText";
import {useServices} from "@/context/ServicesContext";
import {useRouter} from "expo-router";
import {getAuth, sendEmailVerification} from "firebase/auth";

const { width } = Dimensions.get("window");

export default function LoginScreen() {
    const router = useRouter();

    const { auth } = useServices();
    const [initializing, setInitializing] = useState(true);
    const [loading, setLoading] = useState(false);

    const [user, setUser] = useState<{ uid: string; email: string; username: string, emailVerified: boolean } | null>(null);


    useEffect(() => {
        // 1) check current user once
        auth.getCurrentUser()
            .then(u => {
                if (u) {
                    setUser(u);
                } else {
                    setUser(null);
                    router.replace("/profile/onboarding");
                }
            })
            .catch(console.warn)
            .finally(() => {
                setInitializing(false);
            });
    }, []);

    const handleSignout = async () => {
        setLoading(true);
        await auth.signOut();
        setTimeout(() => {
            router.replace("/profile");
            setLoading(false);
        }, 1250);
    }

    const handleResend = async () => {
        setLoading(true);
        const fbUser = getAuth().currentUser;
        if (fbUser) {
            await sendEmailVerification(fbUser);
        }
        setLoading(false);
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

    if (initializing) {
        return (
            <View style={[StyleSheet.absoluteFillObject, authStyles.loadingIndicator]}>
                <ActivityIndicator size={24} />
            </View>
        )
    }

    if (loading) {
        return (
            <View style={[StyleSheet.absoluteFillObject, authStyles.loadingIndicator]}>
                <ActivityIndicator size={24} />
            </View>
        )
    }

    if (!user?.emailVerified) {
        return (
            <ImageBackground
                source={IMAGES.auth_bg}
                style={authStyles.background}
                blurRadius={5}
            >
                <SafeAreaView style={styles.container}>
                    <View style={[authStyles.card, styles.cardInner]}>
                        <Text style={styles.title}>Verify Your Email</Text>
                        <Text style={styles.message}>
                            We sent a verification link to:
                        </Text>
                        <Text style={styles.email}>{user?.email}</Text>
                        <TouchableOpacity
                            style={styles.button}
                            onPress={handleResend}
                        >
                            <Text style={styles.buttonText}>Resend Email</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, styles.refreshButton]}
                            onPress={handleRefresh}
                        >
                            <Text style={styles.buttonText}>I’m Verified</Text>
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </ImageBackground>
        )
    }

    // user is valid
    return (
        <SafeAreaView style={styles.container}>
            <Text style={{ fontSize: 24 }}>Hello, {user?.username}!</Text>
            <Text>Email: {user?.email}</Text>
            <TouchableOpacity onPress={ handleSignout }>
                <Text style={{ color: "red", marginTop: 20 }}>Sign Out</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const BUTTON_WIDTH = width * 0.75;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    background: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    cardInner: {
        alignItems: "center",
        padding: 24,
    },
    title: {
        fontSize: 20,
        fontWeight: "600",
        marginBottom: 12,
        color: COLORS.primary,
    },
    message: {
        fontSize: 16,
        textAlign: "center",
        marginBottom: 8,
    },
    email: {
        fontSize: 16,
        fontWeight: "500",
        marginBottom: 24,
    },
    button: {
        width: BUTTON_WIDTH,
        height: 48,
        backgroundColor: COLORS.primary,
        borderRadius: 24,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 16,
    },
    refreshButton: {
        backgroundColor: COLORS.primary,
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
});
