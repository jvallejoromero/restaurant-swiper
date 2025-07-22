import React, {createContext, useContext} from "react";
import {useToastHook} from "@/hooks/ToastHook";
import { View } from "react-native";
import ToastMessage from "@/components/ToastMessage";

type ToastContextProps = {
    showToast: (message: string) => void;
}

export const ToastContext = createContext<ToastContextProps | null>(null);
export const ToastProvider = ({ children }: { children: React.ReactNode}) => {
    const { toast, showToast } = useToastHook(3000);

    return (
        <ToastContext.Provider value={{showToast}}>
            <View className="flex-1 relative">
                {children}
                <ToastMessage message={toast} />
            </View>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be inside ToastProvider');
    return ctx;
}