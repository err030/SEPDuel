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
  }

  goToAddFriend() {
    this.router.navigate(['/addfriend']);
  }
}
