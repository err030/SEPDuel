import { Component, OnInit, ViewChild } from '@angular/core';
import {User} from "../../model/user";
import {UserService} from "../../service/user.service";
import {FriendService} from "../../service/friend.service";
import {Global} from "../../../global";
import {friend} from "../../model/friend";
import {FriendRequest} from "../../model/FriendRequest";
import {NgForm} from "@angular/forms";
import {Router} from "@angular/router";


@Component({
  selector: 'app-friendlist',
  standalone: true,
  imports: [],
  templateUrl: './friendlist.component.html',
  styleUrl: './friendlist.component.css'
})
export class FriendlistComponent implements OnInit {
  zeigenLadeDialog : boolean = false;      //showLoadingDialog

  zeigenNeueFreunde : boolean = false;     //showNewFriends

  zeigenUserSearchDialog : boolean = false;  //showUserSearchDialog

  angemeldeterBenutzer : User | null = null; //loggedUser

  zielBenutzerName : string = "";            //targetUserName

  zielFreund : friend | null = null;        //targetFriend

  alleFreunde : User[] = [];                //allFriends

  freundschaftsAnfragen : FriendRequest[] = []; //friendRequests

  neueFreundschaftsanfragen : string = "";  //newFriendRequests

  istListeöffentlich : boolean | null = false; //isListPublic

  ausgewählteFreundeslisteElementID : number | undefined; //selectedFriendListItemId


  @ViewChild(NgForm)

  benutzerSuchFormular: any                       //userSearchForm
  zeigenFreundesliste: boolean = false;           //showFriendList

constructor(private userService: UserService,
            private friendService: FriendService,
            private router: Router) {
}


  ngOnInit() {
    this.angemeldeterBenutzer = this.userService.loggedUser;
    if(this.angemeldeterBenutzer && this.angemeldeterBenutzer.id){
      this.loadAllFriends();

     // this.loadListStatus();

      //this.loadNewFriendRequestNumber();
    }
  }
    private loadAllFriends(): void {

    }

















}
