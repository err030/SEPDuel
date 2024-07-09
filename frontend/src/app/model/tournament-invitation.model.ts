import { Tournament } from "./tournament.model";
import { User } from "./user";

export interface TournamentInvitation {
  id: number;
  tournament: Tournament;
  user: User;
  accepted: boolean;
}
