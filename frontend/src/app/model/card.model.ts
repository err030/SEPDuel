import {CardType} from "./cardtype.model";

export interface Card {
  id: number;
  cardType: CardType;
}
function getRarity(this: any) {
  return this.cardType.rarity === 1 ? "Rare" : this.cardType.rarity === 2 ? "Legendary" : "Common";
}
