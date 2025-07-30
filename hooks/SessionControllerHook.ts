import { User } from "@/services/AuthService";
import {
    DatabaseService,
    SESSION_STARTED_STATUSES,
    SessionParticipant,
    SessionStatus,
    SwipingSession
} from "@/services/DatabaseService";
import {useEffect, useRef} from "react";
import {Place} from "@/types/Places.types";

export function useSessionFlowController(
    {
        activeSession,
        participants,
        places,
        user,
        sessionResolved,
        participantsLoaded,
        database,
        setError,
    }: {
        activeSession: SwipingSession | null;
        participants: SessionParticipant[];
        places: Place[];
        user: User | null;
        sessionResolved: boolean;
        participantsLoaded: boolean;
        database: DatabaseService;
        setError: (err: Error) => void;
}) {
    const prevParticipantCount = useRef<number | null>(null);

    useEffect(() => {
        if (!activeSession || !sessionResolved || !participantsLoaded || !user) return;

        const FINAL_STATUSES = [SessionStatus.ENDED, SessionStatus.EXPIRED];
        if (FINAL_STATUSES.includes(activeSession.status)) return;

        const isOwner = activeSession.createdBy === user.uid;
        if (!isOwner) return;

        const participantCount = participants.length;
        if (prevParticipantCount.current === participantCount) return;
        prevParticipantCount.current = participantCount;

        const hasStarted = SESSION_STARTED_STATUSES.includes(activeSession.status);

        if (hasStarted && participantCount < 2) {
            database.updateSession(activeSession.id, { status: SessionStatus.ENDED })
                .catch(
                    err =>  setError(new Error(`Failed to update session: ${err.message}`))
                );
            return;
        }

        if (participantCount < 2 && !hasStarted && activeSession.status !== SessionStatus.WAITING_FOR_USERS) {
            database.updateSession(activeSession.id, { status: SessionStatus.WAITING_FOR_USERS })
                .catch(
                    err => setError(new Error(`Failed to update session: ${err.message}`))
                );
            return;
        }

        if (participantCount >= 2 && !hasStarted && activeSession.status !== SessionStatus.READY_FOR_START) {
            database.updateSession(activeSession.id, { status: SessionStatus.READY_FOR_START })
                .catch(
                    err => setError(new Error(`Failed to update session: ${err.message}`))
                );
        }
    }, [activeSession?.id, activeSession?.status, activeSession?.createdBy, participants.length, sessionResolved, participantsLoaded, user?.uid]);

    useEffect(() => {
        if (!activeSession || !user || !sessionResolved) return;
        const isOwner = activeSession.createdBy === user.uid;
        if (!isOwner) return;

        if (activeSession.status === SessionStatus.LOADING_INITIAL_PLACES && places.length === 0) {
            console.log("should be loading initial places now..");
        }
        if (activeSession.status === SessionStatus.LOADING_NEW_PLACES && places.length > 0) {
            console.log("should be loading new places now..");
        }
    }, [activeSession?.status, places.length]);
}