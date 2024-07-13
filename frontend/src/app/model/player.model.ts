import {Deck} from "./deck.model";
import {Card} from "./card.model";

export interface Player {
  id: number;
  name: string;
  hp: number;
  hasSummoned: boolean;
  isRobot: boolean;
  deck: Deck;
  hand: Card[];
  table: Card[];
  avatarUrl: string;
  summonedCards: Card[];
  sacrificedCards: Card[];
  damageDealt: number;
}
