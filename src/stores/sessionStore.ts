import { defineStore } from 'pinia'
import { supabase } from '@/lib/supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'

interface SessionState {
    sessionId: string
    data: string
    channel: RealtimeChannel | null
    participants: any[],
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
            const res = await fetch(`${import.meta.env.VITE_BE_URL}/sessions/all`, {
                method: 'GET',
                credentials: 'include'
            });
            const data = await res.json()
            this.sessions = data
        }
    },
})
