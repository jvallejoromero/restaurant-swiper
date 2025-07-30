import { Timestamp } from "firebase/firestore";

export function isDeepEqual(a: any, b: any): boolean {
    if (a === b) return true;
    if (a == null || b == null) return a === b;
    if (isTimestamp(a) && isTimestamp(b)) {
        return a.toMillis() === b.toMillis();
    }
    if (Array.isArray(a) && Array.isArray(b)) {
        if (a.length !== b.length) return false;
        return a.every((item, index) => isDeepEqual(item, b[index]));
    }
    if (typeof a === "object" && typeof b === "object") {
        const keysA = Object.keys(a);
        const keysB = Object.keys(b);
        if (keysA.length !== keysB.length) return false;
        return keysA.every((key) => isDeepEqual(a[key], b[key]));
    }
    return false;
}

function isTimestamp(obj: any): obj is Timestamp {
    return typeof obj?.toMillis === "function";
}