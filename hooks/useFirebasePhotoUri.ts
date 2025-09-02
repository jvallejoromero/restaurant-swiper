import { useEffect, useState } from "react";
import { firebasePhotoCache } from "@/services/CacheService";

export function useFirebasePhotoUri(remoteUrl?: string) {
    const [uri, setUri] = useState<string | undefined>(remoteUrl);

    useEffect(() => {
        let mounted = true;

        (async () => {
            if (!remoteUrl) {
                setUri(undefined);
                return;
            }

            if (remoteUrl.startsWith("file://") || remoteUrl.includes("/o/")) {
                setUri(remoteUrl);
                return;
            }

            try {
                const cachedUrl = await firebasePhotoCache.getUrl(remoteUrl);
                if (mounted) setUri(cachedUrl);
            } catch {
                if (mounted) setUri(remoteUrl);
            }
        })();

        return () => { mounted = false; };
    }, [remoteUrl]);

    return uri;
}
