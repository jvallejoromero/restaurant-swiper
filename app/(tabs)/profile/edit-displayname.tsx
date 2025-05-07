import {View, StyleSheet, SafeAreaView, Text, TouchableOpacity, Image, ActivityIndicator, TextInput} from "react-native";
import {COLORS} from "@/constants/colors";
import {Ionicons} from "@expo/vector-icons";
import {useRouter} from "expo-router";
import React, {useEffect, useState} from "react";
import {useServices} from "@/context/ServicesContext";
import {authStyles} from "@/styles/AuthStyles";
import FloatingLabelInput from "@/components/FloatingLabelInput";


export default function EditDisplayNameScreen() {
    const router = useRouter();
    const {user, database} = useServices();
    const userUid = user?.uid;

    const [displayName, setDisplayName] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const updateDisplayName = () => {
        if (!userUid) return;
        database.updateUserProfile(userUid, {displayName: displayName?.trim()})
            .then(() => {
                router.back();
            })
    }

    useEffect(() => {
        if (!userUid) return;
        database.getUserProfile(userUid).then(profile => {
            setDisplayName(profile?.displayName ?? null);
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
                    label="Display Name"
                    value={displayName ?? ""}
                    onChangeText={setDisplayName}
                    clearIconColor={COLORS.primary}
                    labelStyle={{
                        color: COLORS.primary,
                    }}
                    wrapperStyle={{
                        borderColor: COLORS.primary,
                    }}
                />
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
});
