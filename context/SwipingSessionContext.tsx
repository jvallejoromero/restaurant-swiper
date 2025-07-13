import {SwipingSession} from "@/services/DatabaseService";
import {createContext, ReactNode, useContext, useEffect, useState} from "react";
import {useServices} from "@/context/ServicesContext";

type SwipingSessionContextProps = {
    activeSession: SwipingSession | null;
}
export const SwipingSessionContext = createContext<SwipingSessionContextProps>({ activeSession: null });
export function SwipingSessionProvider({ children }: { children: ReactNode }) {
    const [activeSession, setActiveSession] = useState<SwipingSession | null>(null);
    const { database, userProfile } = useServices();

    useEffect(() => {
        (async() => {
            if (!userProfile || !userProfile.activeSessionId) {
                setActiveSession(null);
                return;
            }
            const session = await database.getSession(userProfile.activeSessionId);
            setActiveSession(session);
        })();
    }, [userProfile?.activeSessionId]);

    return (
        <SwipingSessionContext.Provider value={{ activeSession }} >
            {children}
        </SwipingSessionContext.Provider>
    );
}

export function useActiveSwipingSession(): SwipingSessionContextProps {
    const ctx = useContext(SwipingSessionContext);
    if (!ctx) {
        throw new Error("useActiveSwipingSession must be used within a SwipingSessionProvider");
    }
    return ctx;
}