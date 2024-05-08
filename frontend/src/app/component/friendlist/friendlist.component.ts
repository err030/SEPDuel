import { Component, OnInit, ViewChild } from '@angular/core';
import {User} from "../../model/user";
import {UserService} from "../../service/user.service";
import {FriendService} from "../../service/friend.service";
import {Global} from "../../../global";
import {friend} from "../../model/friend";
import {FriendRequest} from "../../model/FriendRequest";
import {FormsModule, NgForm} from "@angular/forms";
import {Router} from "@angular/router";
import {forkJoin} from "rxjs";
import {ConfirmationService, MessageService} from "primeng/api";
import {HttpResponse} from "@angular/common/http";
import {NgForOf, NgIf} from "@angular/common";



@Component({
  selector: 'app-friendlist',
  standalone: true,
  imports: [
    FormsModule,
    NgIf,
    NgForOf
  ],
  providers: [UserService, FriendService,MessageService],
  templateUrl: './friendlist.component.html',
  styleUrl: './friendlist.component.css'
})
export class FriendlistComponent implements OnInit {
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

  private error(summary: string,err: any){
    this.messageService.add({
      severity: 'error',
      summary,
      detail: err
    });
  }

  private success(summary: string, detail: string){
    this.messageService.add({
      severity: 'success',
      summary,
      detail: detail
    });
  }


  async ngOnInit() {
    this.angemeldeterBenutzer = this.userService.loggedUser;
    if (!this.angemeldeterBenutzer || !this.angemeldeterBenutzer.id) return;

    forkJoin({
      friendsResponse: this.friendService.getAllFriends(this.angemeldeterBenutzer.id),
      listStatusResponse: this.friendService.getListStatus(this.angemeldeterBenutzer.id),
      friendRequestsNumberResponse: this.friendService.getNewFriendRequestNumber(this.angemeldeterBenutzer.id)
    }).subscribe({
      next: ({friendsResponse, listStatusResponse, friendRequestsNumberResponse}) =>{
        {
          const {status,body} = friendsResponse;
          if(status === 200 && body){
            this.alleFreunde = body;
            this.alleFreunde.sort((freund1, freund2) => freund1.lastname.localeCompare(freund2.lastname));
          }
        }

        {
          const {status,body} = listStatusResponse;
          if(status === 200){
            this.istListeoffentlich = body;
          }
        }

        {
          const {status, body} = friendRequestsNumberResponse;
          if(status === 200 && body && body > 0){
            this.neueFreundschaftsanfragen = body.toString();
          }
        }

      },
      error: (err) => this.error('Error', err.statusText)
    });

  }

  schliesenNeueFreundeAnsicht(): void{
    this.zeigenNeueFreunde = false;
  }

  //打开一个新的视图，显示当前用户收到的所有好友请求。
  offnenNeueFreundeAnsicht(): void{
    let loggedUser = this.angemeldeterBenutzer;
    if(!loggedUser)return ;
    let id = loggedUser.id;
    if(!id) return;

    this.friendService.getFriendRequests(id).subscribe({
      next: (httpresponse ) =>{
        let {ok,body} = httpresponse;
        if(ok && body){
          this.freundschaftsAnfragen = body;
          this.zeigenNeueFreunde = true;
        }
      },
      error: (err) => this.error('Error request', err.statusText)
    })

  }

  //搜索按钮激活
  BenutzersuchFormularAbsenden(): void{
    let loggedUser = this.angemeldeterBenutzer;
    if(!loggedUser) return ;
    let id = loggedUser.id;
    if(!id) return;
    let username = this.zielBenutzerName

    this.friendService.searchUserByUsername(id, username).subscribe({
      next: (httpresponse) :void => {
        let {status,body} =  httpresponse;
        if(status === 200 && body){
          this.zielFreund = body;
          console.log(this.zielFreund);
        }
      },
      error: (err) => {
        if(err.status === 404){
          this.error('User not found', 'The name you entered does not exist')
        }else{
          this.error('Error occurred', err.statusText);
        }
        this.zielFreund = null;
      }
    })

  }

  //重置用户搜索对话框的状态
  BenutzerSuchFormularZurucksetzen(): void{
    let formular = this.benutzerSuchFormular;
    this.zielFreund = null;
    this.zielBenutzerName = "";
    formular.form.markAsPristine();
    formular.form.markAsUntouched();
    formular.form.updateValueAndValidity();
  }


