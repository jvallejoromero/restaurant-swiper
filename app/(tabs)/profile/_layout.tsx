import React, {useEffect, useState} from 'react';
import {Stack, useRouter} from 'expo-router';
import {onAuthStateChanged, User} from 'firebase/auth';
import {auth} from '@/firebase';
import GenericLoadingScreen from "@/components/screens/GenericLoadingScreen";

export default function ProfileLayout() {
    const [user, setUser] = useState<User | null | undefined>(undefined);
    const router = useRouter();

    useEffect(() => {
        return onAuthStateChanged(auth, u => {
            setUser(u);
        });
    }, []);

    useEffect(() => {
        if (user === null) {
            router.replace("/profile/auth");
        }
    }, [user]);

    if (user === undefined) {
        return (
            <GenericLoadingScreen />
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
