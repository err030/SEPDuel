import { Injectable } from '@angular/core';
import {Global} from "../global";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Deck} from "../model/deck.model";
import {Card} from "../model/card.model";
import {Player} from "../model/player.model";

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
  public attacking: boolean = false;
  public attackingCard?: Card;
  public attackedCards: Card[] = [];
  public targetCard?: Card;

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
    this.attacking = false;
    this.attackingCard = undefined;
    this.attackedCards = [];
    this.targetCard = undefined;
    this.sacrificing = false;
    this.sacrificingCards = [];
    return this.http.get(`${this.apiUrl}/${duelId}/next`);
  }

  sacrificeCard(duelId: number, cardIds: number[]): Observable<any> {
    if (cardIds.length < 2 || cardIds.length > 3) {
      console.error('Invalid number of cards to sacrifice');
      // @ts-ignore
      return;
    }

    const cardIdsParam = cardIds.join(',');
    const url = `${this.apiUrl}/${duelId}/sacrifice?cardIds=${cardIdsParam}`;
    this.sacrificing = false;
    return this.http.get(url);
  }

  attack(duelId: number, attackerId: number, defenderId?: number): Observable<any> {
    let url = `${this.apiUrl}/${duelId}/attack/${attackerId}`;
    if (defenderId) {
      url += `/${defenderId}`;
    }
    return this.http.get(url);
  }

  setTargetCard(card?: Card): void {
    this.targetCard = card;
  }


}
