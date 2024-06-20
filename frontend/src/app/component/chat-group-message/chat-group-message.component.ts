import {Component, ViewChild } from '@angular/core';
import {OnInit} from "@angular/core";
import {ActivatedRoute} from "@angular/router";
import {User} from "../../model/user";
import {UserService} from "../../service/user.service";
import {WebSocketSubject} from "rxjs/webSocket";
import {Chatgroup} from "../../model/chatgroup";
import {ChatgroupService} from "../../service/chatgroup.service";
import {ButtonModule} from "primeng/button";
import {DividerModule} from "primeng/divider";
import {ScrollerModule} from "primeng/scroller";
import {NgClass, NgIf} from "@angular/common";
import {AvatarModule} from "primeng/avatar";
import {DialogModule} from "primeng/dialog";
import {FormsModule} from "@angular/forms";
import { Scroller } from 'primeng/scroller'



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
  selector: 'app-chat-group-message',
  standalone: true,
  imports: [
    ButtonModule,
    DividerModule,
    ScrollerModule,
    NgClass,
    AvatarModule,
    DialogModule,
    FormsModule,
    NgIf
  ],
  templateUrl: './chat-group-message.component.html',
  styleUrls: ['./chat-group-message.component.css']
})
export class ChatGroupMessageComponent implements OnInit{
  friendId: number | null = null;
  loggedUser: User | null = null;
  selectedChatGroup: Chatgroup | null = null;

  allMSGs: Message[] = [];

  msgList: Message[] = [];

  textareaInput: string = '';

  groupId: number | null = null;

  selectedFriend: User | undefined;
  showGroupUserList: boolean = false;
  groupUserList: User[] = [];

  @ViewChild('scroller') scroller!: Scroller;

  socket$: WebSocketSubject<{ fromUuid: string; chatGroupId: number; sender: string; senderType: string; msgType: string; msgContent: string }> | undefined;
  public message: string | undefined;
  public isOffline: boolean = false;
  public showUnReadMsgDialog: boolean = false;
  editUnReadMsg: string = '';
  public editMsgUuid: string = '';

  constructor(private activatedRoute: ActivatedRoute,
              private chatGroupService: ChatgroupService,
              private userService: UserService) {
  }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe(parameters => {
      const groupIdParam = parameters.get('groupId');
      console.log('groupIdParam: ', groupIdParam)
      if (groupIdParam != null) {
        this.groupId = parseInt(groupIdParam);
        this.loggedUser = this.userService.loggedUser;
        this.selectedChatGroup = this.chatGroupService.selectedChatGroup;

        console.log('chat messagelist :', this.msgList);
        const msgListData = localStorage.getItem('groupMsgList');
        if (msgListData != undefined && msgListData != null) {

          this.msgList = JSON.parse(msgListData);
        }

        //@ts-ignore
        this.allMSGs = this.msgList.filter(message => (message.chatGroupId === this.selectedChatGroup?.id));

        setTimeout(() => {
          this.scroller.scrollToIndex(999999, 'smooth');
        }, 100);

      }
    })

    this.socket$ = new WebSocketSubject('ws://localhost:8080/websocket/' + this.loggedUser?.id);

      let that = this;

    this.socket$.subscribe(
      (message) => {
        if (!message.chatGroupId || message.chatGroupId != this.selectedChatGroup?.id) return
        console.log('Received message:', message);

        if (message != null && message.msgType != undefined && message.msgType == 'server') {
          const friendOffline = this.friendId + '_offline';
          if (message.msgContent == friendOffline) {
            this.isOffline = true;
            message.msgContent = '';
            return;
          }
          const newUserState = this.friendId + '|new_user';
          if (message.msgContent == newUserState) {
            this.isOffline = false;
            message.msgContent = '';

            return;
          }
          return;
        }

        // 检查消息是否已被阅读 没有任何改动
        if(message!=null&&message.msgType!=undefined&&message.msgType=='backToMsgRead'){

          this.allMSGs.forEach(msg => {
            if(message.fromUuid == msg.uuid)
            {
              msg.isRead=true;
            }
          });
          localStorage.setItem("msgList",JSON.stringify(this.allMSGs));
          return;
        }


        const temp = JSON.stringify(this.allMSGs);
        that.allMSGs = [];
        that.allMSGs = JSON.parse(temp);

        const msg: Message = {
          // @ts-ignore
          fromUuid: message.uuid,
          chatGroupId: message.chatGroupId,
          // @ts-ignore
          msgContent: message.msgContent,
          // @ts-ignore
          sender: message.sender,
          // @ts-ignore
          recipient: this.selectedChatGroup?.chatUserIds,
          senderType: 'friend',
          msgType: 'group_chat',
          isRead: false
        };
        console.log(msg);
        that.allMSGs.push(msg);
        this.msgList.push(msg);

        setTimeout(() => {
          this.scroller.scrollToIndex(999999, 'smooth');
        }, 100);

        localStorage.setItem("groupMsgList", JSON.stringify(this.msgList));

        let backToMsg: Message = {
          // @ts-ignore
          uuid: msg.fromUuid,

          // @ts-ignore

          isRead: true,
          msgType: 'backToMsgRead', // 正确使用msgType属性

          // @ts-ignore
          recipient: this.selectedChatGroup?.chatUserIds,
          fromUuid: msg.fromUuid,
          chatGroupId: this.selectedChatGroup?.id,
          sender: this.loggedUser?.id as number,
        };
        console.log("backToMsg.uuid:",msg.fromUuid);
        if(msg.chatGroupId==this.selectedChatGroup?.id && msg.recipient.split(',').includes(this.loggedUser?.id + '')){
          // @ts-ignore
          that.socket$.next(backToMsg);
          return;
        }
      },
      (error) => console.error('WebSocket error:', error),
      () => console.log('WebSocket connection closed')
    );

