import {Card} from "./card.model";

export interface Deck{
  id: number;
  name: string;
  description: string;
  cards: Card[];
}
