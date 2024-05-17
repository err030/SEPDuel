/**
 * 保存全局变量，比如后端地址等
 */
export class Global {
  public static backendUrl: string = "http://localhost:8080";
  public static userRestServiceUrl: string = this.backendUrl + "/user";

  public static friendRestServiceUrl: string = this.backendUrl + "/friend";




}
