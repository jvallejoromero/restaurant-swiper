import {useCallback, useRef} from "react";

type AsyncFunction<TArgs extends any[], TResult> = (...args: TArgs) => Promise<TResult>;

export function useDebouncedAsyncCallback<TArgs extends any[], TResult>(
    callback: AsyncFunction<TArgs, TResult>,
    delay: number,
): (...args: TArgs) => Promise<TResult | undefined> {
    const timeoutRef = useRef<number | null>(null);
    const resolveRef = useRef<((result: TResult | undefined) => void) | null>(null);

    return useCallback((...args: TArgs): Promise<TResult | undefined> => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        if (resolveRef.current) resolveRef.current(undefined);

        return new Promise(resolve => {
            resolveRef.current = resolve;
            timeoutRef.current = setTimeout(async () => {
                try {
                    const result = await callback(...args);
                    resolve(result);
                } catch (e) {
                    resolve(undefined);
                } finally {
                    timeoutRef.current = null;
                    resolveRef.current = null;
                }
            }, delay);
        });
    }, [callback, delay]);
}