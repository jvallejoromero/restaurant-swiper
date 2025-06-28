import React, {forwardRef} from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    TextInputProps,
    ViewStyle,
    TextStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface FloatingLabelInputProps extends TextInputProps {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    containerStyle?: ViewStyle;
    wrapperStyle?: ViewStyle;
    labelStyle?: TextStyle;
    clearIconColor?: string;
}

const FloatingLabelInput = forwardRef<TextInput, FloatingLabelInputProps>(({label, value, onChangeText, containerStyle,
                                               wrapperStyle,labelStyle,clearIconColor = '#000', style, ...textInputProps}: FloatingLabelInputProps, ref) => {
    return (
        <View style={[styles.container, containerStyle]}>
            <View style={[styles.inputWrapper, wrapperStyle]}>
                <Text style={[styles.label, labelStyle]}>{label}</Text>

                <TextInput
                    ref={ref}
                    value={value}
                    onChangeText={onChangeText}
                    style={[styles.input, style]}
                    placeholder="Placeholder"
                    placeholderTextColor="transparent"
                    scrollEnabled={true}
                    textAlign={"left"}
                    multiline={false}
                    {...textInputProps}
                />

                {value.length > 0 && (
                    <TouchableOpacity
                        style={styles.clearButton}
                        onPress={() => onChangeText('')}
                    >
                        <Ionicons name="close-circle" size={22} color={clearIconColor} />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
});

export default FloatingLabelInput;

const styles = StyleSheet.create({
    container: {
        marginVertical: 8,
    },
    inputWrapper: {
        position: 'relative',
        borderWidth: 1,
        borderColor: '#666',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingTop: 18,
        paddingBottom: 8,
    },
    label: {
        position: 'absolute',
        top: 5,
        left: 12,
        paddingHorizontal: 4,
        fontSize: 12,
    },
    input: {
        height: 32,
        width: '90%',
        paddingHorizontal: 4,
        color: "black",
        fontSize: 16,
    },
    clearButton: {
        position: 'absolute',
        right: 8,
        top: '50%',
    },
});
