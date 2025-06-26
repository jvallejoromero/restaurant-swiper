import React, {useEffect, useState} from 'react';
import {ActivityIndicator, StyleSheet, View} from 'react-native';
import {Redirect, Stack, useRouter} from 'expo-router';
import {onAuthStateChanged} from 'firebase/auth';
import {auth} from '@/firebase';

export default function ProfileLayout() {
    const [user, setUser] = useState<any>(undefined);
    const router = useRouter();

    // subscribe to auth state changes once
    useEffect(() => {
        return onAuthStateChanged(auth, u => {
            console.log(u);

            setUser(u);
            // if there's no user, send to onboarding
            if (u === null) {
                console.log("user is null!!!!");
                router.replace("/profile/auth");
            }
        });
    }, []);

    // still loading auth state
    if (user === undefined) {
        return (
            <View style={[StyleSheet.absoluteFillObject, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" />
            </View>
        );
    }
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen
                name="index"
                options={{ gestureEnabled: false }}
            />
            <Stack.Screen
                name="edit-profile"
            />
            <Stack.Screen
                name="edit-displayname"
            />
            <Stack.Screen
                name="edit-username"
            />
        </Stack>
    );
}
