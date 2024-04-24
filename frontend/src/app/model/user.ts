//user.ts
export class User {

  constructor(
    public firstname: string,
    public lastname: string,
    public email: string,
    public password: string,
    public groupId: number,
    public id?: undefined,
    public adminInvitationCode?: undefined,
    public username?: undefined,
    public yearOfBirth?: string,
    public monthOfBirth: number | null = null,
    public dayOfBirth: number | null = null
  ) {
  }
}
