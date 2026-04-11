import type { Exclution } from "./Exclution";
import type { ShotFaced } from "./ShotFaced";
import type { Shot } from "./Shot";

export interface Player {
  id?: string;
  number: number;
  name: string;
  activeTime: number;
  benchTime: number;
  actualTime: number;
  active: boolean;
  isGK: boolean;
  exclutions: Exclution[];
  shotsEven: Shot[];
  shotsSup: Shot[];
  shotsPenalty: Shot[];
  shotsFaced: ShotFaced[];
}