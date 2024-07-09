import {Component, OnInit} from '@angular/core';
import {DuelService} from "../../service/duel.service";
import {CommonModule} from '@angular/common';
import {TableModule} from 'primeng/table'
import {ChangeDetectorRef} from '@angular/core';
import {User} from '../../model/user';

@Component({
  selector: 'app-duel-history',
  templateUrl: './duel-history.component.html',
  styleUrls: ['./duel-history.component.css'],
  standalone: true,
  imports: [CommonModule, TableModule],
  providers: [DuelService]
})
export class DuelHistoryComponent implements OnInit {
  public loggedUser!: User;
  public historys: any = [];

  constructor(
    private duelService: DuelService,
    private changeDetector: ChangeDetectorRef
  ) {
  }

  ngOnInit(): void {
    const storedUser = localStorage.getItem('loggedUser');
    if (storedUser) {
      this.loggedUser = JSON.parse(storedUser);
      console.log(this.loggedUser)
    }
    if (!this.loggedUser || !this.loggedUser.id) {
      console.error('User data is not loaded or user ID is missing.');
    }
    this.getDuelHistory();
  }

  getDuelHistory(): void {
    if (this.loggedUser) {
      this.duelService.getDuelHistory(this.loggedUser.username).subscribe({
        next: (response: any) => {
          console.log(response)
          this.historys = response || []
          // this.historys = [
          //   {
          //     playerAUsername: 'QAQ',
          //     playerBUsername: 'LIJUN',
          //     winnerUsername: 'QAQ',
          //     playerABonusPoints: 50,
          //     playerBBonusPoints: -50
          //   },
          //   {
          //     playerAUsername: 'QAQ',
          //     playerBUsername: 'LIJUN',
          //     winnerUsername: 'QAQ',
          //     playerABonusPoints: 50,
          //     playerBBonusPoints: -50
          //   },
          //   {
          //     playerAUsername: 'QAQ',
          //     playerBUsername: 'LIJUN',
          //     winnerUsername: 'LIJUN',
          //     playerABonusPoints: -50,
          //     playerBBonusPoints: 50
          //   }
          // ]
        },
        error: (error: any) => {
          console.error('Failed to get user details', error);
        }
      });
    }
  }
}
