import {SessionParticipant, SwipingSession} from "@/services/DatabaseService";
import {createContext, ReactNode, useContext, useEffect, useState} from "react";
import {useServices} from "@/context/ServicesContext";

type SwipingSessionContextProps = {
    activeSession: SwipingSession | null;
    participants: SessionParticipant[];
}
export const SwipingSessionContext = createContext<SwipingSessionContextProps>({ activeSession: null, participants: [] });
export function SwipingSessionProvider({ children }: { children: ReactNode }) {
    const [activeSession, setActiveSession] = useState<SwipingSession | null>(null);
    const [participants, setParticipants] = useState<SessionParticipant[]>([]);

    const { database, userProfile } = useServices();

    useEffect(() => {
        if (!userProfile || !userProfile.activeSessionId) {
            setActiveSession(null);
            setParticipants([]);
            return;
        }

        database.getSession(userProfile.activeSessionId).then((session) => {
            setActiveSession(session);
        });

        database.getSessionParticipants(userProfile.activeSessionId).then(setParticipants);

        const unsub = database.onParticipantUpdates(userProfile?.activeSessionId, setParticipants);
        return () => unsub();
    }, [database, userProfile?.activeSessionId]);

    return (
        <SwipingSessionContext.Provider value={{ activeSession, participants }} >
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