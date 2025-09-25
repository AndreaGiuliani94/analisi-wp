import { defineStore } from 'pinia'
import { supabase } from '@/lib/supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { getAllSessions } from '@/services/sessionService'

interface SessionState {
    sessionId: string
    data: string
    channel: RealtimeChannel | null
    participants: any[],
    title: string,
    role: 'owner' | 'editor' | 'viewer',
}

export const useSessionStore = defineStore('session', {
    state: () => ({
        sessions: [] as {
            session_id: string
            role: 'owner' | 'editor' | 'viewer'
            sessions: SessionState // relazione
        }[],
        
    }),

    actions: {
        async getAllSessions() {
            const res = await getAllSessions()
            const data = await res.json()
            this.sessions = data
        }
    },
})
