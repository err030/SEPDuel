import { Injectable } from '@angular/core';
import {Card} from "../model/card.model";
import {Global} from "../global";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class CardService {
  selectedCards : Card[] = [];

  constructor(private http: HttpClient) {}

  setSelectedCards(cards: Card[]): void {
    this.selectedCards = cards;
  }

  addToSelected(card: Card): void {
    this.selectedCards.push(card);
  }

  removeFromSelected(card : Card): void {
    const index = this.selectedCards.indexOf(card);
    if (index !== -1) {
      this.selectedCards.splice(index, 1);
    }
  }

  getSelectedCards() {
    return this.selectedCards;
  }

  clearSelectedCards() {
    this.selectedCards = [];
  }


  saveSelectedCards() {
    console.log("Saving selected cards");
    Global.savedCards = this.selectedCards;
  }

  getAllCards(): Observable<Card[]> {
    return this.http.get<Card[]>('http://localhost:8080/api/user/');
  }
}
