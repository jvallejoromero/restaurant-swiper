import {useActiveSwipingSession} from "@/context/SwipingSessionContext";
import {Pressable, Text} from "react-native";
import RadarPulseIcon from "@/components/buttons/RadarPulseIcon";
import React from "react";

type SessionStatusButtonProps = {
    active: boolean;
    onPress?: () => void;
}

const SessionStatusButton = ({ active, onPress }: SessionStatusButtonProps) => {
    return (
        <Pressable
            onPress={onPress}
            className={`flex-row items-center gap-2 px-2 py-1.5 rounded-full
                        border border-transparent shadow-sm shadow-black/20 
                        ${active ? 'bg-green-100/80' : 'bg-neutral-100/80'}`}
        >
            <Text className={`text-sm font-semibold ${active ? 'text-green-700' : 'text-neutral-500'}`}>
                {active ? "Session Active" : "No Active Session"}
            </Text>
            {active && <RadarPulseIcon icon={"🚀"} size={18} />}
        </Pressable>
    );
};

export default SessionStatusButton;