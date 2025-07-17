import {Text, View} from "react-native";
import React, {useMemo} from "react";
import BottomSheet, {BottomSheetScrollView} from "@gorhom/bottom-sheet";
import {SwipingSession} from "@/services/DatabaseService";

type JoinSessionBottomSheetProps = {
    loading: boolean;
    sheetRef: React.RefObject<BottomSheet | null>;
    index?: number;
    onChange?: (index: number) => void;
    session: SwipingSession | null | undefined;
    onJoinSession: () => void;
}

const snapPoints = useMemo(() => ["10%", "20%", "50%", "95%"], []);

const JoinSessionBottomSheet = ({ loading, sheetRef, index, onChange, session, onJoinSession }: JoinSessionBottomSheetProps) => {
    if (session === undefined  || session === null) {
        return null;
    }

    return (
        <BottomSheet
            ref={sheetRef}
            index={index ?? -1}
            onChange={onChange}
            animateOnMount={false}
            snapPoints={snapPoints}
            enablePanDownToClose
            backgroundStyle={{ borderRadius: 20, backgroundColor: "#fff" }}
            handleIndicatorStyle={{
                marginTop: 5,
                backgroundColor: "#d52e4c",
                width: 35,
            }}
        >
            <BottomSheetScrollView className="py-4 px-6">
                <View className="gap-2">
                    <Text className="text-xl text-primary text-center font-semibold">Session Information</Text>
                </View>
            </BottomSheetScrollView>
        </BottomSheet>
    );
}

export default JoinSessionBottomSheet;