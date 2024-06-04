import {Component, ViewChild } from '@angular/core';
import {OnInit} from "@angular/core";
import {ActivatedRoute} from "@angular/router";
import {FriendService} from "../../service/friend.service";
import {User} from "../../model/user";
import {UserService} from "../../service/user.service";
import {WebSocketSubject} from "rxjs/webSocket";
import {Global} from "../../global";
import {Chatgroup} from "../../model/chatgroup";
import {ChatgroupService} from "../../service/chatgroup.service";
import {ButtonModule} from "primeng/button";
import {DividerModule} from "primeng/divider";
import {ScrollerModule} from "primeng/scroller";
import {NgClass, NgIf} from "@angular/common";
import {AvatarModule} from "primeng/avatar";
import {DialogModule} from "primeng/dialog";
import {FormsModule} from "@angular/forms";



interface Message {
  uuid: string;
  fromUuid: string;
  chatGroupId: number | undefined;
  msgContent: string;
  sender: '';
  senderType: 'me' | 'friend';
  msgType: string;
  recipient: '',
  isRead: boolean;
}
@Component({
  selector: 'app-chat-user-message',
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

  @ViewChild('scoller')
  scroller: any;

  socket$: WebSocketSubject<{ fromUuid: string; chatGroupId: number; sender: string; senderType: string; msgType: string; msgContent: string }> | undefined;
  public messages: { id: string, message: string }[] = [];
  public message: string | undefined;
  public isOffline: boolean = false;
  public showUnReadMsgDialog: boolean = false;
  public msgIsRead: boolean = false;
  editUnReadMsg: string = '';
  public editMsgUuid: string = '';

  constructor(private activatedRoute: ActivatedRoute,
              private friendService: FriendService,
              private chatGroupService: ChatgroupService,
              private userService: UserService) {
  }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe(parameters => {
      const groupIdParam = parameters.get('groupId');
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

        console.log('chat allMSGs :', this.allMSGs);
      }
    })

    this.socket$ = new WebSocketSubject('ws://localhost:8080/websocket/' + this.loggedUser?.id);

      let that = this;

    this.socket$.subscribe(
      (message) => {
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


        const temp = JSON.stringify(this.allMSGs);
        //console.log(temp);
        that.allMSGs = [];
        that.allMSGs = JSON.parse(temp);

        const msg: Message = {
          // @ts-ignore
          fromUuid: message.fromUuid,
          chatGroupId: message.chatGroupId,
          // @ts-ignore
          msgContent: message.msgContent,
          // @ts-ignore
          sender: message.sender,
          // @ts-ignore
          recipient: this.selectedChatGroup?.chatUserIds,
          senderType: 'friend',
          msgType: 'group_chat'
        };
        console.log(msg);
        that.allMSGs.push(msg);
        this.msgList.push(msg);

        localStorage.setItem("groupMsgList", JSON.stringify(this.msgList));
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
      this.scroller.scrollToIndex(this.allMSGs.length, 'smooth');
    }, 50);
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

  public resetSendMsg(id: string): void {
    const msgIndex = this.allMSGs.findIndex(message => message.uuid === id);
    if (msgIndex !== -1) {

      let temp = JSON.stringify(this.allMSGs);
      this.allMSGs = [];
      this.allMSGs = JSON.parse(temp);

      const message: Message = {
        // @ts-ignore
        uuid: id,
        msgContent: this.allMSGs[msgIndex].msgContent,
        // @ts-ignore
        sender: this.loggedUser.id,
        senderType: 'me',
        // @ts-ignore
        recipient: this.friendId,
        isRead: false
      };

      // @ts-ignore
      this.socket$.next(message);

      setTimeout(() => {
        this.scroller.scrollToIndex(this.allMSGs.length, 'smooth');
      }, 50);
    }
  }

  public editMsgReadState(id: string): void {


    const messageIndex = this.allMSGs.findIndex(message => message.uuid == id);
    console.log(this.allMSGs);
    console.log("messageIndex ceshi:", messageIndex);
    if (messageIndex !== -1) {
      console.log("this.allMSGs[messageIndex].isRead:", this.allMSGs[messageIndex].isRead);
      this.allMSGs[messageIndex].isRead = true;


      const localMsgList = localStorage.getItem('groupMsgList');
      if (localMsgList != undefined && localMsgList != null && localMsgList != '') {
        let msgListObj: Message[] = [];
        msgListObj = JSON.parse(localMsgList);
        const msgIndex = msgListObj.findIndex(message => message.uuid == id);
        msgListObj[msgIndex].isRead = true;
        localStorage.setItem("groupMsgList", JSON.stringify(msgListObj));
      }
    }
  }

  getUserAvatarWord(user: User): string {
    return user.lastname.charAt(0) + user.firstname.charAt(0);
  }


  /**
   * Ermittelt die Adresse des Avatars des Nutzers oder gibt die Initialen zurück,
   * wenn kein Avatar hochgeladen wurde
   */
  getUserAvatarUrl(senderType: string, senderId: number): string {

    this.groupUserList.forEach(userItem =>{
      if(userItem.id==senderId){
        this.selectedFriend=userItem;
      }

    })

    if (senderType === 'me' && this.loggedUser && this.loggedUser.avatarUrl) {
      return Global.backendUrl + this.loggedUser.avatarUrl;
    } else if (senderType === 'me' && this.loggedUser && !this.loggedUser.avatarUrl) {
      return this.loggedUser.lastname.charAt(0) + this.loggedUser.firstname.charAt(0);
    } else if (senderType === 'friend' && this.selectedFriend && this.selectedFriend.avatarUrl) {
      return Global.backendUrl + this.selectedFriend.avatarUrl;
    } else if (senderType === 'friend' && this.selectedFriend && !this.selectedFriend.avatarUrl) {
      return this.selectedFriend.lastname.charAt(0) + this.selectedFriend.firstname.charAt(0);
    } else {
      return "";
    }

  }

  public getGroupUserAvatarUrl(groupUser:User): string {
    return Global.backendUrl + groupUser.avatarUrl;
  }

  openFriendList(): void {
    this.showGroupUserList=true;
  }

}
