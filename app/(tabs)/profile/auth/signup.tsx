import React, { useState } from "react";
import {
    ImageBackground,
    View,
    Text,
    TextInput,
    TouchableOpacity, ActivityIndicator,
    TouchableWithoutFeedback, Keyboard, Pressable,
} from "react-native";
import { useServices } from "@/context/ServicesContext";
import { useRouter } from "expo-router";
import { Coffee, Mail, Lock } from "lucide-react-native";
import {COLORS} from "@/constants/colors";
import {IMAGES} from "@/constants/images";
import {authStyles} from "@/styles/AuthStyles";
import PasswordInput from "@/components/inputs/PasswordInput";

export default function SignupScreen() {
    const { auth } = useServices();
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [pass, setPass] = useState("");
    const [err, setErr] = useState("");

    const canSubmit = username.trim() && email.trim() && pass.trim();

    // go back to profile index
    const goToProfile = () => {
        router.replace("/profile");
    };

    const handleSignup = async () => {
        // clear old errors
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
                        {
                            loading
                                ? (
                                    <ActivityIndicator size={15} />
                                ) : (
                                    !!err && <Text style={authStyles.error}>{err}</Text>
                                )
                        }

                        {/* Display Name */}
                        <View style={authStyles.inputWrapper}>
                            <Coffee size={20} color={COLORS.primary} style={authStyles.icon} />
                            <TextInput
                                placeholder="Username"
                                placeholderTextColor="#aaa"
                                value={username}
                                onChangeText={setUsername}
                                style={authStyles.input}
                            />
                        </View>

                        {/* Email */}
                        <View style={authStyles.inputWrapper}>
                            <Mail size={20} color={COLORS.primary} style={authStyles.icon} />
                            <TextInput
                                placeholder="Email"
                                placeholderTextColor="#aaa"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                value={email}
                                onChangeText={setEmail}
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
                            onPress={handleSignup}
                            disabled={!canSubmit}
                        >
                            <Text style={authStyles.buttonText}>Sign Up</Text>
                        </TouchableOpacity>

                        <Text
                            style={authStyles.link}
                            onPress={() => router.replace("/profile/auth/login")}
                        >
                            Already have an account? Sign In
                        </Text>
                    </View>
                </View>
            </ImageBackground>
        </TouchableWithoutFeedback>
    );
}