import { Injectable } from '@angular/core';
import {DuelRequest} from "../model/DuelRequest";
import {Observable, Subject} from "rxjs";
import {HttpClient, HttpResponse} from "@angular/common/http";
import {Global} from "../global";
import {User} from "../model/user";
import {FriendRequest} from "../model/FriendRequest";

@Injectable({
  providedIn: 'root'
})
export class LeaderboardService {
  selectedUser: User | null = null;
  constructor(private http: HttpClient) {



  }

  sendDuelRequest(currentUserId: number, targetUserId: number ): Observable<HttpResponse<any>> {
    const url = Global.duelRequestRestServiceUrl + "/sendDuelRequest/" + currentUserId + "/" + targetUserId;
    return this.http.post<any>(url, {sendUserDeck:Global.currentDeck}, {observe: 'response'});
  }

  getDuelRequests(currentUserId: number): Observable<HttpResponse<DuelRequest[]>>{
    const url = Global.duelRequestRestServiceUrl + "/getDuelRequests/" + currentUserId;
    return this.http.get<DuelRequest[]>(url, {observe: 'response'});
  }

  acceptOrDenyDuelRequest(duelRequest: DuelRequest): Observable<HttpResponse<any>>{
       const url = Global.duelRequestRestServiceUrl + "/updateDuelRequest";
       return this.http.put<any>(url, duelRequest, {observe: 'response'});
  }

}
