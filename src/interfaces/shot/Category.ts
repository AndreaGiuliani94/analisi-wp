export type CategoryKey = 'goals' | 'parati' | 'fuori' | 'stoppati' | 'annullati';

export interface Category {
  key: CategoryKey
  label: string
}