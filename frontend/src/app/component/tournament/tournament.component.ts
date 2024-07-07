import {Component, OnInit} from '@angular/core';
import { Router } from '@angular/router';
import {TournamentService} from "../../service/tournament.service";
import {UserService} from "../../service/user.service";

@Component({
  selector: 'app-tournament',
  standalone: true,
  imports: [],
  templateUrl: './tournament.component.html',
  styleUrl: './tournament.component.css'
})
export class TournamentComponent implements OnInit {

  userId: number;
  tournamentId: number;
  playerA = { id: 2, name: 'Player A' };
  playerB = { id: 3, name: 'Player B' };

  constructor(private router: Router, private tournamentService: TournamentService, private userService: UserService) {
    this.userId = 1; // 假设的当前用户ID
    this.tournamentId = 1; // 假设的竞标赛ID
  }

  ngOnInit() {
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

  goToBetResults(){
    this.router.navigate(['/bet']);
  }
}
