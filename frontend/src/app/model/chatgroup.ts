import {User} from "./user";

export class Chatgroup{
  constructor(
    public name: string,
    public type: string,
    public chatUserIds: string,
    public participants: User[],
    public id?: number,
    public creatorId?: number
  ) {
  }
}
