import {Dimensions, Image, ImageBackground, SafeAreaView, StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import React from 'react'
import {IMAGES} from "@/constants/images";
import {authStyles} from "@/styles/AuthStyles";
import ShineText from "@/components/ShineText";
import {COLORS} from "@/constants/colors";
import {useRouter} from "expo-router";

const { width } = Dimensions.get("window");

export default function Index() {
    const router = useRouter();

    return (
        <ImageBackground
            source={IMAGES.auth_bg}
            style={authStyles.background}
            blurRadius={5}
        >
            <SafeAreaView style={styles.container}>
                <View style={[authStyles.card, {alignItems: "center", justifyContent: "center"}]}>
                    {/* App Logo */}
                    <Image source={IMAGES.forked_logo} style={styles.logo} resizeMode="contain" />

                    {/* Welcome Text */}
                    <ShineText style={styles.welcome} text="Forked" delay={3000} duration={1500} slantAngle={75}/>

                    {/* Sign In Button */}
                    <TouchableOpacity style={styles.signInButton} onPress={() => router.replace("/profile/auth/login")}>
                        <Text style={styles.signInText}>SIGN IN</Text>
                    </TouchableOpacity>

                    {/* Sign Up Button Outline */}
                    <TouchableOpacity style={styles.signUpButton} onPress={() => router.replace("/profile/auth/signup")}>
                        <Text style={styles.signUpText}>SIGN UP</Text>
                    </TouchableOpacity>

                    {/* Social Login */}
                    <Text style={styles.socialLabel}>Or sign in with Google</Text>
                    <View style={styles.socialRow}>
                    </View>
                </View>
            </SafeAreaView>
        </ImageBackground>
    );
}

const BUTTON_WIDTH = width * 0.75;
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    logo: {
        width: 120,
        height: 120,
        marginBottom: 10,
    },
    welcome: {
        fontSize: 24,
        fontStyle: "italic",
        color: COLORS.primary,
        fontWeight: "600",
        marginBottom: 24,
    },
    signInButton: {
        width: BUTTON_WIDTH,
        height: 48,
        backgroundColor: "rgba(213,46,76,0.85)",
        borderRadius: 24,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 16,
    },
    signInText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
    signUpButton: {
        width: BUTTON_WIDTH,
        height: 48,
        borderColor: "#fff",
        backgroundColor: COLORS.primary,
        borderWidth: 2,
        borderRadius: 24,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 32,
    },
    signUpText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
    socialLabel: {
        fontSize: 14,
        color: COLORS.primary,
        marginBottom: 12,
    },
    socialRow: {
        flexDirection: "row",
    },
    socialIcon: {
        marginHorizontal: 12,
    },
})