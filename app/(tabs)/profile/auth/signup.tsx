import React, { useState } from "react";
import {
    ImageBackground,
    View,
    Text,
    TouchableWithoutFeedback, Keyboard,
} from "react-native";
import { useServices } from "@/context/ServicesContext";
import { useRouter } from "expo-router";
import {IMAGES} from "@/constants/images";
import {
    AuthActionButton,
    AuthStatusMessage,
    authStyles,
    EmailField,
    PasswordField,
    UsernameField
} from "@/styles/AuthStyles";

export default function SignupScreen() {
    const router = useRouter();
    const { auth } = useServices();

    const [loading, setLoading] = useState<boolean>(false);
    const [username, setUsername] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [pass, setPass] = useState<string>("");
    const [err, setErr] = useState<string>("");

    const canSubmit = username.trim() && email.trim() && pass.trim();

    const goToProfile = () => {
        router.replace("/profile");
    };

    const handleSignup = async () => {
        setErr("");
        setLoading(true);

        try {
            if (!username.trim()) {
                setErr("Please enter a username!");
                return;
            }
            if (username.length < 4) {
                setErr("Please enter a longer username!");
                return;
            }
            // check if username is valid
            if (username.trim().endsWith(".") || username.trim().startsWith(".")) {
                setErr("Username may not start or end with a period!");
                return;
            }
            const re = /^[a-zA-Z0-9._]+$/;
            if (!re.test(username.trim().normalize("NFC"))) {
                setErr("Please enter a valid username!\n (only _ and . are allowed as special characters)");
                return;
            }
            await auth.signUp(email.trim(), pass, username.trim().toLowerCase());

            // successful sign up
            goToProfile();
        } catch (e: any) {
            let msg = e.message;
            if (msg.includes("invalid-email")) {
                setErr("Please enter a valid email!");
            } else if (msg.includes("missing-password")) {
                setErr("Please enter a password!");
            } else if (msg.includes("weak-password")) {
                setErr("Please enter a stronger password!");
            }else if (msg.includes("email-already-in-use")) {
                setErr("This email is already being used!");
            } else {
                setErr(msg);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <TouchableWithoutFeedback
            onPress={Keyboard.dismiss}
            accessible={false}
        >
            <ImageBackground
                source={IMAGES.auth_bg}
                style={authStyles.background}
                blurRadius={5}
            >
                <View style={authStyles.container}>
                    <View style={authStyles.card}>
                        <Text style={authStyles.title}>Create an Account</Text>
                        <AuthStatusMessage loading={loading} err={err} />
                        <UsernameField placeholder={"Username"} value={username} onChangeText={setUsername} />
                        <EmailField placeholder={"Email"} value={email} onChangeText={setEmail} />
                        <PasswordField placeholder={"Password"} value={pass} onChangeText={setPass} />
                        <AuthActionButton label={"Sign Up"} disabled={!canSubmit} onPress={handleSignup} />
                        <Text style={authStyles.link} onPress={() => router.replace("/profile/auth/login")}>
                            Already have an account? Sign In
                        </Text>
                    </View>
                </View>
            </ImageBackground>
        </TouchableWithoutFeedback>
    );
}