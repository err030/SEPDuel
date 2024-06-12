import {Card} from "./card.model";

export interface Lootbox{
  id: number
  lootboxType: string
  price: number
  cards: Card[]
  purchased: boolean
}
