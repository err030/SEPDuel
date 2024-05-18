//card-list.component.ts
import {Component, OnInit} from '@angular/core';
import {Card} from "../../model/card.model";
import {Deck} from "../../model/deck.model";
import {NgForOf, NgIf} from "@angular/common";
import {DeckService} from "../../service/deck.service";
import {FormsModule} from "@angular/forms";
import {Router, RouterOutlet} from "@angular/router";
import {CardComponent} from "../card/card.component";
import {Global} from "../../global";
import {CardService} from "../../service/card.service";

@Component({
  selector: 'app-card-list',
  standalone: true,
  imports: [
    NgForOf,
    FormsModule,
    RouterOutlet,
    CardComponent,
    NgIf
  ],
  templateUrl: './card-list.component.html',
  styleUrl: './card-list.component.css'
})

export class CardListComponent implements OnInit{
  deck?: Deck;
  cards?: Card[] = [];
  filteredCards?: Card[] = [];
  selectedCards?: Card[] = [];
  searchText?: string;
  cardService: CardService;
  private router: Router;

  totalCards = 30;
  cardsPerPage = 6;
  currentPage = 1;
  totalPages = Math.min(5, Math.ceil(this.totalCards / this.cardsPerPage));

  constructor(cardService: CardService, router: Router) {
    this.cardService = cardService;
    this.router = router;
  }

  getRarity(card: Card): string {
    return card.rarity;
  }

  ngOnInit(): void {
    console.log("Card List Component initialized");
    this.deck = Global.currentDeck;
    this.cards = this?.deck?.cards;
    this.filteredCards = this.cards;
    this.selectedCards = [];
    this.searchText = "";
    this.updateFilteredCards();
  }


  updateFilteredCards(): void {
    const startIndex = (this.currentPage - 1) * this.cardsPerPage;
    this.filteredCards = this.cards?.slice(startIndex, startIndex + this.cardsPerPage);
    this.checkIfLastPage();
  }

  checkIfLastPage(): void {
    if (this.filteredCards && this.filteredCards.length < this.cardsPerPage) {
      this.totalPages = this.currentPage; // 更新总页数如果当前页未填满
    }
  }
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updateFilteredCards();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updateFilteredCards();
    }
  }

  selectCard(card: Card): void {
    this.cardService.addToSelected(card);
  }

  removeCard(card: Card): void {
    this.selectedCards = this.selectedCards?.filter(c => c.id !== card.id);
  }

  search() {
    if (this.searchText && this.searchText.length > 0) {

      this.filteredCards = this.cards?.filter(card =>
        // @ts-ignore
        card.name.toLowerCase().includes(this.searchText.toLowerCase())
      );
    } else {
      alert("Please enter a search term")
    }
  }

  addCards() {
    // @ts-ignore
    // add a for loop
    // identify if repeated

    this.cardService.setSelectedCards(this.cards)
    this.router.navigate(['all-cards'])
  }

  goToDeck() {
    this.router.navigate(['deck-list'])
  }
}
