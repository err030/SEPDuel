import {User} from "./user";

export class FriendRequest {
  constructor(
    public id: number,
    public schickenUserId: number,
    public zielUserId: number,
    public freundschaftanfragStatus: number,
    public schickenUser: User
  ){
  }
}
