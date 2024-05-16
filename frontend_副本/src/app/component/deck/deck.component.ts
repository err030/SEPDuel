import {Component, Input} from '@angular/core';
import {Deck} from "../../model/deck.model";

@Component({
  selector: 'app-deck',
  standalone: true,
  imports: [],
  templateUrl: './deck.component.html',
  styleUrl: './deck.component.css'
})
export class DeckComponent {
  @Input() deck?: Deck;

}
