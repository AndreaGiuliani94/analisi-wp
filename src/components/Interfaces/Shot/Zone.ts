import { EvenShot, MenUpShot } from "@/enum/ShotDescription"

interface Zone {
  label: string
  values: (EvenShot | string)[]
}

export const evenZones: Zone[] = [
  { label: 'Dx', values: [EvenShot.P1, EvenShot.P2] },
  { label: 'Sx', values: [EvenShot.P4, EvenShot.P5] },
  { label: 'Centrale', values: [EvenShot.P3] },
  { label: 'Centroboa', values: [EvenShot.CB] },
  { label: 'Ripartenze', values: [EvenShot.Rip] }
]

export const supZones: Zone[] = [
  { label: 'Dx', values: [MenUpShot.P1, MenUpShot.P2] },
  { label: 'Sx', values: [MenUpShot.P3, MenUpShot.P4] },
  { label: 'Pali', values: [MenUpShot.P5, MenUpShot.P6] },
  { label: 'Ripartenze', values: [MenUpShot.Rip] }
]