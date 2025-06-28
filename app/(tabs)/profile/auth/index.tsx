import {Dimensions, Image, ImageBackground, SafeAreaView, StyleSheet, Text, TouchableOpacity, View} from 'react-native'
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

const { width } = Dimensions.get("window");

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
                    <Text style={styles.socialLabel}>Or sign in with</Text>
                    <View style={styles.socialRow}>
                        <TouchableOpacity
                            style={styles.socialButton}
                            onPress={() => promptAsync()}
                        >
                            <Image
                                source={require('../../../../assets/google-assets/signin/google_logo.png')}
                                style={{ width:44, height:44 }}
                            />
                        </TouchableOpacity>
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
        marginBottom: 25,
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
    socialButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 4,
        elevation: 2,
    },
    socialIcon: {
        marginRight: 8
    },
})