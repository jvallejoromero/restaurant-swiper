import {
    ActivityIndicator,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import {COLORS} from "@/constants/colors";
import {Ionicons} from "@expo/vector-icons";
import {useNavigation, useRouter} from "expo-router";
import React, {useEffect, useLayoutEffect, useRef, useState} from "react";
import {useServices} from "@/context/ServicesContext";
import {authStyles} from "@/styles/AuthStyles";
import FloatingLabelInput from "@/components/inputs/FloatingLabelInput";
import { usePreventRemove } from '@react-navigation/native';
import {ConfirmChangesModal} from "@/components/modals/ConfirmChangesModal";


export default function EditDisplayNameScreen() {
    const router = useRouter();
    const navigation = useNavigation();

    const {user, database} = useServices();
    const userUid = user?.uid;

    const [isFocused, setIsFocused] = useState<boolean>(false);
    const [isEdited, setIsEdited] = useState(false);
    const [pressedDone, setPressedDone] = useState(false);

    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const pendingBackAction = useRef<() => void>(() => {});

    const [loading, setLoading] = useState(true)

    const [displayName, setDisplayName] = useState<string | null>(null);
    const [displayNameLength, setDisplayNameLength] = useState(0);

    const textInputRef = useRef<TextInput>(null);
    
    const maxNameLength = 32;

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


    const updateDisplayName = () => {
        if (!userUid) return;
        setPressedDone(true);

        if (!isEdited) {
            router.back();
            return;
        }
        if (displayName?.trim() === '') {
            database.updateUserProfile(userUid, {displayName: user?.username ?? ""})
                .then(() => {
                    router.back();
                })
            return;
        }
        database.updateUserProfile(userUid, {displayName: displayName?.trim()})
            .then(() => {
                router.back();
            })
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
                onConfirm={updateDisplayName}
            />

            <View style={styles.header}>
                <TouchableOpacity style={styles.headerGoBack} onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={24}/>
                </TouchableOpacity>
                <Text style={styles.headerText}>Display Name</Text>
                <TouchableOpacity style={styles.doneButton} onPress={updateDisplayName}>
                    <Text style={styles.doneButtonText}>Done</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.separator} />
            <View style={styles.content}>
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
                <Text style={[styles.lengthChecker, {color: (displayNameLength >= (maxNameLength)) ? COLORS.primary : "black"}]}>Allowed length: {displayNameLength}/{maxNameLength}</Text>
                <View style={styles.descriptionContainer}>
                    <Text style={styles.description}>Pick a display name (letters, numbers, emojis)—up to 32 characters. Your display name will be visible to others.</Text>
                    <Text style={styles.description}></Text>
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
});
