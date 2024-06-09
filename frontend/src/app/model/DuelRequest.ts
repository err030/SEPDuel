import {User} from "./user";
import {Deck} from "./deck.model";

export class DuelRequest {
  constructor(
    public id: number,
    public sendUserId: number,
    public receivedUserId: number,
    public duellanfragStatus: number,
    public sendUser: User,
    public receivedUser: User,
    public sendUserDeck: Deck,
    public receivedUserDeck: Deck
  ){
  }
}
