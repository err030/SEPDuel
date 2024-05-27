import {Component, OnInit} from '@angular/core';
import {RouterOutlet} from "@angular/router";
import {UserService} from "../../service/user.service";
import {User} from "../../model/user";
import {NgForOf} from "@angular/common";

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [
    NgForOf
  ],
  templateUrl: './leaderboard.component.html',
  styleUrl: './leaderboard.component.css'
})
export class LeaderboardComponent implements OnInit{
  leaderboard: User[] = [];

  constructor(private userService: UserService, private router: RouterOutlet) { }

  ngOnInit(): void {
    this.userService.getLeaderboard().subscribe(response => {
      if (response.status === 200) {
        this.leaderboard = response.body || [];
      }
    });
  }
}
