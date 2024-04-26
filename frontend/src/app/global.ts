/**
 * 保存全局变量，比如后端地址等
 */
export class Global {
  public static backendUrl: string = "http://localhost:8080";
  public static userRestServiceUrl: string = this.backendUrl + "/user";
  public static firstnameNewbornRestServiceUrl: string = this.backendUrl + "/firstnamenewborn";
  public static jobseekerRestServiceUrl: string = this.backendUrl + "/jobseeker";
  public static unemployedRestServiceUrl: string = this.backendUrl + "/unemployed";
  public static populationRestServiceUrl: string = this.backendUrl + "/population";
  public static householdRestServiceUrl: string = this.backendUrl + "/household";
  public static streetRestServiceUrl: string = this.backendUrl + "/street";
  public static deathRestServiceUrl: string = this.backendUrl + "/death";
  public static birthRestServiceUrl: string = this.backendUrl + "/birth";
  public static favouriteRestServiceUrl: string = this.backendUrl + "/favourite";
  public static friendRestServiceUrl: string = this.backendUrl + "/friend";
  public static themaRestServiceUrl: string=this.backendUrl+"/thema";
  public static heartRestServiceUrl:string=this.backendUrl+"/heart";
  public static commentRestServiceUrl:string=this.backendUrl+"/comment";


  public static databaseFirstnameNewbornId: number = 1;
  public static databaseJobseekerId: number = 2;
  public static databaseUnemployedId: number = 3;
  public static databasePopulationId: number = 4;
  public static databaseHouseholdId: number = 5;
  public static databaseStreetId: number = 6;
  public static databaseDeathId: number = 7;
  public static databaseBirthId: number = 8;
}
