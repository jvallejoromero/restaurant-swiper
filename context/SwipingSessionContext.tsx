import {SessionParticipant, SwipeAction, SwipingSession} from "@/services/DatabaseService";
import React, {createContext, ReactNode, useContext, useEffect, useState} from "react";
import {useServices} from "@/context/ServicesContext";
import {Place} from "@/types/Places.types";
import {isDeepEqual} from "@/utils/ComparisonUtils";

type SwipingSessionContextProps = {
    activeSession: SwipingSession | null;
    participants: SessionParticipant[];
    places: Place[];
    swipes: SwipeAction[];
    loading: boolean;
    allLoaded: boolean;
    error: Error | null;
}
export const SwipingSessionContext = createContext<SwipingSessionContextProps>({
    activeSession: null,
    participants: [],
    swipes: [],
    places: [],
    loading: true,
    allLoaded: false,
    error: null,
});

export function SwipingSessionProvider({ children }: { children: ReactNode }) {
    const { database, userProfile } = useServices();

    const [activeSession, setActiveSession] = useState<SwipingSession | null>(null);
    const [participants, setParticipants] = useState<SessionParticipant[]>([]);
    const [swipes, setSwipes] = useState<SwipeAction[]>([]);
    const [places, setPlaces] = useState<Place[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const [participantsLoaded, setParticipantsLoaded] = useState<boolean>(false);
    const [swipesLoaded, setSwipesLoaded] = useState<boolean>(false);
    const [placesLoaded, setPlacesLoaded] = useState<boolean>(false);

    const resetLoadingFlags = () => {
        setParticipantsLoaded(false);
        setSwipesLoaded(false);
        setPlacesLoaded(false);
    }

    useEffect(() => {
        if (!userProfile || !userProfile.activeSessionId) {
            setActiveSession(null);
            setParticipants([]);
            setSwipes([]);
            setPlaces([]);
            setLoading(false);
            setError(null);

            resetLoadingFlags();
            return;
        }
        setLoading(true);
        setError(null);

        const sessionId = userProfile.activeSessionId;
        let unsubParticipants: () => void;
        let unsubSwipes: () => void;
        let unsubPlaces: () => void;

        const unsubSession = database.onSessionUpdates(
            sessionId,
            session => {
                if (!session) {
                    setError(new Error("Session not found"));
                    setLoading(false);
                    return;
                }
                setActiveSession(prev => {
                    if (!isDeepEqual(prev, session)) {
                        return session;
                    }
                    return prev;
                });
                setLoading(false);
                queueMicrotask(() => {
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
                });
            },
            err => {
                console.warn("Session error:", err);
                setError(new Error(`Failed to load session: ${err.message}`));
                setLoading(false);
            }
        );

        return () => {
            unsubSession?.();
            unsubParticipants?.();
            unsubSwipes?.();
            unsubPlaces?.();
        };
    }, [database, userProfile?.activeSessionId]);

    const allLoaded = participantsLoaded && swipesLoaded && placesLoaded;
    return (
        <SwipingSessionContext.Provider
            value={{
                activeSession,
                participants,
                swipes,
                places,
                loading,
                allLoaded,
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