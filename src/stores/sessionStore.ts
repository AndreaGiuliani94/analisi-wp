import { defineStore } from 'pinia'
import { getAllSessions, getSessionDetails } from '@/services/sessionService'
import type { Session } from '@/components/Interfaces/Session/Session'
import type { SessionDetails } from '@/components/Interfaces/Session/SessionDetails'

export const useSessionStore = defineStore('session', {
    state: () => {
        const savedSessions = localStorage.getItem("sessions");
        const savedSession = localStorage.getItem("currentSession");
        return {
            sessions: savedSessions ? JSON.parse(savedSessions) as Session[] : {} as Session[],
            currentSession: savedSession ? JSON.parse(savedSession) as SessionDetails : {} as SessionDetails
        }
    },
    actions: {
        async getSessions(): Promise<Session[]> {
            return this.sessions != null ? this.sessions : this.getAllSessions()
        },
        async getCurrentSession(): Promise<SessionDetails> {
            return this.currentSession != null ? this.currentSession : this.joinSession('')
        },
        async getAllSessions() {
            const res = await getAllSessions()
            const data = await res.json()
            this.sessions = data
            localStorage.setItem("sessions", JSON.stringify(data));
            return data;
        },
        async getSessionDetails(sessionId: string) {
            const res = await getSessionDetails(sessionId)
            if (!res.ok) throw new Error('Errore caricamento sessione');
            const data = await res.json();
            this.currentSession = data;
            return data;
        },
        async getUserRoleByEmail(userEmail: string) {
            return this.currentSession.participants.find(p => p.email === userEmail)?.role ?? 'viewer';
        },
        async joinSession(sessionId: string) {
            if(sessionId == '')
                sessionId = localStorage.getItem("sessionId") ?? '';

            const res = await getSessionDetails(sessionId)
            if (!res.ok) throw new Error('Errore caricamento sessione');
            const data = await res.json();
            localStorage.setItem("currentSession", JSON.stringify(data));
            return data;
        }
    },
})
