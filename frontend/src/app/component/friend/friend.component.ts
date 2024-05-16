import {Component, OnInit} from '@angular/core';
import {User} from "../../model/user";
import {ActivatedRoute, Router} from "@angular/router";
import {UserService} from "../../service/user.service";
import {FriendService} from "../../service/friend.service";
import {ConfirmationService, MessageService} from "primeng/api";
import {Global} from "../../global";
import {DividerModule} from "primeng/divider";
import {ButtonModule} from "primeng/button";
import {DialogModule} from "primeng/dialog";
import {ScrollerModule} from "primeng/scroller";
import {NgIf} from "@angular/common";

@Component({
  selector: 'app-friend',
  standalone: true,
  imports: [
    DividerModule,
    ButtonModule,
    DialogModule,
    ScrollerModule,
    NgIf
  ],
  templateUrl: './friend.component.html',
  styleUrl: './friend.component.css'
})
export class FriendComponent implements OnInit {
  friendId: number | null = null;
  public loggedUser: any;
  selectedFriend: User | null = null;
  selectedFriendListStatus: boolean | null = null;
  friends: User[] = [];
  showFriendList: boolean = false;


  constructor(private activatedRoute: ActivatedRoute,
              private userService: UserService,
              private friendService: FriendService,
              private messageService: MessageService,
              private confirmationService: ConfirmationService,
              private router: Router) {
  }

  ngOnInit(): void {
    this.loggedUser = Global.loggedUser;
    this.activatedRoute.paramMap.subscribe(parameters => {
      const friendIdParam = parameters.get('friendId');
      if (friendIdParam != null) {
        this.friendId = parseInt(friendIdParam);
        this.loggedUser = Global.loggedUser;
        this.selectedFriend = this.friendService.selectedFriend;
        this.selectedFriendListStatus = this.friendService.selectedFriendListStatus;
      }
    })
  }

  getFriendAvatarWord(friend: User): string {
    return friend.lastname.charAt(0) + friend.firstname.charAt(0);
  }

  getFriendAvatarUrl(friend: User): string {
    return Global.backendUrl + friend.avatarUrl;
  }

  // 获取好友信息并显示
  openFriendList(): void {
    if (this.selectedFriend && this.selectedFriend.id) {
      this.friendService.getAllFriends(this.selectedFriend.id).subscribe({
        next: (response) => {
          if (response.status == 200 && response.body) {
            this.friends.length = 0;
            response.body.forEach(friend => {
              this.friends.push(friend);
            })
            this.showFriendList = true;
          }
        },
        error: (error) => {
          this.messageService.add({severity: 'error', summary: 'Fehler', detail: error.statusText});
        }
      })
    }
  }

  // 删除用户
  deleteFriend(friend: User): void {
    if (this.loggedUser && this.loggedUser.id) {
      this.confirmationService.confirm({
        message: 'Sind Sie sicher, dass Sie diesen Freund löschen möchten?',
        header: 'Freund löschen',
        icon: 'pi pi-info-circle',
        acceptLabel: 'Ja',
        rejectLabel: 'Nein',
        defaultFocus: 'reject',
        acceptButtonStyleClass: 'p-button-danger',
        rejectButtonStyleClass: 'p-button-secondary',
        accept: () => {
          if (this.loggedUser && this.loggedUser.id && friend && friend.id) {
            this.friendService.deleteFriend(this.loggedUser.id, friend.id).subscribe({
              next: (response) => {
                if (response.status == 200) {
                  for (let i = 0; i < this.friendService.allFriends.length; i++) {
                    if (this.friendService.allFriends[i].id == friend.id) {
                      this.friendService.allFriends.splice(i, 1);
                    }
                  }
                  for (let i = 0; i < this.friendService.chatListFriends.length; i++) {
                    if (this.friendService.chatListFriends[i].id == friend.id) {
                      this.friendService.chatListFriends.splice(i, 1);
                    }
                  }
                  this.selectedFriend = null;
                  this.messageService.add({
                    severity: 'success',
                    summary: 'Erfolgreich',
                    detail: 'Der Freund wurde gelöscht'
                  });
                }
              },
              error: (error) => {
                this.messageService.add({severity: 'error', summary: 'Fehler', detail: error.statusText});
              }
            })
          }
        }
      });
    }
  }



}
