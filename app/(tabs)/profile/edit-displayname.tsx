import {SafeAreaView,Text,TextInput,View} from "react-native";
import {COLORS} from "@/constants/colors";
import {useNavigation, useRouter} from "expo-router";
import React, {useEffect, useLayoutEffect, useRef, useState} from "react";
import {useServices} from "@/context/ServicesContext";
import FloatingLabelInput from "@/components/inputs/FloatingLabelInput";
import { usePreventRemove } from '@react-navigation/native';
import {ConfirmChangesModal} from "@/components/modals/ConfirmChangesModal";
import GenericLoadingScreen from "@/components/screens/GenericLoadingScreen";
import BackDoneNavigationHeader from "@/components/headers/BackDoneNavigationHeader";
import Separator from "@/components/ui/Separator";
import {ToastType} from "@/hooks/useToastHook";
import {useToast} from "@/context/ToastContext";


export default function EditDisplayNameScreen() {
    const router = useRouter();
    const navigation = useNavigation();
    const { user, database } = useServices();
    const { showToast } = useToast();

    const [isFocused, setIsFocused] = useState<boolean>(false);
    const [isEdited, setIsEdited] = useState<boolean>(false);
    const [pressedDone, setPressedDone] = useState<boolean>(false);

    const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
    const pendingBackAction = useRef<() => void>(() => {});

    const [loading, setLoading] = useState<boolean>(true)
    const [displayName, setDisplayName] = useState<string | null>(null);
    const [displayNameLength, setDisplayNameLength] = useState<number>(0);

    const textInputRef = useRef<TextInput>(null);

    const maxNameLength = 32;
    const userUid = user?.uid;

    // prevent gesture swiping when there are unsaved changes
    useLayoutEffect(() => {
        navigation.setOptions({
            gestureEnabled: !isEdited,
        });
    }, [navigation, isEdited]);

    // prevent back navigation if there are unsaved changes
    usePreventRemove((isEdited && !pressedDone), (e) => {
        pendingBackAction.current = () => navigation.dispatch(e.data.action);
        setShowConfirmModal(true);
    });

    const updateDisplayName = async() => {
        if (!userUid) return;
        setPressedDone(true);

        if (!isEdited) {
            router.back();
            return;
        }

        if (displayName?.trim() === '') {
            try {
                await database.updateUserProfile(userUid, { displayName: user?.username ?? "" });
            } catch (error) {
                showToast("An error occurred while updating profile.", ToastType.ERROR);
                return;
            }
        } else {
            try {
                await database.updateUserProfile(userUid, { displayName: displayName?.trim() });
            } catch (error) {
                showToast("An error occurred while updating profile.", ToastType.ERROR);
                return;
            }
        }
        showToast("Updated Display Name", ToastType.SUCCESS);
        router.back();
    }

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
            setDisplayName(profile?.displayName ?? "");
            setDisplayNameLength(profile?.displayName?.length ?? 0);
        }).finally(() => setLoading(false));
    }, []);

    if (loading) {
        return <GenericLoadingScreen />;
    }

    return (
        <SafeAreaView className="flex-1">
            <ConfirmChangesModal
                visible={showConfirmModal}
                onCancel={() => {
                    setShowConfirmModal(false);
                    pendingBackAction.current();
                }}
                onConfirm={updateDisplayName}
            />
            <BackDoneNavigationHeader label={"Display Name"} onPressDone={updateDisplayName} />
            <Separator className={"my-4 mx-6"} />
            <View className="flex-1 px-6 gap-3">
                <View>
                    <FloatingLabelInput
                        ref={textInputRef}
                        label="Display Name"
                        value={displayName ?? ""}
                        onChangeText={(newName) => {
                            setDisplayName(newName);
                            setDisplayNameLength(newName.length);
                            setIsEdited(displayName !== newName);
                        }}
                        clearIconColor={isFocused ? COLORS.primary : "black"}
                        labelStyle={{
                            color: isFocused ? COLORS.primary : "black"
                        }}
                        wrapperStyle={{
                            borderColor: isFocused ? COLORS.primary : "black"
                        }}
                        maxLength={maxNameLength}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                    />
                    <Text className={`text-right ${(displayNameLength >= (maxNameLength)) ? "text-primary" : "text-black"}`}>
                        Allowed length: {displayNameLength}/{maxNameLength}
                    </Text>
                </View>
                <Text className="italic text-accent-grey">
                    Pick a display name (letters, numbers, emojis)—up to 32 characters. Your display name will be visible to others.
                </Text>
            </View>
        </SafeAreaView>
    );
}