import {Animated, Dimensions, SafeAreaView, Text, View} from "react-native";
import React, {useEffect, useRef} from "react";

type ToastMessageProps = {
    message: string | null;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ToastMessage = ({ message}: ToastMessageProps) => {
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

    return (
        <SafeAreaView className="absolute mt-safe w-full">
            <Animated.View style={{ transform: [{ translateX }] }}>
                <View className="h-[50] mt-20 mx-6
                           bg-white/95 rounded-lg border-l-4 border-l-primary/95
                             border border-accent-grey/20
                             shadow-md shadow-black/10
                            ">
                    <View className="flex-1 px-4 justify-center">
                        <Text className="text-black font-medium text-lg">{message}</Text>
                    </View>
                </View>
            </Animated.View>
        </SafeAreaView>
    );
}

export default ToastMessage;