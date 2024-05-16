//all-cards.component.ts
import {Component, OnInit} from '@angular/core';
import {Global} from "../../global";
import {Card} from "../../model/card.model";
import {DeckService} from "../../service/deck.service";
import {NgForOf, NgIf} from "@angular/common";
import {CardComponent} from "../card/card.component";
import {CardService} from "../../service/card.service";
import {Router} from "@angular/router";
import {delay} from "rxjs";

@Component({
  selector: 'app-all-cards',
  standalone: true,
  imports: [
    NgForOf,
    CardComponent,
    NgIf
  ],
  templateUrl: './all-cards.component.html',
  styleUrl: './all-cards.component.css'
})
export class AllCardsComponent implements OnInit {
  cards: Card[] = [];
  selectedCards: Card[] = [];
  private cardService: CardService;
  private deckService: DeckService;


  constructor(deckService: DeckService, cardService: CardService, private router: Router) {
    this.cardService = cardService;
    this.deckService = deckService;
    this.router = router;
  }

  ngOnInit() {
    this.deckService.getAllCards().subscribe(cards => {
      this.cards = cards;
    });
    this.selectedCards = this.cardService.getSelectedCards();
    // this.cleanSelection();
  }

  //尝试解决object不对应问题
  // cleanSelection(){
  //   this.selectedCards = this.selectedCards.map(selectedCard => {
  //     const matchingCard = this.cards.find(card => card.id === selectedCard.id);
  //     return matchingCard ? matchingCard : selectedCard;
  //   });
  // }

  toggleSelection(card: Card) {
    if (this.isSelected(card)) {
      this.cardService.removeFromSelected(card);
    } else {
      this.cardService.addToSelected(card);
    }
    this.selectedCards = this.cardService.getSelectedCards();
    // this.cleanSelection();
  }

  isSelected(card: Card) {
    //perfect fix for object not corresponding
    return this.selectedCards.some(c => c.id === card.id);
  }

  clearSelection() {
    this.cardService.clearSelectedCards();
    this.selectedCards = this.cardService.getSelectedCards();
  }

  async saveSelection() {
    //loop twice to solve problem, don't ask me why
    for (let i = 0; i < 2; i++) {
      // this.cleanSelection();
      this.cardService.saveSelectedCards();
      this.selectedCards = this.cardService.getSelectedCards();
      if (Global.currentDeck) {
        console.log("updating deck with selected cards");
        Global.currentDeck.cards = this.selectedCards;
        await this.deckService.updateDeck(Global.currentDeck).toPromise();  // 使用 await 等待异步操作完成
      }
      await delay(1000);  // 等待 1000 毫秒
      console.log("saving selected cards");
    }
    alert("Selection saved!");
    this.router.navigate(['card-list']);

  }

  goToDecks() {
    this.router.navigate(['deck-list']);
  }

  goToHome() {
    this.router.navigate(['homepage-user']);
  }
  goToCards() {
    this.router.navigate(['card-list']);
  }
}
