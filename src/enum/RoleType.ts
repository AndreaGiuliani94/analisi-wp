/**
 * Ruoli comuni che vengono "ereditati" dagli altri gruppi
 */
const BaseRole = {
  OWNER: 'OWNER',
  VIEWER: 'VIEWER',
} as const;

/**
 * Ruoli specifici per l'Organizzazione
 */
export const OrganizationRole = {
  ...BaseRole,
  MEMBER: 'MEMBER',
  ADMIN: 'ADMIN',
} as const;
export type OrganizationRole = typeof OrganizationRole[keyof typeof OrganizationRole];

/**
 * Ruoli specifici per i Tornei
 */
export const TournamentRole = {
  ...BaseRole,
  EDITOR: 'EDITOR',
  ADMIN: 'ADMIN',
} as const;
export type TournamentRole = typeof TournamentRole[keyof typeof TournamentRole];

/**
 * Ruoli specifici per i Match
 */
export const MatchRole = {
  ...BaseRole,
  TIMEKEEPER: 'TIMEKEEPER',
  EDITOR: 'EDITOR',
} as const;
export type MatchRole = typeof MatchRole[keyof typeof MatchRole];

/**
 * Tipo globale che accetta qualsiasi ruolo definito sopra
 */
export type AppRole = OrganizationRole | TournamentRole | MatchRole;
