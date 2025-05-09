import React from 'react';
import Modal  from 'react-native-modal';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import {COLORS} from "@/constants/colors";

type ConfirmChangesModalProps = {
    visible: boolean;
    onConfirm: () => void;
    onCancel: () => void;
};

export default function ConfirmChangesModal({ visible, onConfirm, onCancel }: ConfirmChangesModalProps) {
    return (
        <Modal isVisible={visible}>
            <View style={styles.modalContainer}>
                <Text style={styles.modalTitle}>Cancel changes?</Text>
                <Text style={styles.modalMessage}>
                    If you go back without saving, you'll lose your changes.
                </Text>
                <View style={styles.modalButtonsContainer}>
                    <View style={styles.modalSeparator} />
                    <TouchableOpacity onPress={onConfirm}>
                        <Text style={styles.modalCancel}>Save changes</Text>
                    </TouchableOpacity>
                    <View style={styles.modalSeparator} />
                    <TouchableOpacity onPress={onCancel}>
                        <Text style={styles.modalDiscard}>Discard changes</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalSeparator: {
        width: '100%',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: 'rgba(0,0,0,0.1)',
    },
    modalContainer: {
        padding: 22,
        backgroundColor: 'white',
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 8,
    },
    modalMessage: {
        fontSize: 14,
        color: '#444',
        textAlign: 'center',
        marginBottom: 24,
    },
    modalButtonsContainer: {
        justifyContent: "center",
        alignItems: "center",
        width: '90%',
    },
    modalCancel: {
        color: '#555',
        fontWeight: '600',
        fontSize: 15,
        paddingVertical: 14,
    },
    modalDiscard: {
        color: COLORS.primary,
        fontWeight: '600',
        fontSize: 15,
        paddingVertical: 14,
    },
});