  FreundschaftsanfrageSenden(): void{
    let user1 = this.angemeldeterBenutzer;
    if(!user1) return ;
    let id1 = user1.id;
    if(!id1) return;
    if(!this.zielFreund) return;
    let user2 = this.zielFreund.user;
    if(!user2) return ;
    let id2 = user2.id;
    if(!id2) return;

    this.friendService.sendFriendRequest(id1, id2).subscribe({
      next: (httpresponse) :void => {
        let{status, body} = httpresponse;
        if(status === 200){
          this.success('successful', 'The friend request has been sent');
          this.zeigenUserSearchDialog = false;
        }
      },
      error:(err) => this.error('Error occurred', err.statusText)
    })
  }

  //接受或拒绝好友请求
  AnfrageAnnehmenOderAblehnen(request: FriendRequest, status: number){
    const currentRequestStatus = request.requestStatus;
    request.requestStatus = status;

    this.friendService.acceptOrRejectFriendRequest(request).subscribe({
      next: (httpresponse) :void => {
        if(httpresponse.status === 200){
          if(status === 1){
            this.alleFreunde.push(request.sendUser);
            this.alleFreunde.sort((freund1, freund2) => freund1.lastname.localeCompare(freund2.lastname));

            this.success('successful', 'The friend request was accepted');
          }
          else if(status === 2){
            this.success('successful', 'The friend request was rejected');
          }

          if(this.neueFreundschaftsanfragen){
            let newRequestNumber = parseInt(this.neueFreundschaftsanfragen);
            newRequestNumber -- ;
            if(newRequestNumber != 0){
              this.neueFreundschaftsanfragen = newRequestNumber.toString();
            }else{
              this.neueFreundschaftsanfragen = "";
            }
          }

        }
      },
      error:(err) => {
        request.requestStatus = currentRequestStatus;
        this.error('Error occurred', err.statusText);
      }
    })
  }

  aktualisierenListStatus(): void{
    let loggedUser = this.angemeldeterBenutzer;
    if(!loggedUser) return;
    let id = loggedUser.id;
    if(!id) return;
    let isPublic = this.istListeoffentlich;
    this.friendService.updateListStatus(id,isPublic).subscribe({
      next: (httpresponse) :void => {
        let {status} = httpresponse;
        if(status === 200){
          if(isPublic){
            this.success('successful', 'The friends list is set to public');
          }
          else{
            this.success('successful', 'The friends list is set to private');
          }
        }

      },
      error:(err) =>{
        isPublic = !isPublic;
        this.error('Error occurred', err.statusText);
      }
    })
  }

  offnenFreundesliste(): void{
    this.zeigenFreundesliste = true;
  }

  // 点击好友列表中的好友时，显示好友详情
  klickenAufFreundListItem(freund: User): void{
    this.ausgewahlteFreundeslisteElementID = freund.id;
    this.friendService.gewählterFreund = freund;
    if(!freund.id) return;
    this.friendService.getListStatus(freund.id).subscribe({
      next: (httpresponse) :void => {
        let {status,body} = httpresponse;
        if(status === 200){
          this.friendService.gewählterFreundListStatus = body;
          this.friendService.alleFreunde = this.alleFreunde;
          void this.router.navigateByUrl("/friend-list" + freund.id);
        }
      },
      error:(err) => this.error('Error occurred', err.statusText)
    })

  }

  getItemClass(freund: User): string{
    if(freund.id == this.ausgewahlteFreundeslisteElementID){
      return 'FriendListItemSelected';
    }else{
      return 'FriendListItemNotSelected';
    }
  }


  goToHomePage(): void {
      this.router.navigateByUrl('/homepage-user');
  }

  toggleFunctionality() {
    this.showAddFriendPopup = !this.showAddFriendPopup;
  }

  closeAddFriendPopup() {
    this.showAddFriendPopup = false;
  }

  closeAddFriendConfirmationPopup() {

  }

  showDeleteFriendConfirmationPopup() {
    this.showDeleteFriendConfirmation = true;
  }

  deleteFriend(): void {
  }

  closeDeleteFriendConfirmationPopup() {
    this.showDeleteFriendConfirmation = false;
  }
}
