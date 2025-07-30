import { User } from "@/services/AuthService";
import {SESSION_STARTED_STATUSES, SessionParticipant, SessionStatus, SwipingSession } from "@/services/DatabaseService";
import {useEffect, useRef} from "react";

export function useSessionFlowController(
    {
        activeSession,
        participants,
        user,
        sessionResolved,
        participantsLoaded,
        updateSession,
        setError,
    }: {
        activeSession: SwipingSession | null;
        participants: SessionParticipant[];
        user: User | null;
        sessionResolved: boolean;
        participantsLoaded: boolean;
        updateSession: (sessionId: string, data: Partial<SwipingSession>) => Promise<void>;
        setError: (err: Error) => void;
}) {
    const prevParticipantCount = useRef<number | null>(null);

    useEffect(() => {
        if (!activeSession || !sessionResolved || !participantsLoaded || !user) return;

        const isOwner = activeSession.createdBy === user.uid;
        const participantCount = participants.length;

        if (prevParticipantCount.current === participantCount) return;
        prevParticipantCount.current = participantCount;

        if (!isOwner) return;

        const hasStarted = SESSION_STARTED_STATUSES.includes(activeSession.status);

        if (hasStarted && participantCount < 2 && activeSession.status !== SessionStatus.ENDED) {
            updateSession(activeSession.id, { status: SessionStatus.ENDED })
                .catch(
                    err =>  setError(new Error(`Failed to update session: ${err.message}`))
                );
            return;
        }

        if (participantCount < 2 && !hasStarted && activeSession.status !== SessionStatus.WAITING_FOR_USERS) {
            updateSession(activeSession.id, { status: SessionStatus.WAITING_FOR_USERS })
                .catch(
                    err => setError(new Error(`Failed to update session: ${err.message}`))
                );
            return;
        }

        if (participantCount >= 2 && !hasStarted && activeSession.status !== SessionStatus.READY_FOR_START) {
            updateSession(activeSession.id, { status: SessionStatus.READY_FOR_START })
                .catch(
                    err => setError(new Error(`Failed to update session: ${err.message}`))
                );
        }
    }, [activeSession?.status, participants.length]);
}