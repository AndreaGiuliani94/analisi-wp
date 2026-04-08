export interface EventDetails {
  situation?: string; // Es. EVEN, SUP, PENALTY
  outcome?: string; // Es. GOAL, SAVED, MISSED
  position?: string; // Es. 1, 2, CB
  withBall?: boolean; // Per i falli
}
