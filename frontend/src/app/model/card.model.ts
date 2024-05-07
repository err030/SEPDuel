import {CardType} from "./cardtype.model";

export interface Card {
  id: number;
  name: string;
  description: string;
  cost: number;
  attack: number;
  defense: number;
  image: string;
  rarity: string;
}
