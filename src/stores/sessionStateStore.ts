// stores/sessionState.ts
import { defineStore } from 'pinia'
import { RealtimeChannel } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { useGameStore } from './gameStore'
import { getSession, updateSession } from '@/services/sessionService'

interface SessionState {
    sessionId: string
    match: Record<string, any> | null
    events: Record<string, any>[]
    channel: RealtimeChannel | null
}

export const useSessionStateStore = defineStore('sessionState', {
    state: (): SessionState => ({
        sessionId: '',
        match: null,
        events: [],
        channel: null
    }),

    actions: {
        async loadSession(sessionId: string) {
            this.sessionId = sessionId
            localStorage.setItem("session_id", sessionId);

            const res = await getSession(this.sessionId);

            const data = await res.json()

            this.match = data.match
            this.events = data.events
            localStorage.setItem("match", JSON.stringify(this.match));
            localStorage.setItem("events", JSON.stringify(this.events));

            this.subscribe()
        },

        subscribe() {
            if (this.channel) return

            this.channel = supabase
                .channel(`session_state:${this.sessionId}`)
                .on(
                    'postgres_changes',
                    {
                        event: 'UPDATE',
                        schema: 'public',
                        table: 'session_state',
                        filter: `session_id=eq.${this.sessionId}`
                    },
                    (payload) => {
                        const newData = payload.new as any

                        const gameStore = useGameStore()
                        gameStore.saveData()
                    }
                )
                .subscribe()

        },

        async updateState(match: any, events: any[]) {
            if (!this.sessionId) return

            const res = await updateSession(this.sessionId, match, events);

            const data = await res.json()
            console.log("Righe aggiornate:", data.updated_rows)
        }
    }
})
