import { Card } from "./card.model"
import { Deck } from "./deck.model"
import { Player } from "./player.model";

export interface Duel {
  gameId: number;
  player: Player[];
  gameFinished: boolean;
  winnerId: number;
  tableCard: Card[];
  playerTurn: number;
  drawCardsCounter: number;
  lastPlayerCard: Card;
}
