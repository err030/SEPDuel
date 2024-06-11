import {Component, Input} from '@angular/core';
import {Card} from "../../model/card.model";
import {NgIf} from "@angular/common";
import {Global} from "../../global";


@Component({
  selector: 'app-card-display',
  standalone: true,
  imports: [
    NgIf
  ],
  templateUrl: './card-display.component.html',
  styleUrl: './card-display.component.css'
})
export class CardDisplayComponent {
  @Input() card?: Card;
  protected readonly Global = Global;
}
