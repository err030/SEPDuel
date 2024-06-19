import {Component, Input} from '@angular/core';
import {Card} from "../../model/card.model";
import {Global} from "../../global";
import {NgClass} from "@angular/common";

@Component({
  selector: 'app-duel-card',
  standalone: true,
  imports: [
    NgClass
  ],
  templateUrl: './duel-card.component.html',
  styleUrl: './duel-card.component.css'
})
export class DuelCardComponent {
  @Input() card?: Card;
  protected readonly Global = Global;
}
