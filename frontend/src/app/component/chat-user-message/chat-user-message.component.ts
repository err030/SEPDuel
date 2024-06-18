import {ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {FriendService} from "../../service/friend.service";
import {User} from "../../model/user";
import {UserService} from "../../service/user.service";
import {WebSocketSubject} from "rxjs/webSocket";
import {interval, Subscription} from "rxjs";
import {Global} from "../../../global";
import {DividerModule} from "primeng/divider";
import {ScrollerModule} from "primeng/scroller";
import {NgClass, NgIf} from "@angular/common";
import {DialogModule} from "primeng/dialog";
import {FormsModule} from "@angular/forms";
import {ButtonModule} from "primeng/button";
import {AvatarModule} from "primeng/avatar";
import { Scroller } from 'primeng/scroller'

interface Message {
  uuid:string;
  chatGroupId?: string;
  fromUuid:string;
  msgContent: string;
  sender: '';
  senderType: 'me' | 'friend';
  recipient: '',
  isRead:boolean;
  msgType?: string; // 添加msgType属性，注意它是可选的
}



@Component({
  selector: 'app-chat-user-message',
  standalone: true,
  imports: [
    DividerModule,
    ScrollerModule,
    NgClass,
    DialogModule,
    FormsModule,
    ButtonModule,
    NgIf,
    AvatarModule
  ],
  templateUrl: './chat-user-message.component.html',
  styleUrls: ['./chat-user-message.component.css']
})
export class ChatUserMessageComponent implements OnInit {
  selectedFriendId: number | null = null;
  loggedUser: User | null = null;
  selectedFriend: User | null = null;

  allMSGs: Message[] = [];
  showAllMSGs: boolean = false;

  msgList: Message[] = [];

  textareaInput: string = '';
  allFriends: User[] = [];

  @ViewChild('scroller') scroller!: Scroller;

  socket$: WebSocketSubject<{ fromUuid: string; senderType: string; msgType: string; msgContent: string }> | undefined;
  public messages: { id: string, message: string }[] = [];
  public message: string | undefined;
  public isOffline: boolean = false;
  public showUnReadMsgDialog: boolean = false;
  public msgIsRead: boolean = false;

  editUnReadMsg: string = '';
  public editMsgUuid: string = '';
  // @ts-ignore
  public subscription: Subscription;

  constructor(private activatedRoute: ActivatedRoute,
              private friendService: FriendService,
              private userService: UserService,
              private changeDetector: ChangeDetectorRef
  ) {
  }

  public getAllFriends(loggedUser: User) : Promise<void> {
    return new Promise(resolve => {
      // 获取当前用户的所有好友
      this.friendService.getAllFriends(loggedUser.id as number).subscribe({
        next: (response) => {
          if (response.status == 200 && response.body) {
            this.allFriends = response.body;
            this.allFriends.sort((friend1, friend2) => friend1.lastname.localeCompare(friend2.lastname));
            resolve()
          }
        },
        error: (error) => {
          alert(error.statusText)
        }
      });
    })
  }

  async ngOnInit() {
    this.loggedUser = this.userService.loggedUser;
    if (this.loggedUser && this.loggedUser.id) {
      // 获取当前用户的所有好友
      await this.getAllFriends(this.loggedUser)
      // 获取路由参数id
      this.activatedRoute.paramMap.subscribe(params => {
        console.log(params)
        const selectedFriendIdParam = params.get('friendId');
        //判断是从哪个按钮 来自 Friend界面 还是主界面的chatten
        if (selectedFriendIdParam != null) {
          this.selectedFriendId = parseInt(selectedFriendIdParam); //从好友列表 选中具体的好友后获取他的 Userid (= value.id) selectedFriendId是个全局变量
          // this.selectedUser = this.friendService.selectedFriend;
          //this.selectedChatListItemId = undefined;
          // 检查该好友是否已经在chatListFriends中
          //for (let user of this.chatListFriends) {
          // if (user.id == this.selectedFriendId) {
          //  this.selectedChatListItemId = user.id; //现在 正在和哪个好友聊天  保存和当前用户正在聊天的好友的id
          // break;
          // }
          // 如果不存在，添加到chatListFriends的第一个
          /*
          对用户的所有friend进行遍历 寻找与selectedFriendId 匹配的好友Object
          循环的目的: 只知道聊天对象的id  但是不知道聊天对象是谁，为了获取到对象
           */
          //  if (this.selectedChatListItemId == undefined) {
          console.log(this.allFriends, 'allFriends=====')
          for (let friend of this.allFriends) {
            if (friend.id == this.selectedFriendId) {
              //    this.chatListFriends.unshift(friend); //unshift 方法会将friend这个对象 添加到数组的首个位置
              this.selectedFriend = friend;
              console.log(this.selectedFriend);
              //    this.selectedChatListItemId = this.selectedFriendId;
              break;
            }
          }

          //this.activeIndex = 0; //切换聊天对象的index ??
          console.log('chat messagelist :', this.msgList);
          const msgListData = localStorage.getItem('msgList');
          if (msgListData != undefined && msgListData != null) {

            this.msgList = JSON.parse(msgListData);
          }
          console.log(this.msgList)
          //@ts-ignore
          this.allMSGs = this.msgList.filter(message => (message.sender === this.loggedUser?.id && message.recipient === this.selectedFriendId) || (message.sender === this.selectedFriendId && message.recipient === this.loggedUser?.id)).filter(i => !i.chatGroupId);
          console.log(this.allMSGs);
          setTimeout(() => {
            this.changeDetector.detectChanges(); //手动刷新 试图
          })
          this.showAllMSGs = true;

          setTimeout(() => {
            this.scroller.scrollToIndex(999999, 'smooth');
          }, 100);

          console.log('chat allMSGs :', this.allMSGs);
        }
      })

      this.socket$ = new WebSocketSubject('ws://localhost:8080/websocket/'+this.loggedUser?.id);
      /*
      WebSocket知识点 是一个长连接，服务器去和客户端始终保持连接， 消息发送方与接收方必须同时在线才能实现信息的传递  使用的是 UDP协议 好处是 1.节约资源  缺点是 1.延迟 2.不能保证接收方 是否真的能收到消息
       */

      // 处理收到的消息
      let that = this;

      this.socket$.subscribe(
        (message: any) => {
          if (message.chatGroupId) return
          console.log('Received message:', message);

          if(message!=null&&message.msgType!=undefined&&message.msgType=='server'){
            const friendOffline = this.selectedFriendId+'_offline';
            if(message.msgContent==friendOffline){
              this.isOffline=true;
              message.msgContent='';
              return;
            }
            const newUserState = this.selectedFriendId +'|new_user';
            if(message.msgContent==newUserState){
              this.isOffline=false;
              message.msgContent='';

              /*     Warum makieren wir alle nachrichten als gelesen?
                          this.allMSGs.forEach(msg => {
                            msg.isRead=true;
                          });
              */

              return;
            }
            return;
          }

          if(message!=null&&message.msgType!=undefined&&message.msgType=='backToMsgRead'){

            console.log("Nachrichtenverarbeitung gelesen oder ungelesen：",message.fromUuid);
            //    this.editMsgReadState(message.fromUuid);
            //Das hier macht das gleiche wie editMsgReadState nur ohne Fehler.
            this.allMSGs.forEach(msg => {
              if(message.fromUuid == msg.uuid)
              {
                msg.isRead=true;
              }
            });
            localStorage.setItem("msgList",JSON.stringify(this.allMSGs));
            return;
          }


          console.log('Ist der Benutzer offline：',this.isOffline)

          const temp=JSON.stringify(this.allMSGs);
          //console.log(temp);
          that.allMSGs=[];
          that.allMSGs=JSON.parse(temp);

          const msg: Message = {
            // @ts-ignore
            fromUuid:message.fromUuid,
            // @ts-ignore
            msgContent: message.msgContent,
            // @ts-ignore
            sender: this.selectedFriendId,
            senderType:'friend',
            // @ts-ignore
            recipient:this.loggedUser.id
          };
          console.log(msg);
          that.allMSGs.push(msg);
          this.msgList.push(msg);

          setTimeout(() => {
            this.scroller.scrollToIndex(999999, 'smooth');
          }, 100);

          localStorage.setItem("msgList",JSON.stringify(this.msgList));


          let backToMsg: Message = {
            // @ts-ignore
            uuid: msg.fromUuid,

            // @ts-ignore

            isRead: true,
            msgType: 'backToMsgRead', // 正确使用msgType属性

            // @ts-ignore
            recipient: this.selectedFriendId

          };
          console.log("backToMsg.uuid:",msg.fromUuid);
          if(backToMsg.uuid!=undefined&&backToMsg!=null&&message.senderType==='friend'){
            console.log(backToMsg);
            // @ts-ignore
            that.socket$.next(backToMsg);
            return;
          }



        },
        (error) => console.error('WebSocket error:', error),
        () => console.log('WebSocket connection closed')
      );

      //Schicke alle nicht gelsenden nachrichten nochmal, alle 2 sekunden
      const source = interval(2000);
      this.subscription = source.subscribe(val => this.send_All_Unread_Messages_Again(null));

    }

  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  //sendet alle ungelesenen nachrichten nochmal außer die
  send_All_Unread_Messages_Again(current_message : Message | null): void
  {
    // this.allMSGs.forEach(c_message => {
    //   if(c_message.isRead == false && c_message !== current_message)
    //   {
    //     // @ts-ignore
    //     this.socket$.next(c_message);
    //   }
    // });
    // console.log("send_All_Unread_Messages_Again");
  }

  sendMessage(): void {
    console.log("SEND MESSAGE");
    console.log(this.textareaInput.trim());

    const temp=JSON.stringify(this.allMSGs);
    this.allMSGs=[];
    this.allMSGs=JSON.parse(temp);
    const msgUuid = Math.floor(Math.random() * 100000);
    const message: Message = {
      // @ts-ignore
      uuid:msgUuid,
      msgContent: this.textareaInput.trim(),
      // @ts-ignore
      sender: this.loggedUser.id,
      senderType:'me',
      // @ts-ignore
      recipient:this.selectedFriendId,
      isRead:false,
      msgType: 'user_chat'
    };
    console.log('message:', message, 'this.selectedFriendId:', this.selectedFriendId);
    this.allMSGs.push(message);
    this.msgList.push(message);

    localStorage.setItem("msgList",JSON.stringify(this.msgList));

    this.textareaInput = ''; // Clear the input field

    this.send_All_Unread_Messages_Again(message);

    // @ts-ignore
    this.socket$.next(message);

    this.message = '';
    setTimeout(() => {
      this.scroller.scrollToIndex(999999, 'smooth');
    }, 100);
  }

  public deleteMessage(id: string): void {
    this.allMSGs = this.allMSGs.filter(message => message.uuid !== id);
    const localMsgList=localStorage.getItem('msgList');
    if(localMsgList!=undefined&&localMsgList!=null&&localMsgList!=''){
      let msgListObj=JSON.parse(localMsgList);
      msgListObj=msgListObj.filter((message: Message) => message.uuid !== id);
      localStorage.setItem("msgList",JSON.stringify(msgListObj));
    }

  }
  public editMessage(id: string): void {
    this.showUnReadMsgDialog=true;
    this.editMsgUuid=id;
    const messageIndex = this.allMSGs.findIndex(message => message.uuid === id);
    if (messageIndex !== -1) {
      this.editUnReadMsg = this.allMSGs[messageIndex].msgContent;
      this.allMSGs[messageIndex].msgContent = this.editUnReadMsg;

    }
  }

  public confirmEditMessage(id: string): void {
    this.showUnReadMsgDialog=false;
    const messageIndex = this.allMSGs.findIndex(message => message.uuid === id);
    if (messageIndex !== -1) {
      this.allMSGs[messageIndex].msgContent = this.editUnReadMsg;
      this.editMsgUuid='';
      const localMsgList=localStorage.getItem('msgList');
      if(localMsgList!=undefined&&localMsgList!=null&&localMsgList!=''){
        let msgListObj: Message[] = [];
        msgListObj =  JSON.parse(localMsgList);
        const msgIndex= msgListObj.findIndex(message => message.uuid === id);
        msgListObj[msgIndex].msgContent = this.editUnReadMsg;
        localStorage.setItem("msgList",JSON.stringify(msgListObj));
      }
    }
  }

  /**
   * Ermittelt die Adresse des Avatars des Nutzers oder gibt die Initialen zurück,
   * wenn kein Avatar hochgeladen wurde
   */
  getUserAvatarUrl(senderType:string): string {
    if (senderType==='me'&& this.loggedUser) {
      return this.loggedUser.lastname.charAt(0)+this.loggedUser.firstname.charAt(0) ;
    }
    else if (senderType==='friend'&& this.selectedFriend) {
      return this.selectedFriend.lastname.charAt(0)+this.selectedFriend.firstname.charAt(0) ;
    } else {
      return "";
    }

  }
}
