import {Deck} from "./deck.model";
import {Card} from "./card.model";

export interface Player {
  id: number;
  nickname: string;
  wins: number;
  losses: number;
  score: number;
  decks: Deck[];
  cards: Card[];
}
