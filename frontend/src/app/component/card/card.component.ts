import {Component, Input} from '@angular/core';
import {Card} from "../../model/card.model";

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [],
  templateUrl: './card.component.html',
  styleUrl: './card.component.css'
})
export class CardComponent {
  @Input() card?: Card;

}
