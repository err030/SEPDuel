import {Component, OnInit} from '@angular/core';
import {User} from "../../model/user";
import {UserService} from "../../service/user.service";
import {ConfirmationService, MessageService} from "primeng/api";
import {Router} from "@angular/router";
import {FriendService} from "../../service/friend.service";
import {Global} from "../../global";
import {TableModule} from "primeng/table";

@Component({
  selector: 'app-admin-userlist',
  standalone: true,
  imports: [
    TableModule
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

  constructor(private userService: UserService,
              private messageService: MessageService,
              private friendService: FriendService,
              private router: Router) {
  }

  ngOnInit(): void {
    this.loggedUser = Global.loggedUser;
    this.getAllUsers();
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


}
