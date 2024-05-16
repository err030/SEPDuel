import {Component, OnInit} from '@angular/core';
import {User} from "../../model/user";
import {UserService} from "../../service/user.service";
import {ConfirmationService, MessageService} from "primeng/api";
import {ActivatedRoute, Router, RouterOutlet} from "@angular/router";
import {FriendService} from "../../service/friend.service";
import {Global} from "../../global";
import {TableModule} from "primeng/table";
import {friend} from "../../model/friend";
import {NgClass, NgForOf} from "@angular/common";
import {DialogModule} from "primeng/dialog";

@Component({
  selector: 'app-admin-userlist',
  standalone: true,
  imports: [
    TableModule,
    NgClass,
    DialogModule,
    NgForOf,
    RouterOutlet
  ],
  providers: [UserService, FriendService,MessageService,ConfirmationService],
  templateUrl: './admin-userlist.component.html',
  styleUrl: './admin-userlist.component.css'
})
export class AdminUserlistComponent implements OnInit{
  showAuditList: boolean = true;
  auditRequests: any;
  public loggedUser: any;
  allComment:Comment [] =[];
  allUser:User[]=[];
  selectedUserListItemId: number | undefined;
  friendId: number | null = null;
  selectedUser: User | null = null;
  showFriendList: boolean = false;
  friends: User[] = [];

  constructor(private activatedRoute: ActivatedRoute,
              private userService: UserService,
              private messageService: MessageService,
              private friendService: FriendService,
              private router: Router) {
  }

  ngOnInit(): void {
    this.loggedUser = Global.loggedUser;
    this.getAllUsers();
    this.activatedRoute.paramMap.subscribe(parameters => {
      const friendIdParam = parameters.get('friendId');
      if (friendIdParam != null) {
        this.friendId = parseInt(friendIdParam);
        this.loggedUser = Global.loggedUser;
        this.selectedUser = this.friendService.selectedFriend;

      }
    })
  }

  getAllUsers(): void {
    this.userService.getAllUserByGroupId(this.loggedUser).subscribe(
      (response) => {
        if (response.status === 200 && response.body) {
          this.allUser = response.body;
        }
      },
      (error) => {
        console.error('Error fetching users:', error);
      }
    );
  }

  getItemClass(user: User): string {
    if (user.id == this.selectedUserListItemId) {
      return 'userListItemSelected';
    } else {
      return 'userListItemUnselected';
    }
  }

  openFriendlistDialog(user: User): void {
    this.showFriendList = true;
    this.selectedUserListItemId = user.id;
    this.friendService.selectedFriend = user;
    if (this.selectedUser && this.selectedUser.id) {
      this.friendService.getAllFriends(this.selectedUser.id).subscribe({
        next: (response) => {
          if (response.status == 200 && response.body) {
            this.friends.length = 0;
            response.body.forEach(friend => {
              this.friends.push(friend);
            })
            this.showFriendList = true;
            console.log(response.body);
          }
        },
        error: (error) => {
          this.messageService.add({severity: 'error', summary: 'Fehler', detail: error.statusText});
        }
      })
    }
  }

  onUserListItemClick(user: User): void {
    this.selectedUserListItemId = user.id;
    this.friendService.selectedFriend = user;
    void this.router.navigateByUrl("/admin-userlist/allfriendlist/" + user.id);

  }
}
