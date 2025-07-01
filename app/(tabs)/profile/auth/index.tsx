import {Image, ImageBackground, SafeAreaView, StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import React, {useEffect} from 'react'
import {IMAGES} from "@/constants/images";
import {authStyles} from "@/styles/AuthStyles";
import ShineText from "@/components/text/ShineText";
import {COLORS} from "@/constants/colors";
import {useRouter} from "expo-router";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import {
    getAuth,
    GoogleAuthProvider,
    signInWithCredential
} from "firebase/auth";
import GenericButton from "@/components/buttons/GenericButton";

// let the proxy complete any in-app redirects
WebBrowser.maybeCompleteAuthSession();

export default function OnboardingScreen() {
    const router = useRouter();

    // setup Google auth request
    const [request, response, promptAsync] = Google.useAuthRequest({
        iosClientId:     "246037100548-r5h4hsvam917nthd914ei12fhh1crpod.apps.googleusercontent.com",
        androidClientId: "246037100548-g6r0kkh32cbbdv28t677qd5nljoqe03a.apps.googleusercontent.com",
        webClientId:     "246037100548-vamnjkedbotg00vmsn8crbhju4gjrdbt.apps.googleusercontent.com",
        clientId:    "246037100548-vamnjkedbotg00vmsn8crbhju4gjrdbt.apps.googleusercontent.com",
        scopes: ["profile", "email"],
    });

    if (request) {
        console.log("proxy redirectUri =", request.redirectUri);
    }

    // listen for Google auth request response
    useEffect(() => {
        if (response?.type === "success") {
            const { id_token, access_token } = response.params;
            const credential = GoogleAuthProvider.credential(id_token, access_token);

            // send credentials to Firebase
            signInWithCredential(getAuth(), credential)
                .then(() => {
                    router.replace("/profile");
                })
                .catch(err => {
                    console.error("Firebase sign-in error:", err);
                });
        }
    }, [response, router]);

    const AppLogoHeader = () => {
        return (
            <View className="items-center justify-center">
                <Image source={IMAGES.forked_logo} className="w-[120] h-[120]" resizeMode="contain" />
                <ShineText style={styles.logo} text="Forked" delay={3000} duration={1500} slantAngle={75}/>
            </View>
        );
    }

    const SocialLoginOptions = () => {
        return (
            <View className="items-center justify-center gap-1">
                <Text className="text-lg color-primary">Or sign in with</Text>
                <View className="flex-row">
                    <TouchableOpacity
                        onPress={() => promptAsync()}
                    >
                        <Image
                            source={require('../../../../assets/google-assets/signin/google_logo.png')}
                            style={{ width:44, height:44 }}
                        />
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <ImageBackground
            source={IMAGES.auth_bg}
            style={authStyles.background}
            blurRadius={5}
        >
            <SafeAreaView className="flex-1 items-center justify-center">
                <View className="items-center justify-center gap-3" style={authStyles.card}>
                    <AppLogoHeader />
                    <View className="w-full gap-1">
                        <GenericButton text={"SIGN IN"} color={"rgba(213,46,76,0.85)"} onPress={() => router.replace("/profile/auth/login")} />
                        <GenericButton text={"SIGN UP"} onPress={() => router.replace("/profile/auth/signup")} />
                    </View>
                    <SocialLoginOptions />
                </View>
            </SafeAreaView>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    logo: {
        fontSize: 24,
        fontStyle: "italic",
        color: COLORS.primary,
        fontWeight: "600",
    },
})