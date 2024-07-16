import {Component, ViewChild } from '@angular/core';
import {OnInit} from "@angular/core";
import {ActivatedRoute} from "@angular/router";
import {User} from "../../model/user";
import {UserService} from "../../service/user.service";
import {WebSocketSubject} from "rxjs/webSocket";
import {Clan} from "../../model/clan";
import {ClanService} from "../../service/clan.service";
import {ButtonModule} from "primeng/button";
import {DividerModule} from "primeng/divider";
import {ScrollerModule} from "primeng/scroller";
import {NgClass, NgIf, CommonModule} from "@angular/common";
import {AvatarModule} from "primeng/avatar";
import {FormsModule} from "@angular/forms";
import { Scroller } from 'primeng/scroller'
import {Router} from "@angular/router";


interface Message {
  uuid: string;
  fromUuid: string;
  chatGroupId?: number | undefined;
  msgContent: string;
  sender: number;
  senderType: 'me' | 'friend';
  msgType: string;
  recipient: '',
  isRead: boolean;
}
@Component({
  selector: 'app-clan-group-message',
  standalone: true,
  imports: [
    ButtonModule,
    DividerModule,
    ScrollerModule,
    NgClass,
    AvatarModule,
    NgIf,
    CommonModule,
    FormsModule
  ],
  templateUrl: './clan-group-message.component.html',
  styleUrls: ['./clan-group-message.component.css']
})
export class ClanGroupMessageComponent implements OnInit{
  loggedUser: User | null = null;

  myClan: Clan | null = null;

  allMSGs: Message[] = [];

  textareaInput: string = '';

  clanId: number | null = null;

  @ViewChild('scroller') scroller!: Scroller;

  socket$: WebSocketSubject<{ fromUuid: string; chatGroupId: number; sender: string; senderType: string; msgType: string; msgContent: string }> | undefined;
  public message: string | undefined;

  constructor(private activatedRoute: ActivatedRoute,
              private clanService: ClanService,
              private userService: UserService,
              private router: Router) {
  }

  public getClanInfo(id: number | undefined) : Promise<void>  {
    return new Promise(resolve => {
      this.clanService.getClanMembers(id as number).subscribe(
        response => {
          this.myClan = response.body ?? new Clan();
          resolve()
        }
      );
    })
  }

  async ngOnInit() {
    await this.getClanInfo(this.userService.loggedUser?.clanId)

    this.activatedRoute.paramMap.subscribe(parameters => {
      const clanIdParam = parameters.get('clanId');
      console.log('clanIdParam: ', clanIdParam)
      if (clanIdParam != null) {
        this.clanId = parseInt(clanIdParam);
        this.loggedUser = this.userService.loggedUser;
        console.log(this.loggedUser, this.myClan)

        const msgListData = localStorage.getItem('groupMsgList');
        if (msgListData != undefined && msgListData != null) {

          this.allMSGs = JSON.parse(msgListData);
        }

        setTimeout(() => {
          this.scroller.scrollToIndex(999999, 'smooth');
        }, 100);

        console.log('chat allMSGs :', this.allMSGs);
      }
    })

    this.socket$ = new WebSocketSubject('ws://localhost:8080/websocket/' + this.loggedUser?.id);

    this.socket$.subscribe(
      (message) => {
        if (!message.chatGroupId || message.chatGroupId != this.myClan?.id) return
        console.log('Received message:', message);

        const temp = JSON.stringify(this.allMSGs);
        //console.log(temp);
        this.allMSGs = [];
        this.allMSGs = JSON.parse(temp);

        const msg: Message = {
          // @ts-ignore
          fromUuid: message.uuid,
          chatGroupId: message.chatGroupId,
          // @ts-ignore
          msgContent: message.msgContent,
          // @ts-ignore
          sender: message.sender,
          // @ts-ignore
          recipient: this.myClan?.users.map(user => user.id).join(','),

          senderType: 'friend',
          msgType: 'group_chat',
          isRead: false
        };
        console.log(msg);

        this.allMSGs.push(msg);


        setTimeout(() => {
          this.scroller.scrollToIndex(999999, 'smooth');
        }, 100);

        localStorage.setItem("groupMsgList", JSON.stringify(this.allMSGs));
      },
      (error) => console.error('WebSocket error:', error),
      () => console.log('WebSocket connection closed')
    );

 }

  goMyClan() {
    this.router.navigate(['/clan']);
  }

  sendMessage(){
    const temp = JSON.stringify(this.allMSGs);
    this.allMSGs = [];
    this.allMSGs = JSON.parse(temp);
    const msgUuid = Math.floor(Math.random() * 1000000);

    const message: Message = {
      // @ts-ignore
      uuid: msgUuid,
      chatGroupId: this.myClan?.id,
      msgContent: this.textareaInput.trim(),
      // @ts-ignore
      sender: this.loggedUser.id,
      senderType: 'me',
      // @ts-ignore
      recipient: this.myClan?.users.map(user => user.id).join(','),
      msgType: 'group_chat'
    };

    this.allMSGs.push(message);

    localStorage.setItem("groupMsgList", JSON.stringify(this.allMSGs));

    this.textareaInput = ''; // Clear the input field

    // @ts-ignore
    this.socket$.next(message);

    this.message = '';
    setTimeout(() => {
      this.scroller.scrollToIndex(999999, 'smooth');
    }, 100);
  }


  getUserAvatarUrl(senderType: string, senderId: number): string {
    let selectedFriend: User | null = null

    this.myClan?.users.forEach(userItem =>{
      if(userItem.id==senderId){
        selectedFriend=userItem;
      }
    })

    if (senderType === 'me' && this.loggedUser) {
      return this.loggedUser.lastname.charAt(0) + this.loggedUser.firstname.charAt(0);
    } else if (senderType === 'friend' && selectedFriend ) {
      return (selectedFriend as User)?.lastname.charAt(0) + (selectedFriend as User).firstname.charAt(0);
    } else {
      return "";
    }

  }
}
