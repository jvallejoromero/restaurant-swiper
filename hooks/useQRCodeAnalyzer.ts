import {BarcodeScanningResult} from "expo-camera";
import {useServices} from "@/context/ServicesContext";
import {useEffect, useLayoutEffect, useState} from "react";
import {Linking} from "react-native";
import {SwipingSession} from "@/services/DatabaseService";

export function useQRCodeAnalyzer(result: (BarcodeScanningResult | null)) {
    const [canOpenUrl, setCanOpenUrl] = useState<boolean | undefined>(undefined);
    const [session, setSession] = useState<SwipingSession | null | undefined>(undefined);

    const { database } = useServices();

    useLayoutEffect(() => {
        if (result === null) {
            setCanOpenUrl(false);
            setSession(null);
        } else {
            setCanOpenUrl(undefined);
            setSession(undefined);
        }
    }, [result?.data]);

    useEffect(() => {
        let mounted = true;
        if (result === null) return;

        (async() => {
            const canOpenUrl = await Linking.canOpenURL(result.data);
            if (canOpenUrl) {
                setTimeout(() => {
                    if (!mounted) return;
                    setCanOpenUrl(true);
                    setSession(null);
                }, 500);
                return;
            }
            const requestedSession = await database.getSession(result.data);
            setTimeout(() => {
                if (!mounted) return;
                setCanOpenUrl(false);
                setSession(requestedSession);
            }, 500);
        })();

        return () => { mounted = false; };
    }, [result?.data]);

    return {canOpenUrl, session};
}