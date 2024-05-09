import {User} from './user';

export class friend {
  constructor(
    public user : User,
    public friendRequestStatus : number | null,
    public alreadyFriend : boolean
  ) {
  }

}
