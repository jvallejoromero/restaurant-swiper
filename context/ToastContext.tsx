import React, {createContext, useContext} from "react";
import {Toast, ToastType, useToastHook} from "@/hooks/ToastHook";
import { View } from "react-native";
import ToastMessage from "@/components/ToastMessage";

type ToastContextProps = {
    showToast: (message: string, type?: ToastType) => void;
}

export const ToastContext = createContext<ToastContextProps | null>(null);
export const ToastProvider = ({ children }: { children: React.ReactNode}) => {
    const { toast, showToast } = useToastHook(3000);

    return (
        <ToastContext.Provider value={{showToast}}>
            <View className="flex-1 relative">
                {children}
                {toast && <ToastMessage message={toast.message} toastType={toast.toastType} />}
            </View>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be inside ToastProvider');
    return ctx;
}