import {User} from "./user";

export class Clan {
  public name: string
  public id: number
  public users: User[]

  constructor() {
    this.name= "";
    this.id = 0;
    this.users = [];
  }
}
