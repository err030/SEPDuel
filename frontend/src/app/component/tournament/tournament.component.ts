import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {TournamentService} from "../../service/tournament.service";
import {UserService} from "../../service/user.service";
import {Duel} from "../../model/duel.model";
import {NgForOf} from "@angular/common";
import {DuelRequest} from "../../model/DuelRequest";

@Component({
  selector: 'app-tournament',
  standalone: true,
  imports: [
    NgForOf
  ],
  templateUrl: './tournament.component.html',
  styleUrl: './tournament.component.css'
})
export class TournamentComponent implements OnInit {

  userId: number;
  tournamentId: number = 1;
  duelRequests: DuelRequest[] = [];
  playerA = {id: 2, name: 'Player A'};
  playerB = {id: 3, name: 'Player B'};

  constructor(private router: Router, private tournamentService: TournamentService, private userService: UserService, private route: ActivatedRoute) {
    this.userId = 1; // 假设的当前用户ID
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
        this.tournamentId = params['id'];
        console.log('Tournament ID', this.tournamentId);
        this.tournamentService.getAllDuelRequests(this.tournamentId).subscribe(
          (response: any) => {
            if (response.status === 200) {
              console.log('Duels', response.body);
              this.duelRequests = response.body;
            } else {
              console.log('Not OK', response);
            }
          })
      }
    )
    this.userService.getUserByUserId(this.userId).subscribe(
      response => {
        if (response.status === 200) {
          this.userId = response.body.id;
        }
      },
      error => {
        console.error('Error fetching user information', error);
      }
    );
  }

  //
  // placeBet(playerId: number) {
  //   this.tournamentService.placeBet(this.userId, this.tournamentId, playerId).subscribe(
  //     response => {
  //       console.log('Bet placed successfully', response);
  //       alert('Bet placed successfully');
  //     },
  //     error => {
  //       console.error('Error placing bet', error);
  //       alert('Error placing bet: ' + error.error);
  //     }
  //   );
  // }

  goToBetResults() {
    this.router.navigate(['/bet']);
  }
}
