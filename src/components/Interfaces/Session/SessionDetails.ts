import type { Participant } from "../Participant"

export interface SessionDetails {
    session_id: string,
    name: string,
    participants: Participant[],
    user_role: string
}