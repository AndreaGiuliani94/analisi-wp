export interface SessionState {
    sessionId: string
    match: Record<string, any> | null
    events: Record<string, any>[]
    channel: any | null
    participants: any[]
    title: string
}