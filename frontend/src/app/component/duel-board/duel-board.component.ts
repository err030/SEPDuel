import { Component, OnInit } from '@angular/core';
import { Duel } from '../../model/duel.model';
import {DuelService} from "../../service/duel.service";
import {NgForOf, NgIf} from "@angular/common";
import {CardComponent} from "../card/card.component";
import {ActivatedRoute} from "@angular/router";
import {FormsModule} from "@angular/forms";
import {Card} from "../../model/card.model";
import {Global} from "../../global";
import {Player} from "../../model/player.model";

@Component({
  selector: 'app-duel-board',
  standalone: true,
  imports: [
    NgForOf,
    CardComponent,
    NgIf,
    FormsModule
  ],
  templateUrl: './duel-board.component.html',
  styleUrl: './duel-board.component.css'
})
export class DuelBoardComponent implements OnInit {
  protected duel!: Duel;
  private duelId: number = 1;

  constructor(protected duelService: DuelService, private route: ActivatedRoute) {
  }


  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.duelId = params['duelId'];
      try {
        this.refreshDuel()
      } catch (e) {
        // this.duelService.createDuel(this.duelId, this.duelService.sendUserDeckId, this.duelService.receivedUserDeck ).subscribe({
        //   next: (data) => {
        //     this.duelId = data.id;
        //     this.loadDuel(this.duelId);
        //   }
        // });
        console.error('Error loading duel:', e);
      }
    })
    console.log('DuelBoardComponent initialized');
    console.log(this.duel);
    console.log("Player A:", this.duel.playerA);

    console.log("Player B:", this.duel.playerB);

    console.log("Current player:", this.duel.currentPlayer)
  }

  loadDuel(duelId: number) {
    this.duelService.getDuel(duelId).subscribe({
      next: (data) => {
        this.duel = data;
        this.normalize();
        console.log('Duel loaded successfully:', data);
      },
      error: (error) => {
        console.error('Error fetching duel:', error);
      }
    });
  }

  summonCard(cardId: number) {
    const duelId = this.duel.id;
    this.duelService.summonCard(duelId, cardId).subscribe({
      next: (data) => {
        this.duel.playerB.hasSummoned = true;
        console.log('Card summoned successfully:', data);
        this.loadDuel(duelId); // 重新加载决斗状态
      },
      error: (error) => {
        console.error('Error summoning card:', error);
      }
    });
  }

  endTurn() {
    const duelId = this.duel.id;
    this.duelService.endTurn(duelId).subscribe({
      next: (data) => {
        console.log('Turn ended successfully:', data);
        this.loadDuel(duelId); // 重新加载决斗状态
      },
      error: (error) => {
        console.error('Error ending turn:', error);
      }
    });
  }

  normalize() {
    let playerC;
    if (!this.duelService.initializer) {
      playerC = this.duel.playerA;
      this.duel.playerA = this.duel.playerB;
      this.duel.playerB = playerC;
    }
  }

  refreshDuel() {
    setInterval(() => {
      this.loadDuel(this.duelId);
    }, 1000)
  }


  sacrificeCard() {
    console.log("Sacrifice card")
    if (this.duel.playerB.table.length === 0) {
      console.log("No cards to sacrifice")
      alert("There are no such cards to sacrifice")
      return;
    }
    this.duelService.sacrificing = true;
    this.duelService.sacrificeCard(this.duel.id, this.duelService.sacrificingCards.map(card => card.id)).subscribe({
      next: (data) => {
        console.log('Card sacrificed successfully:', data);
        this.duel.playerB.hasSummoned = true;
        this.loadDuel(this.duel.id); // 重新加载决斗状态
      },
      error: (error) => {
        console.error('Error sacrificing card:', error);
      }
    });
  }

  isSacrificing() {
    return this.duelService.sacrificing;
  }

  isAttacking() {
    return this.duelService.attacking;
  }

  hasAttacked(card: Card): boolean {
    return this.duelService.attackedCards.includes(card);
  }

  setAttacker(card: Card) {
    this.duelService.attacking = true;
    this.duelService.attackingCard = card;
    console.log("Attacking card:", card);

  }

  hasSummoned() {
    return this.duel.playerB.hasSummoned;
  }

  isCurrentPlayer() {
    return this.duel.currentPlayer.id === this.duel.playerB.id;
  }

  setEnemy(card: Card) {
    this.duelService.targetCard = card;
    console.log("Target card:", card);
  }

  attack() {
    this.duelService.attacking = false;
    this.duelService.attackedCards.push(<Card>this.duelService.attackingCard);
    if (!this.duelService.targetCard) {
      console.log("No target card");
      // @ts-ignore
      this.duelService.attack(this.duel.id, this.duelService.attackingCard.id, null);
      return;
    }
    //@ts-ignore
    console.log("Attacking card:", this.duelService.attackingCard.id, "Target card:", this.duelService.targetCard.id);
    //@ts-ignore
    this.duelService.attack(this.duel.id, this.duelService.attackingCard.id, this.duelService.targetCard.id);
  }


  protected readonly Global = Global;
}
