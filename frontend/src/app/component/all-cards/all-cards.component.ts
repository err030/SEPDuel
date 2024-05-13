import { Component } from '@angular/core';
import {Global} from "../../global";
import {Card} from "../../model/card.model";
import {DeckService} from "../../service/deck.service";
import {NgForOf, NgIf} from "@angular/common";
import {CardComponent} from "../card/card.component";
import {CardService} from "../../service/card.service";

@Component({
  selector: 'app-all-cards',
  standalone: true,
  imports: [
    NgForOf,
    CardComponent,
    NgIf,
  ],
  templateUrl: './all-cards.component.html',
  styleUrl: './all-cards.component.css'
})
export class AllCardsComponent {
  cards?: Card[];
  selectedCards: Card[] = [];
  private cardService: CardService;
  private deckService: DeckService;


  constructor(deckService: DeckService, cardService: CardService) {
    deckService.getAllCards().subscribe(cards => {
      this.cards = cards;
    });
    this.cardService = cardService;
    this.deckService = deckService;
    this.selectedCards = this.cardService.getSelectedCards();
  }

  toggleSelection(card: Card) {
    if (this.isSelected(card)) {
      this.cardService.removeFromSelected(card);
    } else {
      this.cardService.addToSelected(card);
    }
    this.selectedCards = this.cardService.getSelectedCards();
  }

  isSelected(card: Card) {
    return this.selectedCards.includes(card);
  }

  clearSelection() {
    this.cardService.clearSelectedCards();
    this.selectedCards = this.cardService.getSelectedCards();
  }

  saveSelection() {
    this.cardService.saveSelectedCards();
    this.selectedCards = this.cardService.getSelectedCards();
    if (Global.currentDeck){
      console.log("updating deck with selected cards");
      Global.currentDeck.cards = this.selectedCards;
      this.deckService.updateDeck(Global.currentDeck).subscribe({
        next: (response: Response) => {
          console.log('here')
        }
      })
    }

  }

  protected readonly Global = Global;
}
