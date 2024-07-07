import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import { Duel } from '../../model/duel.model';
import {DuelService} from "../../service/duel.service";
import {NgForOf, NgIf, NgOptimizedImage} from "@angular/common";
import {CardComponent} from "../card/card.component";
import {ActivatedRoute, Router} from "@angular/router";
import {FormsModule} from "@angular/forms";
import {Card} from "../../model/card.model";
import {DuelCardComponent} from "../duel-card/duel-card.component";
import {ScoreComponent} from "../score/score.component";

@Component({
  selector: 'app-duel-board',
  standalone: true,
  imports: [
    NgForOf,
    CardComponent,
    NgIf,
    FormsModule,
    DuelCardComponent,
    NgOptimizedImage,
    ScoreComponent
  ],
  templateUrl: './duel-board.component.html',
  styleUrl: './duel-board.component.css',
})
export class DuelBoardComponent implements OnInit {
  protected duel!: Duel;
  private duelId: number = 1;

  constructor(protected duelService: DuelService, private route: ActivatedRoute, private router: Router) {
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
        if (data.id){
          this.duel = data;
          console.log('Duel loaded successfully:', data);
        }
        this.normalize();
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
    this.duelService.attackedCardsId = [];
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
    if (this.isSpectating()) return;
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
    this.duelService.sacrificing = false;
    this.duelService.sacrificeCard(this.duel.id, this.duelService.sacrificingCardsId).subscribe({
      next: (data) => {
        console.log('Bonus card:', data);
        this.loadDuel(this.duel.id); // 重新加载决斗状态
      },
      error: (error) => {
        console.error('Error sacrificing card:', error);
      }
    });
  }

  isAttacking() {
    return this.duelService.attacking;
  }

  canAttack(card: Card): boolean {
    return !this.isSpectating() && this.isCurrentPlayer() && !this.duelService.attackedCardsId.includes(card.id) && !this.duelService.sacrificing;
  }

  setAttacker(card: Card) {
    this.duelService.attacking = true;
    this.duelService.attackingCard = card;
    console.log("Attacking card:", card);

  }

  isCurrentPlayer() {
    return this.duel.currentPlayer.id === this.duel.playerB.id;
  }

  setEnemy(card: Card) {
    this.duelService.targetCard = card;
    console.log("Target card:", card);
  }

  attack() {
    if (!this.duelService.targetCard) {
      console.log("No target card");
      // @ts-ignore
      this.duelService.attack(this.duel.id, this.duelService.attackingCard.id, null).subscribe(
        next => {
          this.loadDuel(this.duel.id)
          console.log('Duel after attack:', next);
        }
      );
      return;
    }
    //@ts-ignore
    console.log("Attacking card:", this.duelService.attackingCard.id, "Target card:", this.duelService.targetCard.id);
    //@ts-ignore
    this.duelService.attack(this.duel.id, this.duelService.attackingCard.id, this.duelService.targetCard.id).subscribe(
      next => {
        this.loadDuel(this.duel.id)
        console.log('Duel after attack:', next);
      }
    );
  }

  canSacrifice() {
    return this.isCurrentPlayer() && !this.duel.playerB.hasSummoned && this.duel.playerB.table.length >= 2 && this.duelService.sacrificing && this.duel.playerB.hand.some(card => card.rarity !== "COMMON");
  }

  canToggleSacrifice() {
    return !this.isSpectating() && this.isCurrentPlayer() && !this.duel.playerB.hasSummoned && this.duel.playerB.table.length >= 2 && this.duel.playerB.hand.some(card => card.rarity !== "COMMON");

  }

  canSummon() {
    return !this.isSpectating() && this.isCurrentPlayer() && !this.duel.playerB.hasSummoned && this.duel.playerB.table.length < 5 && !this.duelService.sacrificing
  }


  toggleSacrifice() {
    this.duelService.sacrificing = !this.duelService.sacrificing;
    console.log("Sacrificing:", this.duelService.sacrificing);
  }

  exitGame() {
    this.duelService.exitGame(this.duel.id).subscribe({
      next: (data) => {
        console.log('Game exited successfully:', data);
        this.router.navigate(['/game-over']);
      },
      error: (error) => {
        console.error('Error exiting game:', error);
        this.router.navigate(['/game-over']);
      }
    });
  }

  goToHomepage() {
    this.router.navigate(['/']);
  }

  isSpectating() {
    return localStorage.getItem('initializer') === '2';
  }

  toggleVisibility() {
      this.duelService.setVisibility(this.duel.id, !this.duel.visibility).subscribe({
        next: (data) => {
          this.loadDuel(this.duel.id);
        }
      });
  }

  getOpponentAvatar() {
    if (this.duel && this.duel.playerA && this.duel.playerA.avatarUrl) {
      return "http://localhost:8080" + this.duel.playerA.avatarUrl;
    }
    return "http://localhost:8080/avatars/user.png";
  }

  getPlayerAvatar() {
    if (this.duel && this.duel.playerB && this.duel.playerB.avatarUrl) {
      return "http://localhost:8080" + this.duel.playerB.avatarUrl;
    }
    return "http://localhost:8080/avatars/user.png";
  }


  protected readonly Math = Math;
}
