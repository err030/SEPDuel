import { Clan } from "./clan";
import { User } from "./user";

export interface Tournament {
  id: number;
  name: string;
  clan: Clan;
  status: 'waiting' | 'in_progress' | 'completed';
  currentRound: number;
  participants: User[];
  winnerId: number | null;
}
