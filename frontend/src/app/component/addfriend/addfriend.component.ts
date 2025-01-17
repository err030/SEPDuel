import { Component } from '@angular/core';
import {UserService} from "../../service/user.service";
import {FriendService} from "../../service/friend.service";
import {Router} from "@angular/router";
import {Global} from "../../global";
import {FormsModule} from "@angular/forms";
import {FriendRequest} from "../../model/FriendRequest";
import {User} from "../../model/user";
import {friend} from "../../model/friend";
import {NgIf} from "@angular/common";

@Component({
  selector: 'app-addfriend',
  standalone: true,
  imports: [
    FormsModule,
    NgIf
  ],
  providers: [UserService, FriendService],
  templateUrl: './addfriend.component.html',
  styleUrl: './addfriend.component.css'
})
export class AddfriendComponent {
  loggedUser: any;

  showLoadingDialog: boolean = false;
  activeIndex: number = 0;
  showNewFriends: boolean = false;
  showUserSearchDialog: boolean = false;
  targetEmail: string = "";
  targetFriend: friend | null = null;
  targetUserHasAvatar: boolean = false;
  targetUserAvatarUrl: string = "";
  targetUserAvatarWord: string = "";
  friendRequests: FriendRequest[] = [];
  allFriends: User[] = [];
  isListPublic: boolean | null = false;
  selectedFriendListItemId: number | undefined;
  selectedChatListItemId: number | undefined;
  newFriendRequests: string = "";
  chatListFriends: User[] = [];



  constructor(private friendService: FriendService, private router: Router) {}

  ngOnInit(): void {
    this.loggedUser = Global.loggedUser;
  }

  resetUserSearchDialog(): void {
    this.targetFriend = null;
  }

  // 搜索用户
  onUserSearchFormSubmit(): void {
    if (this.loggedUser && this.loggedUser.id) {
      this.friendService.searchUserByEmail(this.loggedUser.id, this.targetEmail).subscribe({
        next: (response) => {
          if (response.status == 200 && response.body) {
            this.targetFriend = response.body;
            console.log(this.targetFriend)
            if (this.targetFriend.user.avatarUrl) {
              this.targetUserHasAvatar = true;
              this.targetUserAvatarUrl = this.getUserAvatarUrl(this.targetFriend.user);
            }
          }
        },
        error: (error) => {
          if (error.status == 404) {
            alert("User not found");
          } else {
            alert("Error: " + error.statusText);
          }
          this.targetFriend = null;
        }
      })
    }
  }

  // 发送好友请求
  sendFriendRequest(): void {
    if (this.loggedUser && this.loggedUser.id && this.targetFriend && this.targetFriend.user && this.targetFriend.user.id) {
      this.friendService.sendFriendRequest(this.loggedUser.id, this.targetFriend.user.id).subscribe({
        next: (response) => {
          if (response.status == 200) {
            alert("Friend request sent successfully!");
            this.showUserSearchDialog = false;
          }
        },
        error: (error) => {
          if(error.status == 400) {
            alert("You have already sent a friend request to this user");
          }
          else if (error.status === 409) {
            alert("You are already friends with this user");

          }
          else {
            alert("Error: " + error.statusText);
          }
        }
      })
    }
  }
  getUserAvatarUrl(user: User): string {
    return Global.backendUrl + user.avatarUrl;
  }

  goToFriendsPage(){
    this.router.navigate(['/friendlist']);
  }
}
