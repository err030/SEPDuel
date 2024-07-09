import { Injectable } from '@angular/core';
import {Observable} from "rxjs";
import {HttpClient, HttpResponse} from "@angular/common/http";
import {Global} from "../global";

@Injectable({
  providedIn: 'root'
})
export class RobotService {

  constructor(private http: HttpClient) { }


  createRobotRequest(currentUserId: number, deckId: number): Observable<HttpResponse<any>> {
    const url = Global.duelRequestRestServiceUrl + "/createRobotRequest/" + currentUserId + "/"  + deckId;
    return this.http.post<any>(url,null,{observe: 'response'});
  }

}
