import {Component, OnInit} from '@angular/core';
import {User} from "../../model/user";
import {ActivatedRoute, Router} from "@angular/router";
import {UserService} from "../../service/user.service";
import {FriendService} from "../../service/friend.service";
import {ConfirmationService, MessageService, SharedModule} from "primeng/api";
import {Global} from "../../global";
import {ButtonModule} from "primeng/button";
import {DialogModule} from "primeng/dialog";
import {DividerModule} from "primeng/divider";
import {NgIf} from "@angular/common";
import {ScrollerModule} from "primeng/scroller";

@Component({
  selector: 'app-allfriendlist',
  standalone: true,
  imports: [
    ButtonModule,
    DialogModule,
    DividerModule,
    NgIf,
    ScrollerModule,
    SharedModule
  ],
  templateUrl: './allfriendlist.component.html',
  styleUrl: './allfriendlist.component.css'
})
export class AllfriendlistComponent implements OnInit{
  userId: number | null = null;
  public loggedUser: any;
  selectedUser: User | null = null;
  friends: User[] = [];
  showFriendList: boolean = false;
  selectedFriend: User | null = null;


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
      const userIdParam = parameters.get('userId');
      if (userIdParam != null) {
        this.userId = parseInt(userIdParam);
        this.loggedUser = Global.loggedUser;
        this.selectedUser = this.friendService.selectedFriend;
      }
    })
  }



  // 获取好友信息并显示
  openFriendList(): void {
    if (this.selectedUser && this.selectedUser.id) {
      this.friendService.getAllFriends(this.selectedUser.id).subscribe({
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
}
