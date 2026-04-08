import type { SessionState } from "./SessionState"

export interface Session {
    session_id: string
    role: 'owner' | 'editor' | 'viewer'
    sessions: SessionState // relazione
}