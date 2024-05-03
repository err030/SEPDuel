import {Component, OnInit} from '@angular/core';
import {Card} from "../../model/card.model";
import {Deck} from "../../model/deck.model";
import {NgForOf} from "@angular/common";
import {DeckService} from "../../service/deck.service";
import {FormsModule} from "@angular/forms";
import {RouterOutlet} from "@angular/router";

@Component({
  selector: 'app-card-list',
  standalone: true,
  imports: [
    NgForOf,
    FormsModule,
    RouterOutlet
  ],
  templateUrl: './card-list.component.html',
  styleUrl: './card-list.component.css'
})

export class CardListComponent implements OnInit{
  deck: Deck | undefined;
  cards: Card[] | undefined;
  filteredCards: Card[] | undefined;
  selectedCards: Card[];
  searchText: string;


  constructor(deckService:DeckService) {
    deckService.getDeck().subscribe(deck => {
      this.deck = deck;
    }, error => {
      console.log(error);
      }
    );
    this.cards = this.deck?.cards;
    this.filteredCards = this.cards;
    this.selectedCards = [];
    this.searchText = "";
  }

  getRarity(card: Card): string {
    return card.cardType.rarity === 1 ? "Rare" : card.cardType.rarity === 2 ? "Legendary" : "Common";
  }

  ngOnInit(): void {
    console.log("Card List Component initialized");
  }

  selectCard(card: Card): void {
    this.selectedCards.push(card);
  }

  removeCard(card: Card): void {
    this.selectedCards = this.selectedCards.filter(c => c.id !== card.id);
  }

  search() {
    this.filteredCards = this.cards?.filter(card => card.cardType.name.toLowerCase().includes(this.searchText.toLowerCase()));
  }
}
