import { Tournament } from "./tournament.model";
import { User } from "./user";

export interface TournamentBet {
  id: number;
  tournament: Tournament;
  user: User;
  betOnUserId: number;
}
