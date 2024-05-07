// profile.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from "../../service/user.service";
import { Global } from "../../global";
import {CommonModule} from '@angular/common';


@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  standalone: true,
  imports:[CommonModule],
  providers: [UserService]
})
export class ProfileComponent implements OnInit {
  public loggedUser: any;
  public sepCoins: number | undefined;
  public leaderboardPoints: number | undefined;

  constructor(
    private router: Router,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.loggedUser = Global.loggedUser;
    this.getUserDetails();
  }

  getUserDetails(): void {
    const token = localStorage.getItem('token'); // 从 localStorage 中获取 token
    if (token) {
      this.userService.getUserByToken(token).subscribe(
        (response) => {
          const user = response.body; // 从响应中获取用户信息
          if (user) {
            this.sepCoins = user.sepCoins;
            this.leaderboardPoints = user.leaderboardPoints;
          }
        },
        (error) => {
          console.error('Failed to get user details:', error);
        }
      );
    }
  }

  goToHomePage(): void {
    if (this.loggedUser.groupId == 1) {
      this.router.navigateByUrl('/homepage-user');
    } else if (this.loggedUser.groupId == 2) {
      this.router.navigateByUrl('/homepage-admin');
    }
  }

  changePassword(): void {
    this.router.navigateByUrl('/reset-password');
  }
}
