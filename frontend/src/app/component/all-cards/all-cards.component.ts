import { Component } from '@angular/core';
import {Global} from "../../global";
import {Card} from "../../model/card.model";
import {DeckService} from "../../service/deck.service";
import {NgForOf} from "@angular/common";

@Component({
  selector: 'app-all-cards',
  standalone: true,
  imports: [
    NgForOf
  ],
  templateUrl: './all-cards.component.html',
  styleUrl: './all-cards.component.css'
})
export class AllCardsComponent {
  cards: Card[] | undefined;


  constructor(deckService: DeckService) {
    deckService.getAllCards().subscribe(cards => {
      this.cards = cards;
    });
  }

}
