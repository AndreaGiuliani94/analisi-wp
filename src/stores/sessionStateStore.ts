import { defineStore } from 'pinia'
import { supabase } from '@/lib/supabase'
import { useGameStore } from './gameStore'
import { getSession, updateSession } from '@/services/sessionService'
import type { SessionState } from '@/components/Interfaces/Session/SessionState'
import type { Match } from '@/components/Interfaces/Match'
import type { Event } from "@/components/Interfaces/Event";
import { useSessionStore } from './sessionStore'

export const useSessionStateStore = defineStore('sessionState', {
    state: (): SessionState => {
        const savedEvents = localStorage.getItem("events");
        const savedMatch = localStorage.getItem("match");
        const savedSessionId = localStorage.getItem("session_id")
        return {
            sessionId: savedSessionId ? savedSessionId : '',
            events: savedEvents ? JSON.parse(savedEvents) as Event[] : [],
            match: savedMatch ? JSON.parse(savedMatch) as Match : {} as Match,
            channel: null,
            title: ''
        }
    },

    actions: {
        async joinSession(sessionId: string) {
            this.sessionId = sessionId
            localStorage.setItem("session_id", sessionId);
            
            await this.getSession();

            const gameStore = useGameStore()
            gameStore.match = this.match as Match;
            gameStore.events = this.events as Event[];

            const sessionStore = useSessionStore()
            await sessionStore.joinSession(sessionId);

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
                        this.match = newData.match
                        this.events = newData.events

                        const gameStore = useGameStore()
                        gameStore.match = this.match as Match;
                        gameStore.events = this.events as Event[];
                        localStorage.setItem("match", JSON.stringify(this.match));
                        localStorage.setItem("events", JSON.stringify(this.events));
                    }
                )
                .subscribe()

        },

        async updateState(match: any, events: any[]) {
            if (!this.sessionId) {
                console.log("sessionId non trovato, lo recupero da local storage");
                const sessionIdLS = localStorage.getItem("session_id");
                if (sessionIdLS !== null) {
                    console.log("LocalStorageSessionId: " + sessionIdLS);
                    this.sessionId = sessionIdLS;
                } else {
                    console.log("session_id non trovato in localStorage");
                    return;
                }
            }
            await updateSession(this.sessionId, match, events);
        },

        async getSession() {
            const res = await getSession(this.sessionId);
            const data = await res.json()

            this.match = data.match
            this.events = data.events
            localStorage.setItem("match", JSON.stringify(this.match));
            localStorage.setItem("events", JSON.stringify(this.events));
        }
    }
})
