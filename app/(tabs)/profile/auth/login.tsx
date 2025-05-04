import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ImageBackground, ActivityIndicator, TouchableWithoutFeedback, Keyboard,
} from "react-native";
import { useServices } from "@/context/ServicesContext";
import { useRouter }    from "expo-router";
import {authStyles} from "@/styles/AuthStyles";
import {IMAGES} from "@/constants/images";
import {Lock, Mail} from "lucide-react-native";
import {COLORS} from "@/constants/colors";
import PasswordInput from "@/components/PasswordInput";

export default function LoginScreen() {
    const { auth, user } = useServices();
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [idOrEmail, setIdOrEmail] = useState("");
    const [pass, setPass] = useState("");
    const [err, setErr] = useState("");

    const canSubmit = idOrEmail.trim() && pass.trim();

    const handleLogin = async () => {
        // clear old errors
        setErr("");
        setLoading(true);

        try {
            await auth.signIn(idOrEmail.trim(), pass);

            // successful login
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
                    <View
                        style={authStyles.card}
                    >
                        <Text style={authStyles.title}>Welcome Back</Text>
                        {
                            loading
                                ? (
                                    <ActivityIndicator size={15} />
                                ) : (
                                    !!err && <Text style={authStyles.error}>{err}</Text>
                                )
                        }

                        {/* Email */}
                        <View style={authStyles.inputWrapper}>
                            <Mail size={20} color={COLORS.primary} style={authStyles.icon} />
                            <TextInput
                                placeholder="Email or Username"
                                placeholderTextColor="#aaa"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                value={idOrEmail}
                                onChangeText={setIdOrEmail}
                                style={authStyles.input}
                            />
                        </View>

                        {/* Password */}
                        <View style={authStyles.inputWrapper}>
                            <Lock size={20} color={COLORS.primary} style={authStyles.icon} />
                            <PasswordInput
                                placeholder="Password"
                                placeholderTextColor="#aaa"
                                secureTextEntry
                                value={pass}
                                onChangeText={setPass}
                                style={authStyles.input}
                            />
                        </View>

                        <TouchableOpacity
                            style={[authStyles.button, !canSubmit && {opacity: 0.5}]}
                            onPress={handleLogin}
                            disabled={!canSubmit}
                        >
                            <Text style={authStyles.buttonText}>Sign In</Text>
                        </TouchableOpacity>

                        <Text
                            style={authStyles.link}
                            onPress={() => router.replace("/profile/auth/signup")}
                        >
                            Don’t have an account? Sign Up
                        </Text>
                    </View>
                </View>
            </ImageBackground>
        </TouchableWithoutFeedback>
    );
}

