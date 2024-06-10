import {User} from "./model/user";
import {Deck} from "./model/deck.model";
import {Card} from "./model/card.model";

/**
 * 保存全局变量，比如后端地址等
 */
export class Global {
  public static backendUrl: string = "http://localhost:8080";
  public static userRestServiceUrl: string = this.backendUrl + "/user";
  public static friendRestServiceUrl: string = this.backendUrl + "/friend";
  public static duelRestServiceUrl: string = this.backendUrl + "/api/duel";
  public  static duelRequestRestServiceUrl:string=this.backendUrl + "/duelRequest";
  public static chatGroupServiceUrl: string = this.backendUrl + "/chatgroup";



  public static loggedUser: User;
  public static currentDeck: Deck;
  public static savedCards: Card[];
}
