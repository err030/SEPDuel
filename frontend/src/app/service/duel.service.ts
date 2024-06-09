import { Injectable } from '@angular/core';
import {Global} from "../global";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Deck} from "../model/deck.model";

@Injectable({
  providedIn: 'root'
})
export class DuelService {
  private apiUrl = Global.duelRestServiceUrl;
  public sendUserDeck: Deck | undefined;
  public receivedUserDeck: Deck | undefined;


  constructor(private http: HttpClient) { }


  getDuel(duelId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${duelId}`);
  }

  createDuel(duelId: number, senderDeck: Deck | undefined, receiverDeck: Deck | undefined): Observable<any> {
    return this.http.post(`${this.apiUrl}/create/${duelId}/`, {sendUserDeck: senderDeck,receivedUserDeck: receiverDeck}, {observe: 'response'});
  }

  summonCard(duelId: number, cardId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${duelId}/summon/${cardId}`);
  }

  endTurn(duelId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${duelId}/next`);
  }


}
