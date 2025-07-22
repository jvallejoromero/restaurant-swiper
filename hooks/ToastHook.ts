import {useCallback, useEffect, useRef, useState} from "react";

const DEBOUNCE_MS = 350;

export function useToastHook(duration: number) {
    const [toast, setToast] = useState<string | null>(null);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const triggerToast = useCallback((message: string) => {
        if (timerRef.current) clearTimeout(timerRef.current);
        setToast(null);

        setTimeout(() => {
            setToast(message);
            timerRef.current = setTimeout(() => {
                setToast(null);
                timerRef.current = null;
            }, duration);
        }, 0);
    }, [duration]);

    const showToast = useCallback((message: string) => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            triggerToast(message);
            debounceRef.current = null;
        }, DEBOUNCE_MS);
    }, [triggerToast, DEBOUNCE_MS]);

    useEffect(() => {
        return () => {
            timerRef.current && clearTimeout(timerRef.current);
            debounceRef.current && clearTimeout(debounceRef.current);
        }
    }, []);

    return { toast, showToast };
}