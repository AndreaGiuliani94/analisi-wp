import { FoulType, FoulPosition, EDCSType } from "@/enum/ExclutionDescription";
import { EvenShot, MenUpShot, ShotCategory, ShotOutcome } from "@/enum/ShotDescription";
import type { Category } from "@/interfaces/shot/Category";

export const shotCategories: Category[] = [
  { key: 'goals', label: 'Goal' },
  { key: 'parati', label: 'Parati' },
  { key: 'fuori', label: 'Fuori' },
  { key: 'stoppati', label: 'Stoppati' }
]

export const shotFacedCategories: Category[] = [
  { key: 'goals', label: 'Goal' },
  { key: 'parati', label: 'Parati' }
]

export const shotOutcomeLabels: Record<string, string> = {
  [ShotOutcome.GOAL]: 'Gol',
  [ShotOutcome.SAVED]: 'Parato',
  [ShotOutcome.MISSED]: 'Fuori',
  [ShotOutcome.BLOCKED]: 'Stoppato',
  [ShotOutcome.NULL]: 'Annullato'
};

export const shotCategoryLabels: Record<string, string> = {
  [ShotCategory.EVEN]: 'Pari',
  [ShotCategory.SUP]: 'Superiorità',
  [ShotCategory.PENALTY]: 'Rigore',
  [ShotCategory.OUTCOME]: 'Altro'
};

export const shotPositionLabels: Record<string, string> = {
  [EvenShot.P1]: 'Posizione 1',
  [EvenShot.P2]: 'Posizione 2',
  [EvenShot.P3]: 'Posizione 3',
  [EvenShot.P4]: 'Posizione 4',
  [EvenShot.P5]: 'Posizione 5',
  [EvenShot.CB]: 'Centroboa',
  [EvenShot.Rip]: 'Controfuga',
  [MenUpShot.P5]: 'Palo 5',
  [MenUpShot.P6]: 'Palo 6',
};

export const foulCategoryLabels: Record<string, string> = {
  [FoulType.EXCL ]: 'Espulsione',
  [FoulType.EDCS ]: 'EDCS',
  [FoulType.PEN ]: 'Rigore',
}

export const foulPositionLabels: Record<string, string> = {
  [FoulPosition.EXT ]: 'Perimetro',
  [FoulPosition.CB ]: 'Centroboa',
  [FoulPosition.CF ]: 'Ripartenza',
  [FoulPosition.OTHER ]: 'Altro'
}

export const edcsCategoryLabels: Record<string, string> = {
  [EDCSType.BRUTALITA ]: 'Brutalità',
  [EDCSType.GIOCO_VIOLENTO ]: 'Gioco violento',
  [EDCSType.PROTESTE ]: 'Proteste'
}