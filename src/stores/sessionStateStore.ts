// stores/sessionState.ts
import { defineStore } from 'pinia'
import { RealtimeChannel } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { useGameStore } from './gameStore'

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
        async init(sessionId: string) {
            this.sessionId = sessionId
            localStorage.setItem("session_id", sessionId);

            const { data, error } = await supabase
                .from('session_state')
                .select('*')
                .eq('session_id', sessionId)
                .single()

            if (error) {
                console.error(error)
                return
            }

            this.match = data.match
            this.events = data.events

            // 🔁 Sub Realtime
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

            const { error } = await supabase
                .from('session_state')
                .update({
                    match,
                    events,
                    updated_at: new Date().toISOString(), // opzionale
                })
                .eq('session_id', this.sessionId)

            if (error) {
                console.error('Errore aggiornamento stato sessione:', error)
            }
        }
    }
})
