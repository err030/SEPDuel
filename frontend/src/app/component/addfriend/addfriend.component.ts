import { Component } from '@angular/core';
import {UserService} from "../../service/user.service";
import {FriendService} from "../../service/friend.service";
import {ConfirmationService, MessageService} from "primeng/api";
import {Router} from "@angular/router";
import {Global} from "../../global";
import {FormsModule} from "@angular/forms";
import {FriendRequest} from "../../model/FriendRequest";
import {User} from "../../model/user";
import {friend} from "../../model/friend";
import {NgIf} from "@angular/common";
import {DialogModule} from "primeng/dialog";

@Component({
  selector: 'app-addfriend',
  standalone: true,
  imports: [
    FormsModule,
    NgIf,
    DialogModule
  ],
  providers: [UserService, FriendService,MessageService,ConfirmationService],
  templateUrl: './addfriend.component.html',
  styleUrl: './addfriend.component.css'
})
export class AddfriendComponent {
  loggedUser: any;
  shownoticDialog: boolean = false;

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
  errorMessage: string = "";


  constructor(private friendService: FriendService, private messageService: MessageService) {}

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
            /*this.messageService.add({
              severity: 'error',
              summary: 'Nicht gefunden',
              detail: 'Die eingegebene Email ist nicht vorhanden.'
            });*/
            // this.errorMessage = "Die eingegebene Email ist nicht vorhanden."
            this.shownoticDialog = true;
          } else {
            /*this.messageService.add({
              severity: 'error',
              summary: 'Fehler',
              detail: error.statusText});*/
            this.errorMessage = 'Fehler: ' + error.statusText;
          }
          this.targetFriend = null;
        }
      })
    }
  }
  showDialog() {
    this.shownoticDialog = true;
  }
  hideDialog() {
    this.shownoticDialog = false;
  }

  // 发送好友请求
  sendFriendRequest(): void {
    if (this.loggedUser && this.loggedUser.id && this.targetFriend && this.targetFriend.user && this.targetFriend.user.id) {
      this.friendService.sendFriendRequest(this.loggedUser.id, this.targetFriend.user.id).subscribe({
        next: (response) => {
          if (response.status == 200) {
            this.messageService.add({
              severity: 'success',
              summary: 'Erfolgreich',
              detail: 'Die Freundschaftsanfrage wurde gesendet'
            });
            this.showUserSearchDialog = false;
          }
        },
        error: (error) => {
          this.messageService.add({severity: 'error', summary: 'Fehler', detail: error.statusText});
        }
      })
    }
  }
  getUserAvatarUrl(user: User): string {
    return Global.backendUrl + user.avatarUrl;
  }
}
