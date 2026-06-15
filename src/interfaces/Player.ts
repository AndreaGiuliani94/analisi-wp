export interface Player {
  id?: string;
  number: number;
  name: string;
  activeTime: number;
  benchTime: number;
  actualTime: number;
  active: boolean;
  isGK: boolean;
}