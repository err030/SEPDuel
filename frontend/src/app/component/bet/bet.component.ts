import { Component, OnInit } from '@angular/core';
import { TournamentService } from '../../service/tournament.service';
import { UserService } from '../../service/user.service';
import {NgIf} from "@angular/common";

@Component({
  selector: 'app-bet',
  standalone: true,
  imports: [
    NgIf
  ],
  templateUrl: './bet.component.html',
  styleUrls: ['./bet.component.css']
})
export class BetComponent implements OnInit {
  userId: number;
  tournamentId: number; // 假设我们有一个固定的竞标赛ID
  betResult: string = '';
  sepCoins: number | undefined;
  tournament: string | undefined;
  result: string | undefined;
  goldLootbox: number | undefined;

  constructor(private tournamentService: TournamentService, private userService: UserService) {
    this.userId = 1; // 假设的用户ID，实际应该从身份验证服务中获取
    this.tournamentId = 1; // 假设的竞标赛ID，实际应该从路由或其他地方获取
  }

  ngOnInit() {
    this.userService.getUserByUserId(this.userId).subscribe(
        response => {
          if (response.status === 200) {
            this.userId = response.body.id; // 从响应中获取用户ID
            this.sepCoins = response.body.sepCoins;
            this.getBetResult();
          }
        },
        error => {
          console.error('Error fetching user information', error);
        }
    );
  }

  getBetResult() {
    this.tournamentService.getBetResult(this.userId, this.tournamentId).subscribe(
        response => {
          this.betResult = response;

          // 解析响应以获取详细信息
          if (response.includes('You won')) {
            this.result = 'win';
            // @ts-ignore
            this.sepCoins += 50;
            this.goldLootbox = 1; // 假设每次赢得一个金色卡包
          } else if (response.includes('You lost')) {
            this.result = 'lose';
            this.goldLootbox = 0;
          } else {
            this.result = 'N/A';
          }
        },
        error => {
          console.error('Error fetching bet result', error);
        }
    );
  }
}
