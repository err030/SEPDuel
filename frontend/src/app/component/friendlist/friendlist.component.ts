import {Component, OnInit, ViewChild} from '@angular/core';
import {User} from "../../model/user";
import {UserService} from "../../service/user.service";
import {FriendService} from "../../service/friend.service";
import {Global} from "../../global";
import {friend} from "../../model/friend";
import {FriendRequest} from "../../model/FriendRequest";
import {FormsModule, NgForm} from "@angular/forms";
import {ActivatedRoute, Router, RouterOutlet} from "@angular/router";
import {ConfirmationService} from "primeng/api";
import {NgClass, NgForOf, NgIf} from "@angular/common";
import {LoadingComponent} from "../../loading/loading.component";

import {ButtonModule} from "primeng/button";
import {BadgeModule} from "primeng/badge";
import {ToggleButtonModule} from "primeng/togglebutton";
import {DividerModule} from "primeng/divider";
import {ScrollerModule} from "primeng/scroller";
import {DialogModule} from "primeng/dialog";
import {TabViewModule} from "primeng/tabview";
import {ScrollPanelModule} from "primeng/scrollpanel";


@Component({
  selector: 'app-friendlist',
  standalone: true,
  imports: [
    FormsModule,
    NgIf,
    NgForOf,
    LoadingComponent,
    ButtonModule,
    BadgeModule,
    ToggleButtonModule,
    DividerModule,
    ScrollerModule,
    RouterOutlet,
    DialogModule,
    NgClass,
    TabViewModule,
    ScrollPanelModule
  ],
  providers: [UserService, FriendService, ConfirmationService],
  templateUrl: './friendlist.component.html',
  styleUrl: './friendlist.component.css'
})
export class FriendlistComponent implements OnInit {

  public loggedUser: any;

  friendRequests: FriendRequest[] = [];
  allFriends: User[] = [];
  isListPublic: boolean | null = false;
  selectedFriendListItemId: number | undefined;

  newFriendRequests: string = "";
  showNewFriends: boolean = false;
  showFriendRequests: boolean = false;

  chatListFriends: User[] = [];


  @ViewChild(NgForm)

  benutzerSuchFormular: any                       //userSearchForm

  protected readonly friend = friend;


  constructor(
    private friendService: FriendService,
    private router: Router,
    private activatedRoute: ActivatedRoute,) {
    console.log('FriendlistComponent instantiated');
  }


  ngOnInit() {
    this.loggedUser = Global.loggedUser;
    if (this.loggedUser && this.loggedUser.id) {
      // 获取当前用户的所有好友
      this.friendService.getAllFriends(this.loggedUser.id).subscribe({
        next: (response) => {
          if (response.status == 200 && response.body) {
            this.allFriends = response.body;
            this.allFriends.sort((friend1, friend2) => friend1.lastname.localeCompare(friend2.lastname));
          }
        },
        error: (error) => {
          alert("error");
        }
      })
      // 获取当前用户的好友列表状态（是否公开）
      this.friendService.getListStatus(this.loggedUser.id).subscribe({
        next: (response) => {
          if (response.status == 200) {
            this.isListPublic = response.body;
          }
        },
        error: (error) => {
          alert("error")
        }
      })
      // 获取当前用户有多少个未处理的好友请求
      this.friendService.getNewFriendRequestNumber(this.loggedUser.id).subscribe({
        next: (response) => {
          if (response.status == 200 && response.body && response.body != 0) {
            this.newFriendRequests = response.body.toString();
          }
        },
        error: (error) => {
          alert("error")
        }
      })

      this.activatedRoute.paramMap.subscribe(parameters => {
        const friendIdParam = parameters.get('friendId');
        console.log(friendIdParam); // 确认 friend.id 是否正确获取
      });
    }

  }


  // 获取好友请求
  openFriendRequestDialog(): void {
    this.showFriendRequests = true;
    if (this.loggedUser && this.loggedUser.id) {
      this.friendService.getFriendRequests(this.loggedUser.id).subscribe({
        next: (response) => {
          if (response.status == 200 && response.body) {
            this.friendRequests = response.body;
            this.showNewFriends = true;
          }
        },
        error: (error) => {
          alert("error")
        }
      })
    }
  }


  acceptOrDenyRequest(request: FriendRequest, status: number): void {
    const currentRequestStatus: number = request.freundschaftanfragStatus;
    request.freundschaftanfragStatus = status;
    this.friendService.acceptOrRejectFriendRequest(request).subscribe({
      next: (response) => {
        if (response.status == 200) {
          if (status == 1) {
            this.allFriends.push(request.schickenUser);
            this.allFriends.sort((friend1, friend2) => friend1.lastname.localeCompare(friend2.lastname));
            alert("User has accepted")
          } else if (status == 2) {
            alert("User has rejected")
          }
          if (this.newFriendRequests) {
            let newFriendRequestsNumber = parseInt(this.newFriendRequests);
            newFriendRequestsNumber--;
            if (newFriendRequestsNumber != 0) {
              this.newFriendRequests = newFriendRequestsNumber.toString();
            } else {
              this.newFriendRequests = "";
            }
          }
        }
      },
      error: (error) => {
        request.freundschaftanfragStatus = currentRequestStatus;
        alert("error")
      }
    })
    // 从 friendRequests 数组中移除该请求对象
    const index = this.friendRequests.indexOf(request);
    if (index !== -1) {
      this.friendRequests.splice(index, 1);
    }

    // 如果没有未处理的好友请求，关闭对话框
    if (this.friendRequests.length === 0) {
      this.showFriendRequests = false;
    }
  }

  // 修改好友列表状态
  updateListStatus(): void {
    if (this.loggedUser && this.loggedUser.id) {
      this.friendService.updateListStatus(this.loggedUser.id, this.isListPublic).subscribe({
        next: (response) => {
          if (response.status == 200) {
            if (this.isListPublic) {
              alert("Friend list is now public")
            } else {
              alert("Friend list is now private")
            }
          }
        },
        error: (error) => {
          this.isListPublic = !this.isListPublic;
          alert("error")
        }
      })
    }

  }


  // 点击好友列表中的好友时，显示好友详情
  onFriendListItemClick(friend: User): void {
    this.selectedFriendListItemId = friend.id;
    this.friendService.selectedFriend = friend;
    if (friend.id) {
      this.friendService.getListStatus(friend.id).subscribe({
        next: (response) => {
          if (response.status == 200) {
            this.friendService.selectedFriendListStatus = response.body;
            this.friendService.allFriends = this.allFriends;
            this.friendService.chatListFriends = this.chatListFriends;
            void this.router.navigateByUrl("/friendlist/friend/" + friend.id);
          }
        },
        error: (error) => {
          alert("error")
        }
      })
    }
  }

  getItemClass(friend: User): string {
    if (friend.id == this.selectedFriendListItemId) {
      return 'friendListItemSelected';
    } else {
      return 'friendListItemUnselected';
    }
  }

  goToAddFriend() {
    this.router.navigate(['/addfriend']);
  }

  goToHome() {
    this.router.navigate(['/homepage-user']);
  }
}
