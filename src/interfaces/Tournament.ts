import type { TournamentRole } from "@/enum/RoleType";

export interface Tournament {
    id: string;
    tournament_id: string; // Potrebbe essere lo stesso di 'id' o un alias
    name: string;
    title: string; // Alias per 'name' se usato in alcune parti
    category: string;
    gender: 'M' | 'F' | 'MIXED';
    season: string;
    match_count: number; // Numero totale di match
    matches: any[]; // Array di oggetti match
    participants: TournamentParticipant[]; // Array di oggetti utente associati al torneo
    default_period_length: number; // Durata di un periodo in millisecondi
    default_periods_count: number; // Numero di periodi
    allow_ties: boolean; // Indica se sono abilitati i rigori in caso di pareggio
    // Aggiungi qui altre proprietà se presenti nella risposta del backend
}

export interface TournamentParticipant {
    id: string;
    user_id: string;
    name: string;
    email: string;
    role: TournamentRole; // Aggiunto 'admin' per coerenza
}

export enum TournamentGender {
    M = 'M',
    F = 'F',
    MIXED = 'MIXED'
}
