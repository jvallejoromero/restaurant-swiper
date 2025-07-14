import {Animated, Dimensions, Modal, Pressable, View} from "react-native";
import React, {forwardRef, useEffect, useImperativeHandle, useRef, useState} from "react";

export type PopupMessageRef = {
    open: () => void;
    close: () => void;
};

type PopupMessageProps = {
    children: React.ReactNode;
    animated?: boolean;
    className?: string;
    bgClassname?: string;
    onClose?: () => void;
}

const { height: windowHeight } = Dimensions.get("window");

const PopupMessage = forwardRef<PopupMessageRef, PopupMessageProps>(({ animated = true, className, bgClassname, onClose, children }, ref) => {
    const [visible, setVisible] = useState<boolean>(false);
    const translateY = useRef<Animated.Value>(new Animated.Value(windowHeight)).current;

    useEffect(() => {
        if (visible) {
            Animated.spring(translateY, {
                toValue: 0,
                friction: 6,
                tension: 50,
                useNativeDriver: true,
            }).start();
        }
    }, [visible, translateY]);

    useImperativeHandle(ref, () => ({
        open: () => setVisible(true),
        close: () => handleClose(),
    }));

    const handleClose = () => {
        Animated.timing(translateY, {
            toValue: windowHeight,
            duration: 200,
            useNativeDriver: true,
        }).start(() => {
            setVisible(false);
            onClose?.();
        });
    };

    return (
        <Modal
            transparent
            visible={visible}
            animationType="fade"
            onRequestClose={handleClose}
            presentationStyle="overFullScreen"
        >
            <Pressable
                className={`absolute inset-0 ${bgClassname}`}
                onPress={handleClose}
            />
            <View
                pointerEvents="box-none"
                className="absolute inset-0 justify-center items-center"
            >
                <Animated.View
                    className={className ? className : "bg-white rounded-lg p-4 max-w-[90%] max-h-[80%]"}
                    style={animated && { transform: [{ translateY }] }}
                >
                    {children}
                </Animated.View>
            </View>
        </Modal>
    );
});

export default PopupMessage;