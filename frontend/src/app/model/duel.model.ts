import { Card } from "./card.model"
import { Deck } from "./deck.model"
import { Player } from "./player.model";

export interface Duel {
  id: number;
  playerA: Player;
  playerB: Player;
  currentPlayer: Player;
  gameFinished: boolean;
  winnerId: number;
  playerTurn: number;
  lastPlayerCard: Card;
  remainingTime: number;
  visibility: boolean;
}
