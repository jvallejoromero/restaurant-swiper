import React, {useMemo} from "react";
import {BottomSheetModal, BottomSheetView} from "@gorhom/bottom-sheet";
import {Text, TouchableOpacity, View} from "react-native";
import {Ionicons} from "@expo/vector-icons";

type ModifyProfilePictureSheetProps = {
    sheetRef: React.RefObject<BottomSheetModal | null>;
    entries: ModifyPfpEntry[];
    onOptionPress: (option: string) => void;
}

export type ModifyPfpEntry = {
    label: string;
    iconName: React.ComponentProps<typeof Ionicons>["name"];
}

const ModifyProfilePictureSheet = ({ sheetRef, entries, onOptionPress }: ModifyProfilePictureSheetProps) => {
    const snapPoints = useMemo(() => ["30%"], []);

    const Header = () => (
        <View className="px-4 pt-4 pb-2 rounded-t-2xl flex-row justify-center items-center">
            <View
                className="w-12 h-1.5 bg-gray-300 rounded-full self-center"
            />
        </View>
    );


    return (
        <BottomSheetModal
            ref={sheetRef}
            index={1}
            snapPoints={snapPoints}
            enablePanDownToClose
            handleComponent={Header}
            backgroundStyle={{ backgroundColor: "white", borderTopLeftRadius: 20, borderTopRightRadius: 20, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 10 }}
        >
            <BottomSheetView className="py-4 px-6 pb-safe">
                {entries.map(({ label, iconName }, index) => {
                    const isLast = index === entries.length - 1;
                    const isDelete = label.toLowerCase().includes("delete");
                    return (
                        <TouchableOpacity
                            key={label}
                            className={`flex-row items-center p-3  gap-2 
                                        ${!isLast && "border-b border-accent-grey/10"
                            }`}
                            onPress={() => {
                                sheetRef.current?.dismiss();
                                setTimeout(() => {
                                    onOptionPress(label);
                                }, 200);
                            }}
                        >
                            <Ionicons name={iconName} size={24} color={`${isDelete ? '#ef4444' : 'black'}`} />
                            <Text className={`text-lg ${isDelete ? 'text-red-500' : 'text-black'}`}>{label}</Text>
                        </TouchableOpacity>
                    );
                })}
            </BottomSheetView>
        </BottomSheetModal>
    );
}

export default ModifyProfilePictureSheet;