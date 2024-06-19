//all-cards.component.ts
import {Component, OnInit} from '@angular/core';
import {Global} from "../../global";
import {Card} from "../../model/card.model";
import {DeckService} from "../../service/deck.service";
import {NgClass, NgForOf, NgIf} from "@angular/common";
import {CardComponent} from "../card/card.component";
import {CardService} from "../../service/card.service";
import {Router} from "@angular/router";
import {delay} from "rxjs";
import {Deck} from "../../model/deck.model";
import {DuelCardComponent} from "../duel-card/duel-card.component";

@Component({
  selector: 'app-all-cards',
  standalone: true,
  imports: [
    NgForOf,
    CardComponent,
    NgIf,
    NgClass,
    DuelCardComponent,
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
    this.deckService.getDecks().subscribe(decks => {
      let otherDecks = decks.filter((deck : Deck) => deck.id !== Global.currentDeck.id);
      let otherCards: Card[] = [];

      // 收集非当前Deck的所有卡片
      otherDecks.forEach((deck:Deck) => {
        otherCards.push(...deck.cards);
      });

      // 获取所有卡片，并过滤掉在otherCards中的卡片
      this.deckService.getAllCards().subscribe(allCards => {
        this.cards = allCards.filter((card:Card) => !otherCards.some(otherCard => otherCard.id === card.id));
      });
    });

    this.selectedCards = this.cardService.getSelectedCards();
    // this.cleanSelection(); // 如果需要的话，可以取消注释这行代码
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
        try {
          await this.deckService.updateDeck(Global.currentDeck).toPromise();
        } catch (error : any) {
          console.error("Error updating deck:", error);
          alert("Cards could not be saved. They could be already added in another deck.");
          return;  // 退出循环，避免重复执行
        }
      }
      }
      await delay(1000);  // 等待 1000 毫秒
      console.log("saving selected cards");

    alert("Selection saved!");
    this.router.navigate(['card-list']);

  }

  goToCards() {
    this.router.navigate(['card-list']);
  }
}
