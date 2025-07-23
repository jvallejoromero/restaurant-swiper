import {ActivityIndicator, SafeAreaView, StyleSheet, Text, TextInput, View, Animated} from "react-native";
import {Feather} from "@expo/vector-icons";
import {useNavigation, useRouter} from "expo-router";
import React, {useEffect, useLayoutEffect, useRef, useState} from "react";
import {useServices} from "@/context/ServicesContext";
import {usePreventRemove} from '@react-navigation/native';
import {ConfirmChangesModal} from "@/components/modals/ConfirmChangesModal";
import GenericLoadingScreen from "@/components/screens/GenericLoadingScreen";
import BackDoneNavigationHeader from "@/components/headers/BackDoneNavigationHeader";
import Separator from "@/components/ui/Separator";
import { useToast } from "@/context/ToastContext";
import {ToastType} from "@/hooks/ToastHook";


export default function EditDisplayNameScreen() {
    const router = useRouter();
    const navigation = useNavigation();
    const {user, database} = useServices();
    const { showToast } = useToast();

    const [loading, setLoading] = useState<boolean>(true);

    const [isFocused, setIsFocused] = useState<boolean>(false);
    const [isEdited, setIsEdited] = useState<boolean>(false);

    const [verifyingUsername, setVerifyingUsername] = useState<boolean>(false);
    const [checkedUsername, setCheckedUsername] = useState<boolean>(false);
    const [isValidUsername, setIsValidUsername] = useState<boolean>(false);

    const [username, setUsername] = useState<string | null>(null);
    const [usernameLength, setUsernameLength] = useState<number>(0);
    const [error, setError] = useState<string | null>(null);

    const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
    const pendingBackAction = useRef<() => void>(() => {});

    const textInputRef = useRef<TextInput>(null);
    const debounceRef = useRef<number | null>(null);
    const pressedDoneRef = useRef(false);
    const shakeAnimation = useRef(new Animated.Value(0)).current;

    const maxNameLength = 32;
    const userUid = user?.uid;

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
    const updateUsername = async () => {
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
            // setError("The entered username is invalid!");
            triggerShake();
            return;
        }

        // update to new username
        const oldUsername = user?.username;
        try {
            await database.updateUsernameDoc(userUid, oldUsername, username!.trim(), user?.email);
            await database.updateUserProfile(userUid, {username: username?.trim()});
        } catch (error) {
            router.back();
            showToast("An error occurred while updating profile.", ToastType.ERROR);
            return;
        }
        router.back();
        showToast("Updated Username", ToastType.SUCCESS);
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
        return <GenericLoadingScreen />;
    }

    return (
        <SafeAreaView className="flex-1 bg-background">
            <ConfirmChangesModal
                visible={showConfirmModal}
                onCancel={() => {
                    setShowConfirmModal(false);
                    pendingBackAction.current();
                }}
                onConfirm={() => {
                    if (!isValidUsername) {
                        setShowConfirmModal(false);
                        triggerShake();
                        setError("Could not save changes, please enter a valid username!");
                        return;
                    }
                    updateUsername();
                }}
            />

            <BackDoneNavigationHeader label={"Username"} onPressDone={updateUsername} />
            <Separator className={"my-4 mx-6"} />

            <View className="flex-1 px-6 gap-3">
                <Animated.View
                    className={`relative border rounded-lg px-4 pt-5 pb-2 ${isFocused ? "border-primary" : "border-[#667]"}`}
                    style={{transform: [{translateX: shakeAnimation}]}}
                >
                    <Text className={`absolute top-1 left-1 px-4 text-sm ${isFocused ? "text-primary" : "text-black"}`}>
                        Username
                    </Text>
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
                        style={styles.textInput}
                        placeholder="Placeholder"
                        placeholderTextColor="transparent"
                        maxLength={maxNameLength}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                    />
                    <View className="absolute right-3 top-[50%]">
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
                <Text className={`text-right ${(usernameLength >= (maxNameLength)) ? "text-primary" : "text-black"}`}>
                    Allowed length: {usernameLength}/{maxNameLength}
                </Text>
                <Text className="italic text-accent-grey">
                    Pick a username (letters, numbers, '_' and '.')—up to 32 characters. Your username will be visible to others.
                </Text>
                <View className="w-full">
                    {(error && error !== "") && (
                        <Text className="text-primary">{error}</Text>
                    )}
                </View>
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    textInput: {
        height: 32,
        width: '90%',
        paddingHorizontal: 4,
        color: "black",
        fontSize: 16,
    }
});
