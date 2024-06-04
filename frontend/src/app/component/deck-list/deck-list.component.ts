import {Component, OnInit} from '@angular/core';
import {Router, RouterLink} from "@angular/router";
import {DeckService} from "../../service/deck.service";
import {Deck} from "../../model/deck.model";
import {NgForOf, NgIf} from "@angular/common";
import {Global} from "../../global";
import {DeckComponent} from "../deck/deck.component";
import {CardComponent} from "../card/card.component";

@Component({
  selector: 'app-deck-list',
  standalone: true,
  imports: [
    RouterLink,
    NgForOf,
    DeckComponent,
    CardComponent,
    NgIf
  ],
  templateUrl: './deck-list.component.html',
  styleUrl: './deck-list.component.css'
})

export class DeckListComponent implements OnInit {
  deck?: Deck;
  decks: Deck [] = [];
  selectedDeck?: Deck;
  private deckService: DeckService;


  constructor(deckService: DeckService, private router: Router) {
    this.deckService = deckService;


  }


  ngOnInit(): void {
    console.log("Deck List Component initialized");
    console.log("Global.loggedUser.id: ", Global.loggedUser.id);
    // @ts-ignore
    this.deckService.setUserId(Global.loggedUser.id);
    console.log("SET userid: ", this.deckService.userId);
    this.deckService.getDecks().subscribe(decks => {
        this.decks = decks;
      }, error => {
        console.log(error);
      }
    );
    // @ts-ignore
    Global.currentDeck = JSON.parse(localStorage.getItem('currentDeck'))
    console.log(Global.currentDeck);
    this.selectedDeck = Global.currentDeck;
  }

  //return id of new deck
  createDeck(): Deck {
    this.deckService.createDeck().subscribe((deck: Deck) => {
        this.deck = deck;
        Global.currentDeck = deck;
        alert('Deck created successfully, Click OK to view the deck.');

        this.router.navigate(['/card-list']);

      }, (error: any) => {
        console.log(error);
        alert("Error creating deck");
      }
    );

    return Global.currentDeck;
  }

  selectDeck(deck: Deck): void {
    this.selectedDeck = deck;
    this.deckService.setDeckId(deck.id);
    Global.currentDeck = deck;
    localStorage.setItem('currentDeck', JSON.stringify(deck));
    this.router.navigate(['card-list']);
  }

  setSelectedDeck(deck: Deck): void {
    this.selectedDeck = deck;
    this.deckService.setDeckId(deck.id);
    Global.currentDeck = deck;
    localStorage.setItem('currentDeck', JSON.stringify(deck));
    console.log(Global.currentDeck);
  }

  deleteDeck(deckId: number): void {
    this.deckService.deleteDeck(deckId).subscribe(
      deck => {
        console.log(deck);
        alert('Deck deleted successfully');
      },
      error => {
        console.log(error);
        alert('Error deleting deck');
      }
    )
    //refresh page
    window.location.reload();
  }

  renameDeck(deck: Deck) {
    const newName = prompt('Enter new name for the deck', deck.name);
    if (newName !== null) {
      deck.name = newName;
    }
    this.deckService.updateDeck(deck).subscribe(
      deck => {
        console.log(deck);
        alert('Deck name updated successfully');
      }
    )
    //refresh page
    window.location.reload();

  }

  goToHome() {
    this.router.navigate(['/homepage-user']);
  }

  protected readonly Global = Global;

  testDuel() {
    console.log("testDuel");

    this.router.navigate(['/duel']);
  }
}
