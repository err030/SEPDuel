import { Injectable } from '@angular/core';
import {Observable} from "rxjs";
import {HttpClient, HttpResponse} from "@angular/common/http";
import {Global} from "../global";

@Injectable({
  providedIn: 'root'
})
export class RobotService {

  constructor(private http: HttpClient) { }

  createRobotDuel(duelId: number, userId: number | undefined, deck1Id: number): Observable<any>{
    const url = Global.duelRestServiceUrl + "/createRobotDuel/" + duelId +"/" +userId +"/" +deck1Id;
    return this.http.post(url, {},{observe: 'response'});
  }
  createRobotRequest(currentUserId: number, deckId: number): Observable<HttpResponse<any>> {
    const url = Global.duelRequestRestServiceUrl + "/createRobotRequest/" + currentUserId + "/"  + deckId;
    return this.http.post<any>(url,null,{observe: 'response'});
  }

}
