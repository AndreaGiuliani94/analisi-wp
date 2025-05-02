import type { Exclution } from "./Exclution";
import type { Shot } from "./Shot";

export interface Player {
  number: number;
  name: string;
  activeTime: number;
  benchTime: number;
  actualTime: number;
  active: boolean;
  exclutions: Exclution[];
  shotsEven: Shot[];
  shotsSup: Shot[];
  shotsPenalty: Shot[];
}