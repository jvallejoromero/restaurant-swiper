import React, {useEffect, useState} from "react";
import {
    ActivityIndicator,
    Dimensions,
    ImageBackground,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Image,
} from "react-native";
import {COLORS} from "@/constants/colors";
import {IMAGES} from "@/constants/images";
import {authStyles} from "@/styles/AuthStyles"
import {useServices} from "@/context/ServicesContext";
import {getAuth, sendEmailVerification} from "firebase/auth";
import {User} from "@/services/AuthService";
import {Ionicons, MaterialIcons} from "@expo/vector-icons";
import {LinearGradient} from "expo-linear-gradient";
import {router} from "expo-router";

const { width } = Dimensions.get("window");

export default function ProfileScreen() {

    const { auth, database } = useServices();

    const [initializing, setInitializing] = useState(true);
    const [loading, setLoading] = useState(false);

    const [user, setUser] = useState<User | null>(null);
    const [displayName, setDisplayName] = useState<string | null>(null);
    const [username, setUsername] = useState<string | null>(null);

    const [isMultilineDisplayName, setMultilineDisplayName] = useState(false);

    useEffect(() => {
        // 1) check current user once
        auth.getCurrentUser()
            .then(u => {
                if (u) {
                    setUser(u);
                } else {
                    setUser(null);
                }
            })
            .catch(console.warn)
            .finally(() => {
                setInitializing(false);
            });
    }, []);

    useEffect(() => {
        if (!user?.uid) return;

        return database.onUserProfile(user.uid, (profile) => {
                setDisplayName(profile?.displayName ?? profile?.username ?? "");
                setUsername(profile?.username ?? "");
            }
        );
    }, [database, user]);

    const handleSignout = async () => {
        setLoading(true);
        setTimeout(async () => {
            await auth.signOut();
            setLoading(false);
        }, 850);
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

    if (initializing || loading) {
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
        <View style={styles.container}>
            {/* Header with decorative food shapes */}
            <ImageBackground
                source={IMAGES.profile_header_bg}
                style={[styles.header, isMultilineDisplayName && { flexBasis: '41%' }]}
                blurRadius={5}
            >
                <LinearGradient
                    // fade from fully transparent at the top to a tiny bit darker at the bottom
                    colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.22)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={StyleSheet.absoluteFillObject}    // absolutely cover the header
                >
                    <View style={styles.avatarContainer}>
                        <Image
                            source={IMAGES.default_avatar}
                            style={styles.avatar}
                        />
                    </View>
                    <TouchableOpacity style={styles.editButton} onPress={() => router.push("/profile/edit-profile")}>
                        <Ionicons name="create-outline" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.displayName}
                          onTextLayout={(e) => {
                              if (e.nativeEvent.lines.length > 1) {
                                  setMultilineDisplayName(true);
                              } else {
                                  setMultilineDisplayName(false);
                              }
                          }}
                    >
                        {displayName}</Text>
                </LinearGradient>
            </ImageBackground>

            <View style={styles.content}>
                <Text style={styles.name}>{"Account Information"}</Text>

                <View style={styles.row}>
                    <Ionicons name="mail-outline" size={20} color="#555" />
                    <Text style={styles.label}>Email</Text>
                    <Text style={styles.value}>{user.email}</Text>
                </View>

                <View style={styles.row}>
                    <Ionicons name="person-outline" size={20} color="#555" />
                    <Text style={styles.label}>Username</Text>
                    <Text style={styles.value}>{username}</Text>
                </View>

                {/* Menu Actions */}
                <TouchableOpacity
                    style={[styles.menuItem, { borderBottomColor: "#eee" }]}
                >
                    <Ionicons
                        name="settings-outline"
                        size={20}
                        color="#555"
                        style={styles.menuIcon}
                    />
                    <Text style={styles.menuText}>Settings</Text>
                    <Ionicons name="chevron-forward" size={20} color="#999" />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.menuItem, { borderBottomColor: "#eee" }]}
                >
                    <Ionicons
                        name="rocket-outline"
                        size={20}
                        color="#555"
                        style={styles.menuIcon}
                    />
                    <Text style={styles.menuText}>Sessions</Text>
                    <Ionicons name="chevron-forward" size={20} color="#999"/>
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem} onPress={handleSignout}>
                    <MaterialIcons
                        name="logout"
                        size={20}
                        color="#555"
                        style={styles.menuIcon}
                    />
                    <Text style={[styles.menuText, { color: COLORS.primary }]}>Log Out</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem} onPress={() => {}}>
                    <Ionicons
                        name="person-remove-outline"
                        size={20}
                        color="#555"
                        style={styles.menuIcon}
                    />
                    <Text style={[styles.menuText, { color: COLORS.primary }]}>Delete Account</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const BUTTON_WIDTH = width * 0.75;

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
    header: {
        flexBasis: '37%',       // take roughly 37% of the screen height
        maxHeight: 300,
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
    },
    avatarContainer: {
        paddingTop: "15%",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
        padding: 10,
    },
    avatar: {
        width: 144,
        height: 144,
        borderRadius: 75,
        borderWidth: 0.5,
        borderColor: "#fff",
    },
    editButton: {
        position: "absolute",
        top: "15%",
        right: "5%",
        padding: 8
    },
    content: {
        padding: 24,
        flex: 1,
        backgroundColor: COLORS.background_color,
    },
    name: {
        fontSize: 26,
        fontWeight: "700",
        textAlign: "center",
        marginBottom: 24
    },
    displayName: {
        padding: 10,
        fontSize: 26,
        fontWeight: "700",
        textAlign: "center",
        color: "white",
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20,
    },
    label: {
        flex: 1,
        marginLeft: 12,
        fontSize: 16,
        color: "#555"
    },
    value: {
        fontSize: 16,
        fontWeight: "500",
        color: "#000"
    },
    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
    },
    menuIcon: {
        marginRight: 12
    },
    menuText: {
        flex: 1,
        fontSize: 16,
        color: "#000"
    },
});
