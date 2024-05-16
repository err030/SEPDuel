import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import {Global} from "../global";
import {Deck} from "../model/deck.model";

@Injectable({
  providedIn: 'root'
})
export class DeckService {
  deckId: number = 0;
  private apiURL: string;
  private userId: number | undefined;




  constructor(private http: HttpClient) {
    // this.userId = Global.loggedUser.id;
    this.userId = 1;
    this.apiURL = 'http://localhost:8080/api/user/' + this.userId;

  }

  setUserId(userId: number): void {
    this.userId = userId;
    this.apiURL = 'http://localhost:8080/api/user/' + this.userId;
  }

  setDeckId(deckId: number): void {
    this.deckId = deckId;
  }

  getDecks(): Observable<any> {
    return this.http.get(this.apiURL + '/deck');
  }


  getDeck(): Observable<any> {
    return this.http.get(this.apiURL + '/deck/' + this.deckId);
  }

  createDeck(): Observable<any> {
    return this.http.get(this.apiURL + '/createDeck');
  }

  updateDeck(deck: Deck): Observable<any> {
    console.log("Service Requested");
    return this.http.post(this.apiURL + '/deck/'  + deck.id + '/updateDeck', deck);
  }

  deleteDeck(deckId: number): Observable<any> {
    return this.http.delete(this.apiURL + '/deck/' + deckId);
  }

  getAllCards(): Observable<any> {
    return this.http.get(this.apiURL + '/card');
  }


}
