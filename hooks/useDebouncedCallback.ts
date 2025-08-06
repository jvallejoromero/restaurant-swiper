import {useCallback, useRef} from "react";

export function useDebouncedCallback<T extends (...args: any[]) => void>(
    callback: T,
    delay: number,
): T {
    const timeoutRef = useRef<number | null>(null);

    const debounced = useCallback((...args: Parameters<T>) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
            callback(...args);
        }, delay);
    }, [callback, delay]);

    return debounced as T;
}