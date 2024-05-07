//user.ts
export class User {

  constructor(
    public firstname: string,
    public lastname: string,
    public username: string,
    public email: string,
    public password: string,
    public groupId: number,
    public id?: number,
    public adminInvitationCode?: string,
    public birthday?: Date | null,
    public avatarUrl?: string,
    public sepCoins?: number,
    public leaderboardPoints?: number
  ) {
  }
}
