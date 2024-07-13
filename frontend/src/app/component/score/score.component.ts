import {Component, Input} from '@angular/core';
import {Duel} from "../../model/duel.model";
import {NgIf} from "@angular/common";
import {DuelHistory} from "../../model/duel-history.model";
import {HttpClient} from "@angular/common/http";
import {Card} from "../../model/card.model";
import {Observable} from "rxjs";

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

  constructor(private http: HttpClient) {}


  isWinner(){
    return this.duel?.winnerId === this.duel?.playerB.id;
  }

  getBonusPoints(): number {
    let userPoints = Number(localStorage.getItem('userPoints'));
    let opponentPoints = Number(localStorage.getItem('opponentPoints'));
    if (this.isWinner()) {
      return +Math.max(opponentPoints - userPoints, 50);
    } else {
      return -Math.max((opponentPoints - userPoints) / 2, 50);
    }
    // let url = `/api/duel-history/${this.duel?.playerB.name}`
    // this.http.get<DuelHistory[]>(url).subscribe(
    //   (duelHistory: DuelHistory[]) => {
    //     return duelHistory.reverse()[0].playerBBonusPoints;
    //   }
    // )
    // return 0;
  }

  getDamageDealt(){
    return this.duel?.playerB?.damageDealt;
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