    this.selectedChatGroup?.chatUserIds.split(',').forEach(GroupUserId => {
      let intGroupUserId = parseInt(GroupUserId);
      this.userService.getUserByUserId(intGroupUserId).subscribe({
        next: (response) => {
          if (response.status == 200) {
            let user = <User>{};
            user = response.body;
            this.groupUserList.push(user)

          }
        },
        error: (error) => {
          console.log("error message:", error.statusText);
        }
      });
    });

 }

  sendMessage(){
    const temp = JSON.stringify(this.allMSGs);
    this.allMSGs = [];
    this.allMSGs = JSON.parse(temp);
    const msgUuid = Math.floor(Math.random() * 1000000);

    const message: Message = {
      // @ts-ignore
      uuid: msgUuid,
      chatGroupId: this.selectedChatGroup?.id,
      msgContent: this.textareaInput.trim(),
      // @ts-ignore
      sender: this.loggedUser.id,
      senderType: 'me',
      // @ts-ignore
      recipient: this.selectedChatGroup?.chatUserIds,
      msgType: 'group_chat'
    };

    this.allMSGs.push(message);
    this.msgList.push(message);

    localStorage.setItem("groupMsgList", JSON.stringify(this.msgList));

    this.textareaInput = ''; // Clear the input field

    // @ts-ignore
    this.socket$.next(message);

    this.message = '';
    setTimeout(() => {
      this.scroller.scrollToIndex(999999, 'smooth');
    }, 100);
  }

  public deleteMessage(id: string): void {

   this.allMSGs = this.allMSGs.filter(message => message.uuid !== id);
    const localMsgList = localStorage.getItem('groupMsgList');
    if (localMsgList != undefined && localMsgList != null && localMsgList != '') {
      let msgListObj = JSON.parse(localMsgList);
      msgListObj = msgListObj.filter((message: Message) => message.uuid !== id);
      localStorage.setItem("groupMsgList", JSON.stringify(msgListObj));
    }
  }

  public editMessage(id: string): void {

    this.showUnReadMsgDialog = true;
    this.editMsgUuid = id;
    const messageIndex = this.allMSGs.findIndex(message => message.uuid === id);
    if (messageIndex !== -1) {
      this.editUnReadMsg = this.allMSGs[messageIndex].msgContent;
      this.allMSGs[messageIndex].msgContent = this.editUnReadMsg;

    }
  }

  public confirmEditMessage(id: string): void {

    this.showUnReadMsgDialog = false;
    const messageIndex = this.allMSGs.findIndex(message => message.uuid === id);
    if (messageIndex !== -1) {
      this.allMSGs[messageIndex].msgContent = this.editUnReadMsg;
      this.editMsgUuid = '';

      const localMsgList = localStorage.getItem('groupMsgList');
      if (localMsgList != undefined && localMsgList != null && localMsgList != '') {
        let msgListObj: Message[] = [];
        msgListObj = JSON.parse(localMsgList);
        const msgIndex = msgListObj.findIndex(message => message.uuid === id);
        msgListObj[msgIndex].msgContent = this.editUnReadMsg;
        localStorage.setItem("groupMsgList", JSON.stringify(msgListObj));
      }
    }
  }


  getUserAvatarWord(user: User): string {
    return user.lastname.charAt(0) + user.firstname.charAt(0);
  }


  /**
   * Gibt die Initialen zurück,
   * wenn kein Avatar hochgeladen wurde
   */
  getUserAvatarUrl(senderType: string, senderId: number): string {

    this.groupUserList.forEach(userItem =>{
      if(userItem.id==senderId){
        this.selectedFriend=userItem;
      }
    })

    if (senderType === 'me' && this.loggedUser) {
      return this.loggedUser.lastname.charAt(0) + this.loggedUser.firstname.charAt(0);
    } else if (senderType === 'friend' && this.selectedFriend) {
      return this.selectedFriend.lastname.charAt(0) + this.selectedFriend.firstname.charAt(0);
    } else {
      return "";
    }

  }

  openFriendList(): void {
    this.showGroupUserList=true;
  }

}
