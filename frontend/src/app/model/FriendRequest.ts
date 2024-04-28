import {User} from "./user";

export class FriendRequest {
  constructor(
    public id: number,
    public sendUserId: number,
    public targetUserId: number,
    public requestStatus: number,
    public sendUser: User
  ){
  }
}
