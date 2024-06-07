import {Component, OnInit} from '@angular/core';
import {User} from "../../model/user";
import {ActivatedRoute} from "@angular/router";
import {FriendService} from "../../service/friend.service";
import {Global} from "../../global";
import {DividerModule} from "primeng/divider";
import {ButtonModule} from "primeng/button";
import {DialogModule} from "primeng/dialog";
import {ScrollerModule} from "primeng/scroller";
import {NgIf} from "@angular/common";
import { Router } from '@angular/router'; // 导入Router服务

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
              private friendService: FriendService,
              private router: Router,
              ) {
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
          alert("error");
        }
      })
    }
  }



  // 删除用户
  deleteFriend(friend: User): void {
    if (this.loggedUser && this.loggedUser.id) {

      const result = confirm("Are you sure to delete this friend?");
      if(result){
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
                alert("This friend is already deleted")
              }
            },
            error: (error) => {
              alert("error")
            }
          })
        }
      }
    }
  }


  chatWithFriend(selectedFriend: User) {
    this.router.navigate(['/chat/user_message/' + selectedFriend.id]);
  }
}


