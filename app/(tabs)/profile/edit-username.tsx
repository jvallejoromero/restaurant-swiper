import {ActivityIndicator, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View, Animated} from "react-native";
import {COLORS} from "@/constants/colors";
import {Feather, Ionicons} from "@expo/vector-icons";
import {useNavigation, useRouter} from "expo-router";
import React, {useEffect, useLayoutEffect, useRef, useState} from "react";
import {useServices} from "@/context/ServicesContext";
import {authStyles} from "@/styles/AuthStyles";
import {usePreventRemove} from '@react-navigation/native';
import ConfirmChangesModal from "@/components/ConfirmChangesModal";


export default function EditDisplayNameScreen() {
    const router = useRouter();
    const navigation = useNavigation();

    const {user, database} = useServices();
    const userUid = user?.uid;

    const [isFocused, setIsFocused] = useState<boolean>(false);
    const [isEdited, setIsEdited] = useState(false);
    const [verifyingUsername, setVerifyingUsername] = useState(false);
    const [checkedUsername, setCheckedUsername] = useState(false);
    const [isValidUsername, setIsValidUsername] = useState(false);


    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const pendingBackAction = useRef<() => void>(() => {});

    const [loading, setLoading] = useState(true)

    const [username, setUsername] = useState<string | null>(null);
    const [usernameLength, setUsernameLength] = useState(0);

    const [error, setError] = useState<string | null>(null);

    const textInputRef = useRef<TextInput>(null);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);
    const pressedDoneRef = useRef(false);
    const shakeAnimation = useRef(new Animated.Value(0)).current;

    const maxNameLength = 32;

    // prevent gesture swiping when there are unsaved changes
    useLayoutEffect(() => {
        navigation.setOptions({
            gestureEnabled: !isEdited,
        });
    }, [navigation, isEdited]);

    // prevent back navigation if there are unsaved changes
    usePreventRemove(isEdited && !pressedDoneRef.current, (e) => {
        pendingBackAction.current = () => navigation.dispatch(e.data.action);
        setShowConfirmModal(true);
    });

    // calls when pressing the "Done" button
    const updateUsername = () => {
        if (!userUid) return;
        if (verifyingUsername) return;

        pressedDoneRef.current = true;

        if (!isEdited) {
            router.back();
            return;
        }
        if (username?.trim() === user?.username) {
            router.back();
            return;
        }
        if (username?.trim() === '') {
            database.updateUserProfile(userUid, {username: user?.username ?? ""})
                .then(() => {
                    router.back();
                })
            return;
        }

        if (!isValidUsername) {
            setError("The entered username is invalid!");
            triggerShake();
            return;
        }

        // update to new username
        const oldUsername = user?.username;
        database.updateUsernameDoc(userUid, oldUsername, username!.trim(), user?.email).then(() => {});
        database.updateUserProfile(userUid, {username: username?.trim()})
            .then(() => {
                router.back();
            })
    }

    const triggerShake = () => {
        shakeAnimation.setValue(0);
        Animated.sequence([
            Animated.timing(shakeAnimation, {
                toValue: 4,
                duration: 40,
                useNativeDriver: true,
            }),
            Animated.timing(shakeAnimation, {
                toValue: -4,
                duration: 40,
                useNativeDriver: true,
            }),
            Animated.timing(shakeAnimation, {
                toValue: 2,
                duration: 40,
                useNativeDriver: true,
            }),
            Animated.timing(shakeAnimation, {
                toValue: -2,
                duration: 40,
                useNativeDriver: true,
            }),
            Animated.timing(shakeAnimation, {
                toValue: 0,
                duration: 40,
                useNativeDriver: true,
            }),
        ]).start();
    };



    // auto focus floating label input
    useEffect(() => {
        if (!loading) {
            setTimeout(() => {
                textInputRef.current?.focus();
            }, 500);
        }
    }, [loading]);

    // get and set current display name
    useEffect(() => {
        if (!userUid) return;
        database.getUserProfile(userUid).then(profile => {
            setUsername(profile?.username ?? "");
            setUsernameLength(profile?.username?.length ?? 0);
        }).finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <View style={[StyleSheet.absoluteFillObject, authStyles.loadingIndicator]}>
                <ActivityIndicator size={24} />
            </View>
        )
    }

    return (
        <SafeAreaView style={styles.container}>
            <ConfirmChangesModal
                visible={showConfirmModal}
                onCancel={() => {
                    setShowConfirmModal(false);
                    pendingBackAction.current();
                }}
                onConfirm={() => {
                    if (!isValidUsername) {
                        setShowConfirmModal(false);
                        setError("Could not save changes, please enter a valid username!");
                        return;
                    }
                    updateUsername();
                }}
            />

            <View style={styles.header}>
                <TouchableOpacity style={styles.headerGoBack} onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={24}/>
                </TouchableOpacity>
                <Text style={styles.headerText}>Username</Text>
                <TouchableOpacity style={styles.doneButton} onPress={updateUsername}>
                    <Text style={styles.doneButtonText}>Done</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.separator} />
            <View style={styles.content}>
                <View style={styles.textInputContainer}>
                    <Animated.View style={[styles.textInputWrapper,
                        {
                            borderColor: isFocused ? COLORS.primary : "black",
                            transform: [{translateX: shakeAnimation}],
                        }]}
                    >
                        <Text style={[styles.textInputLabel, {color: isFocused ? COLORS.primary : "black"}]}>Username</Text>

                        <TextInput
                            ref={textInputRef}
                            value={username ?? ""}
                            scrollEnabled={true}
                            textAlign={"left"}
                            multiline={false}
                            onChangeText={(newUsername) => {
                                setError("");
                                setVerifyingUsername(true);
                                if (newUsername.length <= 0) {
                                    setUsername("");
                                    setIsValidUsername(false);
                                }
                                const re = /^[a-zA-Z0-9._]+$/;
                                if (!re.test(newUsername)) {
                                    setError("Username can only contain letters, numbers, underscores and periods!");
                                    setVerifyingUsername(false);
                                    return;
                                }
                                setIsEdited(user?.username !== newUsername);
                                const filtered = newUsername.replace(/\.{2,}/g, '.').toLowerCase();

                                setUsername(filtered);
                                setUsernameLength(newUsername.length);

                                if (debounceRef.current) clearTimeout(debounceRef.current);
                                debounceRef.current = setTimeout(async () => {
                                    if (filtered.length === 0 || filtered === user?.username) {
                                        setIsValidUsername(true);
                                        setVerifyingUsername(false);
                                        return;
                                    }

                                    const usernameExists = await database.usernameExists(filtered);
                                    if (usernameExists) {
                                        setIsValidUsername(false);
                                        setError("That username is already taken.");
                                    } else if (filtered.length <= 4) {
                                        setIsValidUsername(false);
                                        setError("Please enter a longer username!");
                                    } else if (!/[a-zA-Z]/.test(filtered)) {
                                        setIsValidUsername(false);
                                        setError("Username must contain at least one letter!");
                                    } else if (filtered.startsWith(".") || filtered.endsWith(".")) {
                                        setError("Username cannot start or end with a period!");
                                        setIsValidUsername(false);
                                    } else {
                                        setError("");
                                        setIsValidUsername(true);
                                    }
                                    setCheckedUsername(true);
                                    setVerifyingUsername(false);
                                }, 750);
                            }}
                            style={styles.textInputText}
                            placeholder="Placeholder"
                            placeholderTextColor="transparent"
                            maxLength={maxNameLength}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                        />
                        <View
                            style={styles.usernameVerifier}
                        >
                            {verifyingUsername ? (
                                <ActivityIndicator size={22} />
                            ) : checkedUsername ? (
                                isValidUsername ? (
                                    <Feather name="check-circle" size={22} color="green" />
                                ) : (
                                    <Feather name="x-circle" size={22} color="red" />
                                )
                            ) : null}
                        </View>
                    </Animated.View>
                </View>

                <Text style={[styles.lengthChecker, {color: (usernameLength >= (maxNameLength)) ? COLORS.primary : "black"}]}>Allowed length: {usernameLength}/{maxNameLength}</Text>
                <View style={styles.descriptionContainer}>
                    <Text style={styles.description}>Pick a username (letters, numbers, '_' and '.')—up to 32 characters. Your username will be visible to others.</Text>
                    <Text style={styles.description}></Text>
                </View>
                <View style={styles.errorContainer}>
                    {(error && error !== "") && (
                        <Text style={styles.errorText}>{error}</Text>
                    )}
                </View>
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background_color,
    },
    header: {
        width: "100%",
        height: "5%",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
    },
    headerGoBack: {
        position: "absolute",
        left: 10,
    },
    headerText: {
        fontSize: 18,
        fontWeight: "600",
        textAlign: "center",
    },
    doneButton: {
        position: 'absolute',
        right: 20,
    },
    doneButtonText: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.primary,
    },
    separator: {
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: 'rgba(0,0,0,0.1)',
        marginHorizontal: 16,
        marginTop: 14,
    },
    content: {
        padding: 24,
        flex: 1,
        backgroundColor: COLORS.background_color,
    },
    lengthChecker: {
        flexDirection: "row",
        textAlign: "right",
        color: COLORS.primary,
    },
    description: {
        fontStyle: "italic",
        color: "#484848",
    },
    descriptionContainer: {
        paddingTop: 16,
    },
    errorContainer: {
        width: "100%",
    },
    errorText: {
        color: COLORS.primary,
        fontWeight: 400,
    },
    textInputContainer: {
        marginVertical: 8,
    },
    textInputWrapper: {
        position: 'relative',
        borderWidth: 1,
        borderColor: '#666',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingTop: 18,
        paddingBottom: 8,
    },
    textInputLabel: {
        position: 'absolute',
        top: 5,
        left: 12,
        paddingHorizontal: 4,
        fontSize: 12,
    },
    textInputText: {
        height: 32,
        width: '90%',
        paddingHorizontal: 4,
        color: "black",
        fontSize: 16,
    },
    usernameVerifier: {
        position: 'absolute',
        right: 12,
        top: '50%',
    },
});
