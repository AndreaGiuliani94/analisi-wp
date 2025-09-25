import { defineStore } from 'pinia'
import { getAllSessions } from '@/services/sessionService'
import type { Session } from '@/components/Interfaces/Session/Session'

export const useSessionStore = defineStore('session', {
    state: () => ({
        sessions: [] as Session[],
    }),

    actions: {
        async getAllSessions() {
            const res = await getAllSessions()
            const data = await res.json()
            this.sessions = data
        }
    },
})
