import { Component, OnInit, ViewChild } from '@angular/core';
import {User} from "../../model/user";
import {UserService} from "../../service/user.service";
import {FriendService} from "../../service/friend.service";
import {Global} from "../../global";
import {friend} from "../../model/friend";
import {FriendRequest} from "../../model/FriendRequest";
import {FormsModule, NgForm} from "@angular/forms";
import {Router, RouterOutlet} from "@angular/router";
import {forkJoin} from "rxjs";
import {ConfirmationService, MessageService} from "primeng/api";
import {HttpResponse} from "@angular/common/http";
import {NgClass, NgForOf, NgIf} from "@angular/common";
import {LoadingComponent} from "../../loading/loading.component";

import {ButtonModule} from "primeng/button";
import {BadgeModule} from "primeng/badge";
import {ToggleButtonModule} from "primeng/togglebutton";
import {DividerModule} from "primeng/divider";
import {ScrollerModule} from "primeng/scroller";
import {DialogModule} from "primeng/dialog";
import {TabViewModule} from "primeng/tabview";



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
    TabViewModule
  ],
  providers: [UserService, FriendService,MessageService,ConfirmationService],
  templateUrl: './friendlist.component.html',
  styleUrl: './friendlist.component.css'
})
export class FriendlistComponent implements OnInit {

  public loggedUser: any;
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
  showLoadingDialog: boolean=false;
  activeIndex:number=0;
  showNewFriends:boolean=false;
  showUserSearchDialog:boolean=false;

  chatListFriends: User[] = [];
  zeigenLadeDialog: boolean = false;      //showLoadingDialog

  zeigenNeueFreunde: boolean = false;     //showNewFriends

  zeigenUserSearchDialog: boolean = false;  //showUserSearchDialog

  angemeldeterBenutzer: User | null = null; //loggedUser

  zielBenutzerName: string = "";            //targetUserName

  zielFreund: friend | null = null;        //targetFriend

  alleFreunde: User[] = [];                //allFriends

  freundschaftsAnfragen: FriendRequest[] = []; //friendRequests

  neueFreundschaftsanfragen: string = "";  //newFriendRequests

  istListeoffentlich: boolean | null = false; //isListPublic

  ausgewahlteFreundeslisteElementID: number | undefined; //selectedFriendListItemId


  @ViewChild(NgForm)

  benutzerSuchFormular: any                       //userSearchForm
  zeigenFreundesliste: boolean = false;           //showFriendList
  userSearchForm: any;

//boolean zu control
  showAddFriendConfirmationPopup = false;
  showAddFriendPopup = false;
  protected showDeleteFriendConfirmation=false;
  private selectedFriend: User|null = null;
  protected readonly friend = friend;


  constructor(private userService: UserService,
              private friendService: FriendService,
              private messageService: MessageService,
              private router: Router,
              private confirmationService: ConfirmationService) {
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
          this.messageService.add({severity: 'error', summary: 'Fehler', detail: error.statusText});
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
          this.messageService.add({severity: 'error', summary: 'Fehler', detail: error.statusText});
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
          this.messageService.add({severity: 'error', summary: 'Fehler', detail: error.statusText});
        }
      })
    }
  }

  openNewFriendsView(): void {
    if (this.loggedUser && this.loggedUser.id) {
      this.friendService.getFriendRequests(this.loggedUser.id).subscribe({
        next: (response) => {
          if (response.status == 200 && response.body) {
            this.friendRequests = response.body;
            this.showNewFriends = true;
          }
        },
        error: (error) => {
          this.messageService.add({severity: 'error', summary: 'Fehler', detail: error.statusText});
        }
      })
    }
  }

  closeNewFriendsView(): void {
    this.showNewFriends = false;
  }

  resetUserSearchDialog(): void {
    this.targetFriend = null;
    this.targetEmail = '';
    this.userSearchForm.form.markAsPristine();
    this.userSearchForm.form.markAsUntouched();
    this.userSearchForm.form.updateValueAndValidity();
  }

  // 搜索用户
  onUserSearchFormSubmit(): void {
    if (this.loggedUser && this.loggedUser.id) {
      this.friendService.searchUserByUsername(this.loggedUser.id, this.loggedUser.username).subscribe({
        next: (response) => {
          if (response.status == 200 && response.body) {
            this.targetFriend = response.body;
            console.log(this.targetFriend)
            /*if (this.targetFriend.user.avatarUrl) {
              this.targetUserHasAvatar = true;
              this.targetUserAvatarUrl = this.getUserAvatarUrl(this.targetFriend.user);
            } else {
              this.targetUserHasAvatar = false;
              this.targetUserAvatarWord = this.getUserAvatarWord(this.targetFriend.user);
            }*/
          }
        },
        error: (error) => {
          if (error.status == 404) {
            this.messageService.add({
              severity: 'error',
              summary: 'Nicht gefunden',
              detail: 'Die eingegebene Email ist nicht vorhanden.'
            });
          } else {
            this.messageService.add({severity: 'error', summary: 'Fehler', detail: error.statusText});
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
            //this.friendService.chatListFriends = this.chatListFriends;
            void this.router.navigateByUrl("/user/friend/" + friend.id);
          }
        },
        error: (error) => {
          this.messageService.add({severity: 'error', summary: 'Fehler', detail: error.statusText});
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

  /*getUserAvatarWord(user: User): string {
    return user.lastname.charAt(0) + user.firstname.charAt(0);
  }

  getUserAvatarUrl(user: User): string {
    return Global.backendUrl + user.avatarUrl;
  }*/

  // 接受或拒绝好友请求
  acceptOrDenyRequest(request: FriendRequest, status: number): void {
    const currentRequestStatus: number = request.requestStatus;
    request.requestStatus = status;
    this.friendService.acceptOrRejectFriendRequest(request).subscribe({
      next: (response) => {
        if (response.status == 200) {
          if (status == 1) {
            this.allFriends.push(request.sendUser);
            this.allFriends.sort((friend1, friend2) => friend1.lastname.localeCompare(friend2.lastname));
            this.messageService.add({
              severity: 'success',
              summary: 'Erfolgreich',
              detail: 'Die Freundschaftsanfrage wurde angenommen'
            });
          } else if (status == 2) {
            this.messageService.add({
              severity: 'success',
              summary: 'Erfolgreich',
              detail: 'Die Freundschaftsanfrage wurde abgelehnt'
            });
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
        request.requestStatus = currentRequestStatus;
        this.messageService.add({severity: 'error', summary: 'Fehler', detail: error.statusText});
      }
    })
  }

  // 修改好友列表状态
  updateListStatus(): void {
    if (this.loggedUser && this.loggedUser.id) {
      this.friendService.updateListStatus(this.loggedUser.id, this.isListPublic).subscribe({
        next: (response) => {
          if (response.status == 200) {
            if (this.isListPublic) {
              this.messageService.add({
                severity: 'success',
                summary: 'Erfolgreich',
                detail: 'Die Freundesliste ist auf öffentlich eingestellt'
              });
            } else {
              this.messageService.add({
                severity: 'success',
                summary: 'Erfolgreich',
                detail: 'Die Freundesliste ist auf privat eingestellt'
              });
            }
          }
        },
        error: (error) => {
          this.isListPublic = !this.isListPublic;
          this.messageService.add({severity: 'error', summary: 'Fehler', detail: error.statusText});
        }
      })
    }





}

  resetList() {

  }
}
