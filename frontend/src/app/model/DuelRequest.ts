import {User} from "./user";

export class DuelRequest {
  constructor(
    public id: number,
    public sendUserId: number,
    public receivedUserId: number,
    public duellanfragStatus: number,
    public sendUser: User,
    public receivedUser: User
  ){
  }
}
