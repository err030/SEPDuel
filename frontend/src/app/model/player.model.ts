import {Deck} from "./deck.model";
import {Card} from "./card.model";

export interface Player {
  id: number;
  deck: Card[];
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  handSize: number;
  deckSize: number;
  hand: Card[];
  discardPile: Card[];
  isDead: boolean;
}
