import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import {Global} from "../global";

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
    this.apiURL = 'http://localhost:8080/api/players/' + this.userId;

  }

  setUserId(userId: number): void {
    this.userId = userId;
    this.apiURL = 'http://localhost:8080/api/players/' + this.userId;
  }

  setDeckId(deckId: number): void {
    this.deckId = deckId;
  }

  getDecks(): Observable<any> {
    return this.http.get(this.apiURL + '/decks');
  }


  getDeck(): Observable<any> {
    return this.http.get(this.apiURL + '/decks/' + this.deckId);
  }

  createDeck(): Observable<any> {
    return this.http.get(this.apiURL + '/addDeck');
  }

  updateDeck(deckId: number, deck: any): Observable<any> {
    return this.http.put(this.apiURL + '/decks/' + deckId, deck);
  }

  deleteDeck(deckId: number): Observable<any> {
    return this.http.delete(this.apiURL + '/decks/' + deckId);
  }

  getAllCards(): Observable<any> {
    return this.http.get(this.apiURL + '/cards');
  }


}
