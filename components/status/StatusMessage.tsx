import {StyleSheet, Text, View} from "react-native";
import React from "react";

type StatusType = "success" | "warning" | "error";

const StatusMessage = ({ text, status }: { text: string, status: StatusType}) => {
    if (status === "success") {
        return <Text style={styles.successText}>{text}</Text>;
    } else if (status === "warning") {
        return <Text style={styles.warningText}>{text}</Text>;
    } else if (status === "error") {
        return <Text style={styles.errorText}>{text}</Text>
    } else {
        return null;
    }
}

export default StatusMessage;

const styles = StyleSheet.create({
    warningText: {
        color: 'orange',
        fontWeight: 'bold',
        fontSize: 18,
    },
    errorText: {
        color: 'red',
        fontWeight: 'bold',
        fontSize: 18,
    },
    successText: {
        color: 'green',
        fontWeight: 'bold',
        fontSize: 18,
    },
});