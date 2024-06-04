import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router, RouterOutlet} from "@angular/router";
import { UserService } from "../../service/user.service";
import { User } from "../../model/user";
import { NgForOf, NgIf } from "@angular/common";
import { FormsModule } from "@angular/forms";
import {Global} from "../../global";
import {LeaderboardService} from "../../service/leaderboard.service";
import {friend} from "../../model/friend";
import {HttpResponse} from "@angular/common/http";
import {FriendRequest} from "../../model/FriendRequest";
import {DuelRequest} from "../../model/DuelRequest";
import {DialogModule} from "primeng/dialog";
import {SharedModule} from "primeng/api";

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [
    NgForOf,
    FormsModule,
    NgIf,
    DialogModule,
    SharedModule
  ],
  templateUrl: './leaderboard.component.html',
  styleUrls: ['./leaderboard.component.css']
})
export class LeaderboardComponent implements OnInit {
  loggedUser: User | null = null;
  leaderboard: User[] = [];
  searchText: string = '';
  displayedUsers: User[] = [];
  userId: number | null = null;
  selectedUser: User | null = null;
  duelRequests: DuelRequest[] = [];

  usersPerPage: number = 10;
  currentPage: number = 1;
  totalPages: number = 1;
  showDuelRequests: boolean = false;
  newDuelRequests: number=0;
  showInitiateDuelButton: boolean = false;
  selectedUserId: number | undefined;

  constructor(private activatedRoute: ActivatedRoute,private userService: UserService, private leaderboardService: LeaderboardService, private router: Router) { }

  ngOnInit(): void {
    console.log('Global.loggedUser:', Global.loggedUser);
    this.loggedUser = Global.loggedUser;
    this.userService.getLeaderboard().subscribe(response => {
      if (response.status === 200) {
        this.leaderboard = response.body || [];
        // Initialize the status to an empty string if not provided by the backend
        this.leaderboard.forEach(user => user.status = user.status !== undefined ? user.status : 0);
        this.totalPages = Math.ceil(this.leaderboard.length / this.usersPerPage);
        this.updateDisplayedPlayers();
      }
    });
    this.activatedRoute.paramMap.subscribe(parameters => {
      const friendIdParam = parameters.get('friendId');
      if (friendIdParam != null) {
        this.userId = parseInt(friendIdParam);
        this.loggedUser = Global.loggedUser;
        this.selectedUser = this.userService.selectedUser;
      }
    })
    this.checkNewDuelRequests();
  }

  search() {
    if (this.searchText.trim().length > 0) {
      const filtered = this.leaderboard.filter(user =>
        user.username.toLowerCase().includes(this.searchText.toLowerCase())
      );
      if (filtered.length > 0) {
        this.leaderboard = filtered;
        this.currentPage = 1;
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


  sendDuelRequest(user: User): void {
    console.log('Selected User:', user);
    console.log('Logged User:', this.loggedUser);
    this.selectedUser = user;
    this.selectedUserId = user.id;
    this.userService.selectedUser = user;
    if (this.loggedUser && this.loggedUser.id && this.selectedUser && this.selectedUser.id) {
      if (this.loggedUser.status === 0 && this.selectedUser.status === 0) {
        this.leaderboardService.sendDuelRequest(this.loggedUser.id, this.selectedUser.id)
          .subscribe((response: HttpResponse<any>) => {
            alert("Duel request sent");
            // 假设请求发送成功后，更新用户状态
            this.loggedUser!.status = 1;
            this.selectedUser!.status = 1;
          }, error => {
            alert("Error sending duel request");
          });
      } else {
        alert("This user now is not available for a duel.");
      }
    } else {
      alert("Current user or target user is null.");
    }
  }

  openDuelRequestDialog(): void {
    this.showDuelRequests = true;
    if (this.loggedUser && this.loggedUser.id) {
      this.leaderboardService.getDuelRequests(this.loggedUser.id).subscribe({
        next: (response) => {
          if (response.status == 200 && response.body) {
            this.duelRequests = response.body;
          }
        },
        error: (error) => {
          alert(error.statusText)
        }
      })
    }
  }
  acceptOrRejectDuelRequest(request: DuelRequest, status: number): void {
    const currentRequestStatus: number = request.duellanfragStatus;
    request.duellanfragStatus = status;
    this.leaderboardService.acceptOrDenyDuelRequest(request).subscribe({
      next: (response) => {
        if (response.status == 200) {
          if (status == 3) {
            // 接受对决请求
            alert('对决请求已接受');
            // 显示"主动决斗"按钮
            this.showInitiateDuelButton = true;
          } else if (status == 4) {
            // 拒绝对决请求
            alert('对决请求已拒绝');
          }
          // 将 newDuelRequests 设置为 0
          this.newDuelRequests = 0;
        }
      },
      error: (error) => {
        status = currentRequestStatus;
        alert(error.statusText)
      }
    })

    // 从 duelRequests 数组中移除该请求对象
    this.duelRequests = this.duelRequests.filter(r => r.id !== request.id);
    const index = this.duelRequests.indexOf(request);
    if (index !== -1) {
      this.duelRequests.splice(index, 1);
    }

    // 如果没有未处理的对决请求，关闭对话框
    if (this.duelRequests.length === 0) {
      this.showDuelRequests = false;
    }
  }
  initiateDuel(): void {
    // 跳转到Duel页面
    this.router.navigate(['/duel']);

    // 隐藏"主动决斗"按钮
    this.showInitiateDuelButton = false;
  }

  checkNewDuelRequests(): void {
    setInterval(() => {
      if (this.loggedUser && this.loggedUser.id) {
        this.leaderboardService.getDuelRequests(this.loggedUser.id).subscribe({
          next: (response) => {
            if (response.status == 200 && response.body) {
              this.duelRequests = response.body;
              this.newDuelRequests=this.duelRequests.length;
            }
          },
          error: (error) => {
            console.error("Error fetching duel requests:", error);
          }
        })
      }
    }, 5000);
  }// 每5秒钟检查一次
}
