import { Component, OnInit } from '@angular/core';
import { Duel } from '../../model/duel.model';
import {DuelService} from "../../service/duel.service";
import {NgForOf, NgIf} from "@angular/common";
import {CardComponent} from "../card/card.component";
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-duel-board',
  standalone: true,
  imports: [
    NgForOf,
    CardComponent,
    NgIf
  ],
  templateUrl: './duel-board.component.html',
  styleUrl: './duel-board.component.css'
})
export class DuelBoardComponent implements OnInit {
  protected duel!: Duel;
  private duelId: number = 1;
  constructor(private duelService: DuelService, private route: ActivatedRoute) { }


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


}
