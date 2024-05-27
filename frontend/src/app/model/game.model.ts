import { Card } from "./card.model"
import { Deck } from "./deck.model"
import { Player } from "./player.model";

export interface Game {
  gameId: number;
  player: Player[];
  gameFinished: boolean;
  winner: number;
  tableCard: Card[];
  playerTurn: number;
  drawCardsCounter: number;
  lastPlayerCard: Card;
}
