import {Component, OnInit} from '@angular/core';
import {Router, RouterLink} from "@angular/router";
import {DeckService} from "../../service/deck.service";
import {Deck} from "../../model/deck.model";
import {Card} from "../../model/card.model";
import {NgForOf} from "@angular/common";
import {Observable} from "rxjs";

@Component({
  selector: 'app-deck-list',
  standalone: true,
  imports: [
    RouterLink,
    NgForOf
  ],
  templateUrl: './deck-list.component.html',
  styleUrl: './deck-list.component.css'
})

export class DeckListComponent implements OnInit{
  deckId: number = 1;
  decks: Deck [] = [];
  selectedDeck: Deck | undefined;
  private deckService: any;
  private router: any;


  constructor(deckService:DeckService) {
    this.deckService = deckService;
    deckService.getDecks().subscribe(decks => {
        this.decks = decks;
      }, error => {
        console.log(error);
      }
    );

  }


  ngOnInit(): void {
    console.log("Deck List Component initialized");
  }

  //return id of new deck
  createDeck(): number {
    let deckId: number = -1;
    this.deckService.createDeck().subscribe((deck : Deck) => {
        this.deckId = deck.id;
        alert('Deck created successfully, opening in 3 seconds...');

        setTimeout(() => {
          this.router.navigate(['card-list', deckId]);
        }, 3000);
      }, (error: any) => {
        console.log(error);
        alert("Error creating deck");
      }
    );

    return deckId;
  }

  selectDeck(deck: Deck): void {
    this.selectedDeck = deck;
    this.deckService.setDeckId(deck.id);
    this.router.navigate(['card-list']);
  }

  removeDeck(deckId: number): void {
    this.deckService.deleteDeck();
  }
}
