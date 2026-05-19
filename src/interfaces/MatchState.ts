import type { MatchRole } from "@/enum/RoleType"

export interface MatchState {
    matchId: string
    channel: any | null,
    title: string
    clientId: string,
    participants: any[],
    userRole: MatchRole | null
}