import {ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {FriendService} from "../../service/friend.service"; //getAllFriends()
import {User} from "../../model/user";
import {UserService} from "../../service/user.service"; //getUserByUserId(userId:number)
import {WebSocketSubject} from "rxjs/webSocket";
import {interval, Subscription} from "rxjs"; //定时器  订阅Observable的方法
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
  msgType?: string;
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
  public isOffline: boolean = false;
  public showUnReadMsgDialog: boolean = false;

  public editUnReadMsg: string = '';
  public editMsgUuid: string = '';
  // @ts-ignore
  public subscription: Subscription;

  constructor(private activatedRoute: ActivatedRoute,
              private friendService: FriendService,
              private userService: UserService,
              private changeDetector: ChangeDetectorRef
  ) {
  }

  /*
  Diese Methode enthält eine asynchrone Operation und keinen Wert zurückgibt
   */
  public getAllFriends(loggedUser: User) : Promise<void> {
    return new Promise(resolve => {
      // 获取当前用户的所有好友
      this.friendService.getAllFriends(loggedUser.id as number).subscribe({
        next: (response) => {
          if (response.status == 200 && response.body) {
            this.allFriends = response.body;
            this.allFriends.sort((friend1, friend2) => friend1.lastname.localeCompare(friend2.lastname));
            resolve() // 调用resolve()函数 表示Promise异步操作结束 状态从等待 改变为成功 ( resolve() löst das Promise auf )
          }
        },
        error: (error) => {
          alert(error.statusText)
        }
      });
    })
  }

  /*
  每次从别的页面 跳转到chat user message页面 都会执行ngOnInit()里的所有方法
  但是如果只是在 chat user message页面内 更换不同的好友时，不会执行await，但是每次更换好友时都会执行 109里的方法
   */
  async ngOnInit() {
    this.loggedUser = this.userService.loggedUser;
    if (this.loggedUser && this.loggedUser.id) {
      // 获取当前用户的所有好友
      await this.getAllFriends(this.loggedUser)
      // 获取路由参数id
      this.activatedRoute.paramMap.subscribe(params => { //订阅了 ActivatedRoute的 paramMap()事件
        console.log(params) //params 中实际只有friendId 这个参数
        const selectedFriendIdParam = params.get('friendId'); //Map中 get的方法 获取这个"friendId"key 对应的 value
        if (selectedFriendIdParam != null) {
          this.selectedFriendId = parseInt(selectedFriendIdParam);
          /*
          对用户的所有friend进行遍历 寻找与selectedFriendId 匹配的好友Object
          循环的目的: 只知道聊天对象的id  但是不知道聊天对象是谁，为了获取到对象
           */
          console.log(this.allFriends, 'allFriends=====')
          for (let friend of this.allFriends) {
            if (friend.id == this.selectedFriendId) {
              this.selectedFriend = friend;
              console.log(this.selectedFriend);
              break;
            }
          }

          const msgListData = localStorage.getItem('msgList'); //localStorage 是 Web 浏览器提供的一种存储机制，它允许你在用户的浏览器中存储键值对，数据的生命周期在页面关闭后仍然存在。
          if (msgListData != undefined && msgListData != null) {
            this.msgList = JSON.parse(msgListData);
          }

          //@ts-ignore
          this.allMSGs = this.msgList.filter(message => (message.sender === this.loggedUser?.id && message.recipient === this.selectedFriendId) || (message.sender === this.selectedFriendId && message.recipient === this.loggedUser?.id)).filter(i => !i.chatGroupId);

          setTimeout(() => {
            this.changeDetector.detectChanges();
          })
          this.showAllMSGs = true;

          setTimeout(() => {
            this.scroller.scrollToIndex(999999, 'smooth');
          }, 100);

        }
      })

      this.socket$ = new WebSocketSubject('ws://localhost:8080/websocket/'+ this.loggedUser?.id);

      // 处理收到的消息
      let that = this;

      this.socket$.subscribe(
        (message: any) => {
          if (message.chatGroupId) return

          if(message!=null&&message.msgType!=undefined&&message.msgType=='server'){
            const friendOffline = this.selectedFriendId+'_offline';
            if(message.msgContent==friendOffline){
              this.isOffline=true;
              message.msgContent='';
              return; //结束整个socket$的订阅方法
            }
            const newUserState = this.selectedFriendId +'|new_user';
            if(message.msgContent==newUserState){
              this.isOffline=false;
              message.msgContent='';

              return;
            }
            return;
          }

          if(message!=null&&message.msgType!=undefined&&message.msgType=='backToMsgRead'){ //'backToMsgRead'是 来自WebSocket消息 的消息类型 这是固定的！

            this.allMSGs.forEach(msg => {
              /*message是 Websocket发给我(我是发送方) 的消息，消息类型为'backToMsgRead'，

              我主动给好友发送消息 message 只包含fromUuid,isRead,msgType3个属性  isRead属性一定为True！
             */
              if(message.fromUuid == msg.uuid)
              {
                msg.isRead=true;
              }
            });
            localStorage.setItem("msgList",JSON.stringify(this.allMSGs));
            return;
          }


          const temp=JSON.stringify(this.allMSGs);

          that.allMSGs=[];
          that.allMSGs=JSON.parse(temp);

          /*
          如果好友主动给我发消息， message 只包含fromUuid，msgContent，senderType3个属性
           */
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
            msgType: 'backToMsgRead',

            // @ts-ignore
            recipient: this.selectedFriendId

          };

          if(backToMsg.uuid!=undefined&&backToMsg!=null&&message.senderType==='friend'){
            // @ts-ignore
            that.socket$.next(backToMsg);
            /*
            .next() 表示通过 WebSocket 连接发送 backToMsg 消息到服务器。
            Die backToMsg-Nachricht wird über die WebSocket-Verbindung an den Server gesendet.
             */
            return;
          }



        },
        (error) => console.error('WebSocket error:', error),
      );

    }
    const source = interval(2000);
    this.subscription = source.subscribe(val => this.send_All_Unread_Messages_Again(null));

  }

  //sendet alle ungelesenen nachrichten nochmal jede 2 Sekunden
  send_All_Unread_Messages_Again(current_message : Message | null): void
  {
    this.allMSGs.forEach(c_message => {
      if(c_message.isRead == false && c_message !== current_message)
      {
        // @ts-ignore
        this.socket$.next(c_message);
      }
    });
  }

  sendMessage(): void {
    const temp=JSON.stringify(this.allMSGs);
    this.allMSGs=[];
    this.allMSGs=JSON.parse(temp); // 反序列化之前的消息列表
    const msgUuid = Math.floor(Math.random() * 100000); //Math.random()指 [0,1)的一个浮点数 * 100000 得到一个 0-99999 的随机数, Math.floor() 作用是去掉小数部分，保留整数
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
    if(message.msgContent != ''){ //避免发送空信息
    this.allMSGs.push(message);
    this.msgList.push(message);

    localStorage.setItem("msgList",JSON.stringify(this.msgList));

    this.textareaInput = '';

    this.send_All_Unread_Messages_Again(message);

    // @ts-ignore
    this.socket$.next(message);

    setTimeout(() => {
      this.scroller.scrollToIndex(999999, 'smooth');
    }, 100);
  }
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
        let msgListObj =  JSON.parse(localMsgList);
        const msgIndex= msgListObj.findIndex((message: Message) => message.uuid === id);
        msgListObj[msgIndex].msgContent = this.editUnReadMsg;
        localStorage.setItem("msgList",JSON.stringify(msgListObj));
      }
    }
  }

  /**
   *Gibt die Initialen zurück,
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
