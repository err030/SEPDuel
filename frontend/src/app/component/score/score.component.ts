import {Component, Input} from '@angular/core';
import {Duel} from "../../model/duel.model";

@Component({
  selector: 'app-score',
  standalone: true,
  imports: [],
  templateUrl: './score.component.html',
  styleUrl: './score.component.css'
})
export class ScoreComponent {
  @Input() duel?: Duel;

  summonedTotal = this.duel?.playerB.summonedCards.length;

  summonedCommon = this.duel?.playerB.summonedCards.filter(card => card.rarity === 'COMMON').length;

  summonedRare = this.duel?.playerB.summonedCards.filter(card => card.rarity === 'RARE').length;

  summonedLegendary = this.duel?.playerB.summonedCards.filter(card => card.rarity === 'LEGENDARY').length;

  sacrificedTotal = this.duel?.playerA.sacrificedCards.length;

  sacrificedCommon = this.duel?.playerA.sacrificedCards.filter(card => card.rarity === 'COMMON').length;

  sacrificedRare = this.duel?.playerA.sacrificedCards.filter(card => card.rarity === 'RARE').length;

  sacrificedLegendary = this.duel?.playerA.sacrificedCards.filter(card => card.rarity === 'LEGENDARY').length;

  isWinner(){
    return this.duel?.winnerId === this.duel?.playerB.id;
  }

  getBonusPoints(){
    let userPoints = Number(localStorage.getItem('userPoints'));
    let opponentPoints = Number(localStorage.getItem('opponentPoints'));
    if (this.isWinner()) {
      return +Math.max(opponentPoints - userPoints, 50);
    } else {
      return -Math.max((opponentPoints - userPoints) / 2, 50);
    }
  }


}
