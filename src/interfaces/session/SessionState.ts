export interface SessionState {
    sessionId: string
    matchId: string
    match: Record<string, any> | null
    events: Record<string, any>[]
    channel: any | null,
    title: string
}