import {Animated, Dimensions, SafeAreaView, Text, View} from "react-native";
import React, {FC, useEffect, useRef} from "react";
import { ToastType } from "@/hooks/ToastHook";
import {AlertCircle, Check, XCircle} from "lucide-react-native";
import {Ionicons} from "@expo/vector-icons";

type ToastMessageProps = {
    message: string | null;
    toastType: ToastType;
}

const NeutralToastMessage = ({ message }: { message: string }) => {
    return (
        <View className="min-h-[60] mt-16 mx-6
                           bg-white rounded-lg border-l-4 border-l-primary/95
                             border border-accent-grey/20
                             shadow-md shadow-black/10
                            ">
            <View className="flex-1 flex-row py-2 px-4 items-center justify-between">
                <View className="flex-1 mr-2">
                    <Text
                        className="text-black font-medium text-lg leading-tight"
                        numberOfLines={3}
                        ellipsizeMode="tail"
                    >
                        {message}
                    </Text>
                </View>
                <View className="flex-shrink-0"></View>
            </View>
        </View>
    );
}

const InfoToastMessage = ({ message }: { message: string }) => {
    return (
        <View className="min-h-[60] mt-16 mx-6
                           bg-white rounded-lg border-l-4 border-l-primary/95
                             border border-accent-grey/20
                             shadow-md shadow-black/10
                            ">
            <View className="flex-1 flex-row py-2 px-4 items-center justify-between">
                <View className="flex-1 mr-2">
                    <Text
                        className="text-black font-medium text-lg leading-tight"
                        numberOfLines={3}
                        ellipsizeMode="tail"
                    >
                        {message}
                    </Text>
                </View>
                <View className="flex-shrink-0">
                    <Ionicons name="information-circle-outline" size={20} />
                </View>
            </View>
        </View>
    );
}

const SuccessToastMessage = ({ message }: { message: string }) => {
    return (
        <View className="min-h-[60] mt-16 mx-6
                           bg-green-600  rounded-lg border-l-4 border-l-green-800/95
                             border border-accent-grey/20
                             shadow-md shadow-black/10
                            ">
            <View className="flex-1 flex-row py-2 px-4 items-center justify-between">
                <View className="flex-1 mr-2">
                    <Text
                        className="text-white font-medium text-lg leading-tight"
                        numberOfLines={3}
                        ellipsizeMode="tail"
                    >
                        {message}
                    </Text>
                </View>
                <View className="flex-shrink-0">
                    <Check size={18} color="white" />
                </View>
            </View>
        </View>
    );
}

const ErrorToastMessage = ({ message }: { message: string }) => {
    return (
        <View className="min-h-[60] mt-16 mx-6
                           bg-red-600 rounded-lg border-l-4 border-l-red-800/95
                             border border-accent-grey/20
                             shadow-md shadow-black/10
                            ">
            <View className="flex-1 flex-row py-2 px-4 items-center justify-between">
                <View className="flex-1 mr-2">
                    <Text
                        className="text-white font-medium text-lg leading-tight"
                        numberOfLines={3}
                        ellipsizeMode="tail"
                    >
                        {message}
                    </Text>
                </View>
                <View className="flex-shrink-0">
                    <XCircle size={18} color="white" />
                </View>
            </View>
        </View>
    );
}

const WarningToastMessage = ({ message }: { message: string }) => {
    return (
        <View className="min-h-[60] mt-16 mx-6
                           bg-yellow-400  rounded-lg border-l-4 border-l-amber-400/95
                             border border-accent-grey/20
                             shadow-md shadow-black/10
                            ">
            <View className="flex-1 flex-row py-2 px-4 items-center justify-between">
                <View className="flex-1 mr-2">
                    <Text
                        className="text-white font-medium text-lg leading-tight"
                        numberOfLines={3}
                        ellipsizeMode="tail"
                    >
                        {message}
                    </Text>
                </View>
                <View className="flex-shrink-0">
                    <AlertCircle size={18} color={"white"} />
                </View>
            </View>
        </View>
    );
}

const toastComponentMap: Record<ToastType, FC<{ message: string }>> = {
    neutral: NeutralToastMessage,
    info: InfoToastMessage,
    success: SuccessToastMessage,
    error: ErrorToastMessage,
    warning: WarningToastMessage,
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ToastMessage = ({ message, toastType }: ToastMessageProps) => {
    const translateX = useRef(new Animated.Value(SCREEN_WIDTH)).current;

    useEffect(() => {
        if (!message) return;
        Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            speed: 20,
            bounciness: 10,
        }).start();
        const timeout = setTimeout(() => {
            translateX.setValue(SCREEN_WIDTH);
        }, 2000);
        return () => {
            clearTimeout(timeout);
            translateX.setValue(SCREEN_WIDTH);
        };
    }, [message, translateX]);

    if (!message) return null;

    const ToastComponent = toastComponentMap[toastType];
    return (
        <SafeAreaView className="absolute mt-safe w-full">
            <Animated.View style={{ transform: [{ translateX }] }}>
                <ToastComponent message={message} />
            </Animated.View>
        </SafeAreaView>
    );
}

export default ToastMessage;