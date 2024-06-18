import { Injectable } from '@angular/core';
import {Global} from "../global";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Deck} from "../model/deck.model";
import {Card} from "../model/card.model";

@Injectable({
  providedIn: 'root'
})
export class DuelService {
  private apiUrl = Global.duelRestServiceUrl;
  public sendUserDeck: Deck | undefined;
  public receivedUserDeck: Deck | undefined;
  initializer = true;
  public sacrificing: boolean = false;
  public sacrificingCards: Card[] = [];

  constructor(private http: HttpClient) { }


  getDuel(duelId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${duelId}`);
  }

  createDuel(duelId: number, senderDeckId: number, receiverDeckId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/create/${duelId}/${senderDeckId}/${receiverDeckId}`, {observe: 'response'});
  }

  summonCard(duelId: number, cardId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${duelId}/summon/${cardId}`);
  }

  endTurn(duelId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${duelId}/next`);
  }

  sacrificeCard(duelId: number, cardId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${duelId}/sacrifice/${cardId}`);
  }


}
