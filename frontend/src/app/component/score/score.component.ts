import {Component, Input} from '@angular/core';
import {Duel} from "../../model/duel.model";
import {NgIf} from "@angular/common";

@Component({
  selector: 'app-score',
  standalone: true,
  imports: [
    NgIf
  ],
  templateUrl: './score.component.html',
  styleUrl: './score.component.css'
})
export class ScoreComponent {
  @Input() duel?: Duel;


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

  getSummonedTotal(): number {
    return this.duel?.playerB.summonedCards.length ?? 0;
  }

  getSummonedCommon(): number {
    return this.duel?.playerB.summonedCards.filter(card => card.rarity === 'COMMON').length ?? 0;
  }

  getSummonedRare(): number {
    return this.duel?.playerB.summonedCards.filter(card => card.rarity === 'RARE').length ?? 0;
  }

  getSummonedLegendary(): number {
    return this.duel?.playerB.summonedCards.filter(card => card.rarity === 'LEGENDARY').length ?? 0;
  }

  getSacrificedTotal(): number {
    return this.duel?.playerB.sacrificedCards.length ?? 0;
  }

  getSacrificedCommon(): number {
    return this.duel?.playerB.sacrificedCards.filter(card => card.rarity === 'COMMON').length ?? 0;
  }

  getSacrificedRare(): number {
    return this.duel?.playerB.sacrificedCards.filter(card => card.rarity === 'RARE').length ?? 0;
  }

  getSacrificedLegendary(): number {
    return this.duel?.playerB.sacrificedCards.filter(card => card.rarity === 'LEGENDARY').length ?? 0;
  }


}
