import { Component, OnInit } from '@angular/core';
import { Router,RouterOutlet } from "@angular/router";
import { UserService } from "../../service/user.service";
import { User } from "../../model/user";
import { NgForOf } from "@angular/common";
import { FormsModule } from "@angular/forms";

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [
    NgForOf,
    FormsModule
  ],
  templateUrl: './leaderboard.component.html',
  styleUrls: ['./leaderboard.component.css']
})
export class LeaderboardComponent implements OnInit {
  leaderboard: User[] = [];
  searchText: string = '';
  displayedUsers: User[] = [];

  usersPerPage: number = 10;
  currentPage: number = 1;
  totalPages: number = 0;

  constructor(private userService: UserService, private routerOutlet: RouterOutlet, private router: Router) { }

  ngOnInit(): void {
    this.userService.getLeaderboard().subscribe(response => {
      if (response.status === 200) {
        this.leaderboard = response.body || [];
        this.totalPages = Math.ceil(this.leaderboard.length / this.usersPerPage);
        this.updateDisplayedPlayers();
      }
    });
  }

  search() {
    if (this.searchText.trim().length > 0) {
      const filtered = this.leaderboard.filter(user =>
        user.username.toLowerCase().includes(this.searchText.toLowerCase())
      );
      if (filtered.length > 0) {
        this.leaderboard = filtered;
        this.currentPage = 1; // 重置为第一页
        this.totalPages = Math.ceil(filtered.length / this.usersPerPage);
        this.updateDisplayedPlayers();
      } else {
        alert("No such player");
        this.resetSearch();
      }
    } else {
      alert("Please enter a search term");
      this.resetSearch();
    }
  }

  resetSearch() {
    this.searchText = '';
    this.userService.getLeaderboard().subscribe(response => {
      if (response.status === 200) {
        this.leaderboard = response.body || [];
        this.totalPages = Math.ceil(this.leaderboard.length / this.usersPerPage);
        this.updateDisplayedPlayers();
      }
    });
  }

  updateDisplayedPlayers() {
    const startIndex = (this.currentPage - 1) * this.usersPerPage;
    this.displayedUsers = this.leaderboard.slice(startIndex, startIndex + this.usersPerPage);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updateDisplayedPlayers();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updateDisplayedPlayers();
    }
  }

  goToHome() {
    this.router.navigate(['/homepage-user']);
  }
}
