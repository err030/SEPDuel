import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import { UserService } from "../../service/user.service";
import { User } from "../../model/user";
import { NgForOf, NgIf } from "@angular/common";
import { FormsModule } from "@angular/forms";
import {Global} from "../../global";
import {LeaderboardService} from "../../service/leaderboard.service";
import {HttpResponse} from "@angular/common/http";
import {DuelRequest} from "../../model/DuelRequest";
import {DialogModule} from "primeng/dialog";
import {SharedModule} from "primeng/api";
import { DuelService } from "../../service/duel.service";
import {CountdownComponent} from "ngx-countdown";

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [
    NgForOf,
    FormsModule,
    NgIf,
    DialogModule,
    SharedModule,
    CountdownComponent
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
  currentRequestId: number | null = null;
  duelRequest?: DuelRequest;
  sentRequest: DuelRequest | null = null;
  countdownConfig = { leftTime: 30 };  // Countdown configuration
  showCountdown: boolean = false;
  countdownTimer: any;

  constructor(private activatedRoute: ActivatedRoute,private userService: UserService, private leaderboardService: LeaderboardService, private router: Router, private duelService: DuelService) { }

  ngOnInit(): void {
    console.log('Global.loggedUser:', Global.loggedUser);
    this.loggedUser = Global.loggedUser;
    this.userService.getLeaderboard().subscribe(response => {
      if (response.status === 200) {
        this.leaderboard = response.body || [];
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
    if (this.sentRequest){
      localStorage.setItem("sentRequest",JSON.stringify(this.sentRequest))
    } else {
      // @ts-ignore
      this.sentRequest = JSON.parse(localStorage.getItem("sentRequest"));
    }
    console.log("sentRequest:", this.sentRequest);
    this.checkNewDuelRequests();
    //for testing only
    // this.duelRequests.forEach(request => {
    //   request.duellanfragStatus = 0;
    // })
    // @ts-ignore
    // this.selectedUser.status = 0;
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

  getStatusText(status: number | undefined): string {
    switch (status) {
      case 0:
        return 'online';
      case 1:
        return 'busy';
      case 2:
        return 'offline';
      case 3:
        return 'dueling';
      default:
        return 'unknown';
    }
  }

  updateDisplayedPlayers() {
    const startIndex = (this.currentPage - 1) * this.usersPerPage;
    this.displayedUsers = this.leaderboard
      .filter(user => user.groupId !== 2) // 过滤掉管理员用户
      .slice(startIndex, startIndex + this.usersPerPage);
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
    //@ts-ignore
    Global.currentDeck = JSON.parse(localStorage.getItem('currentDeck'));
    console.log("currentDeck:", Global.currentDeck);
    if (!Global.currentDeck){
        alert("Please select a deck first");
        this.router.navigate(['/deck-list']);
        return;
    }
    if (this.loggedUser && this.loggedUser.id && this.selectedUser && this.selectedUser.id) {
      if (this.loggedUser.status === 0 && this.selectedUser.status === 0) {
        this.leaderboardService.sendDuelRequest(this.loggedUser.id, this.selectedUser.id, Global.currentDeck.id)
          .subscribe((response: HttpResponse<any>) => {
            this.sentRequest = response.body;
            localStorage.setItem('sentRequest', JSON.stringify(this.sentRequest));
            this.loggedUser!.status = 1;
            this.selectedUser!.status = 1;
            this.showCountdown = true;
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
    //@ts-ignore
    Global.currentDeck = JSON.parse(localStorage.getItem('currentDeck'));
    console.log("currentDeck:", Global.currentDeck);
    if (!Global.currentDeck){
      alert("Please select a deck first");
      this.router.navigate(['/deck-list']);
      return;
    }
    const currentRequestStatus: number = request.duellanfragStatus;
    this.currentRequestId = request.id;
    request.duellanfragStatus = status;
    this.leaderboardService.acceptOrDenyDuelRequest(request).subscribe({
      next: (response) => {
        console.log('response:', response);
        if (response.status == 200) {
          if (status == 3) {
            // 接受对决请求
            alert('对决请求已接受');
            this.loggedUser!.status = 3;
            this.selectedUser!.status = 3;
            // 显示"主动决斗"按钮
            this.showInitiateDuelButton = true;
            this.showCountdown = false;
          } else if (status == 0) {
            // 拒绝对决请求
            this.loggedUser!.status = 0;
            this.selectedUser!.status = 0;
            alert('对决请求已拒绝');
            this.showCountdown = false;
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
    // @ts-ignore
    Global.currentDeck = JSON.parse(localStorage.getItem('currentDeck'));
    console.log("currentDeck:", Global.currentDeck);
    if (!Global.currentDeck){
      alert("Please select a deck first");
      this.router.navigate(['/deck-list']);
      return;
    }

    // 跳转到Duel页面
    // @ts-ignore
    this.duelService.createDuel(this.duelRequest.id, this.duelRequest.sendDeckId, Global.currentDeck.id).subscribe(
      (response) => {
        this.duelService.initializer = true;
        this.router.navigate([`/duel/${this.duelRequest?.id}`]);
      }
    )


    // 隐藏"主动决斗"按钮
    this.showInitiateDuelButton = false;
  }

  checkNewDuelRequests(): void {
    setInterval(() => {
      if (this.loggedUser && this.loggedUser.id) {
        this.leaderboardService.getDuelRequests(this.loggedUser.id).subscribe({
          next: (response) => {
            if (response.status == 200 && response.body) {
              const previousDuelRequests = this.duelRequests;
              this.duelRequests = response.body;
              this.newDuelRequests=this.duelRequests.length;
              if (this.duelRequests.length > previousDuelRequests.length) {
                // Show countdown when a new duel request is received
                this.showCountdown = true;
                this.startCountdownTimer();
              }
            }
            //update sent request status
            if (this.sentRequest){
              this.leaderboardService.getDuelRequestById(this.sentRequest.id).subscribe(response => {
                if (response.status == 200 && response.body) {
                  // @ts-ignore
                  this.sentRequest.duellanfragStatus = response.body.duellanfragStatus;
                }
              })
            }
            // check if request already accepted
            if (this.duelRequests.some(r => r.duellanfragStatus === 3)) {
              this.showInitiateDuelButton = true;
              this.duelRequest = this.duelRequests.find(r => r.duellanfragStatus === 3);
            }
            if (this.sentRequest && this.sentRequest.duellanfragStatus === 3){
              this.showInitiateDuelButton = true;
              this.duelRequest = this.sentRequest;
            }
          },
          error: (error) => {
            console.error("Error fetching duel requests:", error);
          }
        })
      }
    }, 1000);
  }// 每1秒钟检查一次


  startCountdownTimer(): void {
    clearTimeout(this.countdownTimer);
    this.countdownTimer = setTimeout(() => {
      this.rejectDuelRequestAutomatically();
    }, 30000); // 30 seconds
  }

  rejectDuelRequestAutomatically(): void {
    const pendingRequest = this.duelRequests.find(r => r.duellanfragStatus === 1);
    if (pendingRequest) {
      this.acceptOrRejectDuelRequest(pendingRequest, 0);
      this.loggedUser!.status = 0;
      this.selectedUser!.status = 0;
    }
  }
  enterDuel() {
    this.duelService.initializer = false;
    this.router.navigate([`/duel/${this.duelRequest?.id}`]);
  }
}
