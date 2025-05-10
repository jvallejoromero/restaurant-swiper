import {View, StyleSheet, SafeAreaView, Text, TouchableOpacity, Image, ActivityIndicator} from "react-native";
import {COLORS} from "@/constants/colors";
import {Ionicons} from "@expo/vector-icons";
import {useRouter} from "expo-router";
import {IMAGES} from "@/constants/images";
import React, {useEffect, useState} from "react";
import {useServices} from "@/context/ServicesContext";
import {authStyles} from "@/styles/AuthStyles";


export default function EditProfileScreen() {
    const router = useRouter();
    const {user, userProfile} = useServices();


    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.headerGoBack} onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={24}/>
                </TouchableOpacity>
                <Text style={styles.headerText}>Edit Profile</Text>
            </View>
            <View style={[styles.avatarContainer]}>
                <Image
                    source={IMAGES.default_avatar}
                    style={styles.avatar}
                />
                <TouchableOpacity activeOpacity={1} onPress={() => console.log("change pfp")}>
                    <Text style={styles.avatarText}>Modify profile picture</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.separator} />
            <View style={styles.editableContent}>
                <TouchableOpacity onPress={() => {console.log("change email")}}>
                    <View style={styles.row}>
                        <Ionicons name="mail-outline" size={20} color="#555" />
                        <Text style={styles.label}>Email</Text>
                        <View style={{ flex: 1 }}>
                            <Text numberOfLines={1} ellipsizeMode="tail" style={styles.value}>
                                {user?.email}
                            </Text>
                        </View>
                        <Ionicons
                            name="chevron-forward-outline"
                            size={18}
                            color="#999"
                            style={{ marginLeft: 8 }}
                        />
                    </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.push("/profile/edit-displayname")}>
                    <View style={styles.row}>
                        <Ionicons name="person-outline" size={20} color="#555" />
                        <Text style={styles.label}>Display Name</Text>
                        <View style={{ flex: 1 }}>
                            <Text numberOfLines={1} ellipsizeMode="tail" style={userProfile?.displayName ? styles.value : styles.emptyValue}>
                                {userProfile?.displayName ? userProfile.displayName : "None set"}
                            </Text>
                        </View>
                        <Ionicons
                            name="chevron-forward-outline"
                            size={18}
                            color="#999"
                            style={{ marginLeft: 8 }}
                        />
                    </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.push("/profile/edit-username")}>
                    <View style={styles.row}>
                        <Ionicons name="at-outline" size={20} color="#333" />
                        <Text style={styles.label}>Username</Text>
                        <View style={{ flex: 1 }}>
                            <Text numberOfLines={1} ellipsizeMode="tail" style={styles.value}>
                                {userProfile?.username}
                            </Text>
                        </View>
                        <Ionicons
                            name="chevron-forward-outline"
                            size={18}
                            color="#999"
                            style={{ marginLeft: 8 }}
                        />
                    </View>
                </TouchableOpacity>
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
    avatarContainer: {
        paddingTop: 15,
        height: 175,
        alignItems: "center",
    },
    avatar: {
        width: 144,
        height: 144,
        borderRadius: 75,

        borderColor: COLORS.primary,
    },
    avatarText: {
        paddingTop: 10,
        fontSize: 15,
        fontWeight: "500",
        color: COLORS.primary,
    },
    separator: {
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: 'rgba(0,0,0,0.1)',
        marginHorizontal: 16,
        marginTop: 24,
    },
    editableContent: {
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
        marginLeft: 12,
        paddingRight: 12,
        fontSize: 16,
        color: "#555",
    },
    value: {
        flex: 1,
        fontSize: 16,
        fontWeight: "500",
        color: "#000",
        textAlign: "right",
    },
    emptyValue: {
        flex: 1,
        fontSize: 16,
        color: "#000",
        textAlign: "right",
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
