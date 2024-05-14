import { Injectable } from '@angular/core';
import {Card} from "../model/card.model";
import {Global} from "../global";

@Injectable({
  providedIn: 'root'
})
export class CardService {
  selectedCards : Card[] = [];

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
}
