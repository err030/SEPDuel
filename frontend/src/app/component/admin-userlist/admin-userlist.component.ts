import {Component, OnInit} from '@angular/core';
import {User} from "../../model/user";
import {UserService} from "../../service/user.service";
import {ActivatedRoute, Router, RouterOutlet} from "@angular/router";
import {FriendService} from "../../service/friend.service";
import {Global} from "../../global";
import {TableModule} from "primeng/table";
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
  providers: [UserService, FriendService],
  templateUrl: './admin-userlist.component.html',
  styleUrl: './admin-userlist.component.css'
})
export class AdminUserlistComponent implements OnInit{

  public loggedUser: any;

  allUser:User[]=[];
  selectedUserListItemId: number | undefined;
  friendId: number | null = null;
  selectedUser: User | null = null;


  constructor(private activatedRoute: ActivatedRoute,
              private userService: UserService,
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



  onUserListItemClick(user: User): void {
    this.selectedUserListItemId = user.id;
    this.friendService.selectedFriend = user;
    void this.router.navigateByUrl("/admin-userlist/allfriendlist/" + user.id);

  }
}
