import React, { useState } from "react";
import {
    View,
    Text,
    ImageBackground, TouchableWithoutFeedback, Keyboard,
} from "react-native";
import { useServices } from "@/context/ServicesContext";
import { useRouter }    from "expo-router";
import {AuthActionButton, AuthStatusMessage, authStyles, EmailField, PasswordField} from "@/styles/AuthStyles";
import {IMAGES} from "@/constants/images";

export default function LoginScreen() {
    const router = useRouter();
    const { auth } = useServices();

    const [loading, setLoading] = useState<boolean>(false);
    const [idOrEmail, setIdOrEmail] = useState<string>("");
    const [pass, setPass] = useState<string>("");
    const [err, setErr] = useState<string>("");

    const canSubmit = idOrEmail.trim() && pass.trim();

    const handleLogin = async () => {
        setErr("");
        setLoading(true);

        try {
            await auth.signIn(idOrEmail.trim(), pass);
            router.replace("/profile");
        } catch (e: any) {
            let msg = e.message;
            if (msg.includes("invalid-credential")) {
                setErr("Incorrect username or password!");
            } else if (msg.includes("too-many-requests")) {
                setErr("Slow down! Try again in a few seconds!");
            } else {
                setErr(msg);
            }
        } finally {
            setLoading(false);
        }
    }

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
                        <Text style={authStyles.title}>Welcome Back</Text>
                        <AuthStatusMessage loading={loading} err={err} />
                        <EmailField placeholder={"Email or Username"} value={idOrEmail} onChangeText={setIdOrEmail} />
                        <PasswordField placeholder={"Password"} value={pass} onChangeText={setPass} />
                        <AuthActionButton label={"Sign In"} disabled={!canSubmit} onPress={handleLogin} />
                        <Text style={authStyles.link} onPress={() => router.replace("/profile/auth/signup")}>
                            Don’t have an account? Sign Up
                        </Text>
                    </View>
                </View>
            </ImageBackground>
        </TouchableWithoutFeedback>
    );
}

