import {SessionParticipant, SwipeAction, SwipingSession} from "@/services/DatabaseService";
import React, {createContext, ReactNode, useContext, useEffect, useRef, useState} from "react";
import {useServices} from "@/context/ServicesContext";
import {Place} from "@/types/Places.types";
import {isDeepEqual} from "@/utils/ComparisonUtils";
import {useSessionFlowController} from "@/hooks/SessionControllerHook";

type SwipingSessionContextProps = {
    activeSession: SwipingSession | null;
    participants: SessionParticipant[];
    places: Place[];
    swipes: SwipeAction[];
    loading: boolean;
    sessionResolved: boolean | null;
    error: Error | null;
}
export const SwipingSessionContext = createContext<SwipingSessionContextProps>({
    activeSession: null,
    participants: [],
    swipes: [],
    places: [],
    loading: true,
    sessionResolved: null,
    error: null,
});

export function SwipingSessionProvider({ children }: { children: ReactNode }) {
    const { database, user, userProfile, loading: servicesLoading } = useServices();

    const [activeSession, setActiveSession] = useState<SwipingSession | null>(null);
    const [participants, setParticipants] = useState<SessionParticipant[]>([]);
    const [swipes, setSwipes] = useState<SwipeAction[]>([]);
    const [places, setPlaces] = useState<Place[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [sessionResolved, setSessionResolved] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);

    const [participantsLoaded, setParticipantsLoaded] = useState<boolean>(false);
    const [placesLoaded, setPlacesLoaded] = useState<boolean>(false);
    const [swipesLoaded, setSwipesLoaded] = useState<boolean>(false);

    const prevSessionIdRef = useRef<string | null>(null);

    useSessionFlowController({
        activeSession,
        participants,
        places,
        user,
        sessionResolved,
        participantsLoaded,
        database,
        setError,
    });

    useEffect(() => {
        if (servicesLoading) return;

        const sessionId = userProfile?.activeSessionId ?? null;
        if (prevSessionIdRef.current === sessionId && sessionResolved) {
            return;
        }
        prevSessionIdRef.current = sessionId;

        if (!sessionId) {
            setActiveSession(null);
            setParticipants([]);
            setSwipes([]);
            setPlaces([]);
            setSessionResolved(true);
            setLoading(false);
            setError(null);
            return;
        }

        setSessionResolved(false);
        setLoading(true);
        setError(null);

        let unsubParticipants: () => void;
        let unsubSwipes: () => void;
        let unsubPlaces: () => void;

        const unsubSession = database.onSessionUpdates(
            sessionId,
            session => {
                if (!session) {
                    setError(new Error("Session not found"));
                    setSessionResolved(true);
                    setLoading(false);
                    return;
                }
                setActiveSession(prev => {
                    if (!prev || prev.status !== session.status || !isDeepEqual(prev, session)) {
                        return session;
                    }
                    return prev;
                });
                queueMicrotask(() => {
                    setSessionResolved(true);
                    unsubParticipants = database.onParticipantUpdates(
                        sessionId,
                        newParticipants => {
                            setParticipants(prev => {
                                if (!isDeepEqual(prev, newParticipants)) {
                                    return newParticipants;
                                }
                                return prev;
                            });
                            setParticipantsLoaded(true);
                        },
                        err => {
                            console.warn("Session participants error:", err);
                            setError(prev => prev ?? new Error(`Failed to load participants: ${err.message}`));
                            setParticipantsLoaded(true);
                        }
                    );
                    unsubSwipes = database.onSwipeUpdates(
                        sessionId,
                        newSwipes => {
                            setSwipes(prev => {
                                if (!isDeepEqual(prev, newSwipes)) {
                                    return newSwipes;
                                }
                                return prev;
                            });
                            setSwipesLoaded(true);
                        },
                        err => {
                            console.warn("Session swipes error:", err);
                            setError(prev => prev ?? new Error(`Failed to load swipes: ${err.message}`));
                            setSwipesLoaded(true);
                        }
                    );
                    unsubPlaces = database.onPlaceUpdates(
                        sessionId,
                        newPlaces => {
                            setPlaces(prev => {
                                if (!isDeepEqual(prev, newPlaces)) {
                                    console.log("[database] places updated");
                                    return newPlaces;
                                }
                                return prev;
                            });
                            setPlacesLoaded(true);
                        },
                        err => {
                            console.warn("Session places error:", err);
                            setError(prev => prev ?? new Error(`Failed to load places: ${err.message}`));
                            setPlacesLoaded(true);
                        }
                    );
                    setLoading(false);
                });
            },
            err => {
                console.warn("Session error:", err);
                setError(new Error(`Failed to load session: ${err.message}`));
                setSessionResolved(true);
                setLoading(false);
            }
        );

        return () => {
            unsubSession?.();
            unsubParticipants?.();
            unsubSwipes?.();
            unsubPlaces?.();
        };
    }, [database, servicesLoading, userProfile?.activeSessionId]);

    return (
        <SwipingSessionContext.Provider
            value={{
                activeSession,
                participants,
                swipes,
                places,
                loading,
                sessionResolved,
                error,
            }}
        >
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