import { Clan } from "./clan";
import { User } from "./user";
import {Duel} from "./duel.model";

export interface Tournament {
  id: number;
  name: string;
  clan: Clan;
  status: 'waiting' | 'in_progress' | 'completed';
  currentRound: number;
  duels: Duel[];
  participants: User[];
  winnerId: number | null;
}
