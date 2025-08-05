import { User } from "@/services/AuthService";
import {
    DatabaseService, SESSION_FINALIZED_STATUSES,
    SESSION_STARTED_STATUSES, SessionMatch,
    SessionParticipant,
    SessionStatus, SwipeAction,
    SwipingSession
} from "@/services/DatabaseService";
import {useEffect, useMemo, useRef} from "react";
import {Place} from "@/types/Places.types";
import {fetchAllPlaces} from "@/utils/GoogleAPIUtils";
import {Timestamp} from "@firebase/firestore";

export function useSessionFlowController(
    {
        activeSession,
        participants,
        places,
        swipes,
        matches,
        user,
        sessionResolved,
        placesLoaded,
        participantsLoaded,
        swipesLoaded,
        matchesLoaded,
        database,
        setError,
    }: {
        activeSession: SwipingSession | null;
        participants: SessionParticipant[];
        places: Place[];
        swipes: SwipeAction[],
        matches: SessionMatch[];
        user: User | null;
        sessionResolved: boolean;
        participantsLoaded: boolean;
        swipesLoaded: boolean;
        matchesLoaded: boolean;
        placesLoaded: boolean;
        database: DatabaseService;
        setError: (err: Error) => void;
    }) {
    const allLoaded = participantsLoaded && placesLoaded && swipesLoaded && matchesLoaded;
    const prevParticipantCount = useRef<number | null>(null);

    useEffect(() => {
        if (!activeSession || !sessionResolved || !participantsLoaded || !user) return;

        if (SESSION_FINALIZED_STATUSES.includes(activeSession.status)) return;

        const isOwner = activeSession.createdBy === user.uid;
        if (!isOwner) return;

        const participantCount = participants.length;
        if (prevParticipantCount.current === participantCount) return;
        prevParticipantCount.current = participantCount;

        const hasStarted = SESSION_STARTED_STATUSES.includes(activeSession.status);

        if (hasStarted && participantCount < 2) {
            database.updateSession(activeSession.id, { status: SessionStatus.ENDED })
                .catch(err =>  setError(err));
            return;
        }

        if (participantCount < 2 && !hasStarted && activeSession.status !== SessionStatus.WAITING_FOR_USERS) {
            database.updateSession(activeSession.id, { status: SessionStatus.WAITING_FOR_USERS })
                .catch(err =>  setError(err));
            return;
        }

        if (participantCount >= 2 && !hasStarted && activeSession.status !== SessionStatus.READY_FOR_START) {
            database.updateSession(activeSession.id, { status: SessionStatus.READY_FOR_START })
                .catch(err =>  setError(err));
        }
    }, [activeSession?.id, activeSession?.status, activeSession?.createdBy, participants.length, sessionResolved, participantsLoaded, user?.uid]);

    useEffect(() => {
        if (!activeSession || !user || !sessionResolved) return;
        const isOwner = activeSession.createdBy === user.uid;
        if (!isOwner) return;

        if (activeSession.status === SessionStatus.LOADING_INITIAL_PLACES && places.length === 0) {
            (async () => {
                try {
                    const allFetchedPlaces: Place[] = [];
                    for (const type of activeSession.placeTypes) {
                        const fetched = await fetchAllPlaces(
                            activeSession.location,
                            activeSession.radius,
                            type
                        );
                        allFetchedPlaces.push(...fetched);
                    }
                    await database.addPlacesToSession(activeSession.id, allFetchedPlaces);
                } catch (err) {
                    if (err instanceof Error) setError(err);
                    else setError(new Error("An unknown error occurred."));
                }
                database.updateSession(activeSession.id, { status: SessionStatus.SWIPING })
                    .catch(err =>  setError(err));
            })();
        }
        if (activeSession.status === SessionStatus.LOADING_NEW_PLACES && places.length > 0) {
            console.log("should be loading new places now..");
        }
    }, [activeSession?.status]);


    const swipeMap = useMemo(() => {
        const map: Record<string, Set<string>> = {};
        for (const swipe of swipes) {
            if (!swipe.liked) continue;
            if (!map[swipe.placeId]) map[swipe.placeId] = new Set();
            map[swipe.placeId].add(swipe.userId);
        }
        return map;
    }, [swipes]);

    useEffect(() => {
        if (
            !activeSession?.createdBy ||
            !user?.uid ||
            activeSession.createdBy !== user.uid ||
            !sessionResolved ||
            !allLoaded ||
            activeSession.status !== SessionStatus.SWIPING
        ) return;

        for (const [placeId, userIdSet] of Object.entries(swipeMap)) {
            const place = places.find(p => p.id === placeId);
            if (!place) continue;

            const alreadyMatched = matches.find(m => m.placeId === placeId);
            if (alreadyMatched) continue;

            const everyoneLiked = participants.every(p =>
                p.id && swipeMap[placeId]?.has(p.id)
            );

            if (everyoneLiked) {
                database.recordMatch(activeSession.id, {
                    placeId,
                    matchedBy: Array.from(userIdSet),
                    matchedAt: Timestamp.now(),
                    placeType: place.type,
                }).catch(err => setError(err));
                console.log("match created by", user.uid, "for", place.name);
            }
        }
    }, [activeSession?.id, sessionResolved, allLoaded, swipeMap]);
}