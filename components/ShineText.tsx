import React, { useEffect, useRef, useState, memo } from 'react'; // Import memo
import { View, Text, StyleSheet, Animated, Easing, StyleProp, TextStyle, ViewStyle, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';

interface ShineTextProps {
    text: string;
    style?: StyleProp<TextStyle>;
    containerStyle?: StyleProp<ViewStyle>;
    enabled?: boolean;
    shineColor?: string;
    duration?: number;
    delay?: number;
    slantAngle?: number;
}

// Define the component implementation
const ShineTextComponent: React.FC<ShineTextProps> = ({
                                                          text,
                                                          style,
                                                          containerStyle,
                                                          enabled = true,
                                                          shineColor = 'rgba(255, 255, 255, 0.6)',
                                                          duration = 1000,
                                                          delay = 1500,
                                                          slantAngle = 20,
                                                      }) => {
    const shineAnim = useRef(new Animated.Value(0)).current;
    const [viewWidth, setViewWidth] = useState<number | null>(null);

    const textStyle = StyleSheet.flatten(style || {});
    const baseTextColor = textStyle.color || 'white';

    useEffect(() => {
        if (!enabled || viewWidth === null) {
            shineAnim.stopAnimation(); shineAnim.setValue(0); return;
        }
        const animation = Animated.loop(
            Animated.sequence([
                Animated.timing(shineAnim, { toValue: 1, duration: duration, easing: Easing.linear, useNativeDriver: Platform.OS !== 'web'}),
                Animated.delay(delay),
                Animated.timing(shineAnim, { toValue: 0, duration: 0, useNativeDriver: Platform.OS !== 'web'}),
            ])
        );
        animation.start(); return () => animation.stop();
    }, [enabled, viewWidth, shineAnim, duration, delay]);

    const estimatedHeight = textStyle.fontSize ? textStyle.fontSize * 1.2 : 20;
    const angleRad = (slantAngle * Math.PI) / 180;
    const yOffset = viewWidth ? (Math.tan(angleRad) * viewWidth) / 2 : 0;
    const startY = Math.max(0, Math.min(1, 0.5 - yOffset / estimatedHeight));
    const endY = Math.max(0, Math.min(1, 0.5 + yOffset / estimatedHeight));
    const gradientStart = { x: 0, y: startY };
    const gradientEnd = { x: 1, y: endY };
    const gradientWidth = viewWidth ? viewWidth * 0.5 : 50;
    const totalTravelDistance = (viewWidth ?? 0) + gradientWidth;
    const startPosition = -gradientWidth;
    const translateX = shineAnim.interpolate({ inputRange: [0, 1], outputRange: [startPosition, startPosition + totalTravelDistance] });

    const maskTextStyle = [style, styles.maskText];
    const canRenderMask = viewWidth !== null;

    if (!canRenderMask) {
        return (
            <View
                style={[styles.rootContainer, containerStyle]}
                onLayout={(event) => {
                    const { width } = event.nativeEvent.layout;
                    if (width > 0 && width !== viewWidth) {
                        setViewWidth(width);
                    }
                }}
                collapsable={false}
            >
                <Text style={maskTextStyle} numberOfLines={1}
                      accessibilityElementsHidden={true}
                      importantForAccessibility="no-hide-descendants"
                >
                    {text}
                </Text>
            </View>
        );
    }

    return (
        <View style={[styles.rootContainer, containerStyle]} collapsable={false}>
            <MaskedView
                maskElement={
                    <View style={styles.maskElementWrapper}>
                        <Text style={maskTextStyle} numberOfLines={1}>
                            {text}
                        </Text>
                    </View>
                }
            >
                <Text style={[maskTextStyle, { color: baseTextColor }]}
                      accessibilityElementsHidden={true}
                      importantForAccessibility="no-hide-descendants"
                >
                    {text}
                </Text>
                {enabled && (
                    <Animated.View
                        style={[
                            styles.shineGradientContainer,
                            {
                                width: gradientWidth,
                                transform: [{ translateX }],
                            },
                        ]}
                        pointerEvents="none"
                    >
                        <LinearGradient
                            colors={['transparent', shineColor, 'transparent']}
                            start={gradientStart}
                            end={gradientEnd}
                            style={StyleSheet.absoluteFill}
                        />
                    </Animated.View>
                )}
            </MaskedView>
        </View>
    );
};

const styles = StyleSheet.create({
    rootContainer: {
        // alignSelf: 'flex-start',
        marginBottom: 2,
        overflow: 'hidden', // ADDED THIS
    },
    maskElementWrapper: {
        backgroundColor: 'transparent',
    },
    maskText: {
        backgroundColor: 'transparent',
    },
    shineGradientContainer: {
        ...StyleSheet.absoluteFillObject,
    },
});

// Export the memoized component
export default memo(ShineTextComponent);