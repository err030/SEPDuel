import { Injectable } from '@angular/core';
import {Global} from "../global";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class DuelService {
  private apiUrl = Global.duelRestServiceUrl;


  constructor(private http: HttpClient) { }

  getDuel(duelId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${duelId}`);
  }

  createDuel(player1Id: number, player2Id: number, deck1Id: number, deck2Id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/create/${player1Id}/${player2Id}/${deck1Id}/${deck2Id}`);
  }

  summonCard(duelId: number, cardId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${duelId}/summon/${cardId}`);
  }

  endTurn(duelId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${duelId}/next`);
  }


}
