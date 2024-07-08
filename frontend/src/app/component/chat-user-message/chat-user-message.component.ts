import {ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {FriendService} from "../../service/friend.service"; //getAllFriends()
import {User} from "../../model/user"; // ../表示先回到上级目录component 再到app目录 最后找到model目录下的 user.ts
import {UserService} from "../../service/user.service"; //getUserByUserId(userId:number)
import {WebSocketSubject} from "rxjs/webSocket";
import {interval, Subscription} from "rxjs"; //定时器  订阅Observable的方法
import {Global} from "../../../global";
import {DividerModule} from "primeng/divider";
import {ScrollerModule} from "primeng/scroller"; //整个滚动的组件
import {NgClass, NgIf} from "@angular/common";
import {DialogModule} from "primeng/dialog"; //编辑消息时的弹框组件 html文件的第28行
import {FormsModule} from "@angular/forms";
import {ButtonModule} from "primeng/button"; // 按钮组件
import {AvatarModule} from "primeng/avatar"; //赋值给Label就展示文字， 赋值给image就展示图片
import { Scroller } from 'primeng/scroller'//是 'primeng/scroller'库中的另一个模块

interface Message {
  //主要目的: 定义了一个Message类型的 数据结构
  uuid:string; //随机生成 有极小概率会出现重复
  chatGroupId?: string;
  fromUuid:string;  // Websocket 发送的一个 类型为'backToMsgRead'
  msgContent: string;
  sender: '';
  senderType: 'me' | 'friend';
  recipient: '',
  isRead:boolean;
  msgType?: string; // 添加msgType属性，注意它是可选的
}



@Component({
  selector: 'app-chat-user-message', //是一个组件名   定义一个 selector的名字 方便后续调用
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
  templateUrl: './chat-user-message.component.html', //  ./表示和 当前目录同级， 在同一个目录下
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

  @ViewChild('scroller') scroller!: Scroller; // !: 表示 红色scroller这个变量 不会是 null或undefined。 'scroller'指的是 html第8行中的 #scroller

  socket$: WebSocketSubject<{ fromUuid: string; senderType: string; msgType: string; msgContent: string }> | undefined; //属性用于创建Object对象
  public isOffline: boolean = false;
  public showUnReadMsgDialog: boolean = false;  //后续 重新编辑信息时 要显示的对话框

  public editUnReadMsg: string = '';
  public editMsgUuid: string = ''; //在html里头需要用到 editMsgUuid 所以定义为一个全局变量
  // @ts-ignore
  public subscription: Subscription;

  constructor(private activatedRoute: ActivatedRoute,
              private friendService: FriendService,
              private userService: UserService,
              private changeDetector: ChangeDetectorRef  //构造器中 引用一些定义好的服务，路由
  ) {
  }

  /*
  Diese Methode enthält eine asynchrone Operation und keinen Wert zurückgibt
   */
  public getAllFriends(loggedUser: User) : Promise<void> {
    return new Promise(resolve => { //resolve是 Promise-Konstruktor 构造函数中的参数名, die zwei Parameter nimmt : resolve und reject
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
  但是如果只是在 chat user message页面内 更换不同的好友时，不会执行 第108行的 await，但是每次更换好友时都会执行 112行起 的后续方法
   */
  async ngOnInit() { //只要触发了内部的subscribe方法， subscribe自身不会停止，会一直执行到出现return语句 或者 不满足外部方法中 if的判定条件
    this.loggedUser = this.userService.loggedUser; //从 userService 获取当前登录的用户
    if (this.loggedUser && this.loggedUser.id) {
      // 获取当前用户的所有好友
      await this.getAllFriends(this.loggedUser)
      // 获取路由参数id
      this.activatedRoute.paramMap.subscribe(params => { //订阅了 ActivatedRoute的 paramMap() 事件 ,Map是一个key-value的集合 有什么知识点？
        console.log(params) //params 中实际只有firendId 这个参数
        const selectedFriendIdParam = params.get('friendId'); //Map中 get的方法 获取这个"friendId"key 对应的 value值 是个 string类型
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

          console.log('chat messagelist :', this.msgList);
          const msgListData = localStorage.getItem('msgList'); //localStorage 是 浏览器提供的一种存储机制，它允许你在用户的浏览器中存储键值对，数据的生命周期在页面关闭后仍然存在。
          //const msgListData 中 msgListData是 从localStorage中获取里面 唯一的一个名字叫 'msgList'的key 所对应的 value(value自身是一个很长的字符串！)
          if (msgListData != undefined && msgListData != null) {

            this.msgList = JSON.parse(msgListData);
            //msgListData 是一个JSON类型字符串 通过json提供的 parse方法转化为Message[] 数组
          }
          console.log(this.msgList) //msgList 存储 当前用户与所有朋友 的私人聊天记录 以及 当前用户参与的 群聊的聊天记录
          //@ts-ignore
          this.allMSGs = this.msgList.filter(message => (message.sender === this.loggedUser?.id && message.recipient === this.selectedFriendId) || (message.sender === this.selectedFriendId && message.recipient === this.loggedUser?.id)).filter(i => !i.chatGroupId);
          //allMSGs = 筛选出 当前用户 与 选定好友之间的 私人聊天记录 排除了他们共同参与的群聊的聊天记录
          console.log(this.allMSGs);
          setTimeout(() => {
            this.changeDetector.detectChanges(); //手动刷新 视图  不是很清楚！！！
          })
          this.showAllMSGs = true; //让 发送方的消息显示在 自己的聊天页面上

          /*
          setTimeout 方法，在 100 毫秒之后调用 this.scroller.scrollToIndex(999999, 'smooth') 方法，滚动到指定的索引位置。
          该代码通常用于在异步操作完成后滚动到消息列表的底部，确保用户可以看到最新的消息。
           */
          setTimeout(() => {
            this.scroller.scrollToIndex(999999, 'smooth');
          }, 100);

          console.log('chat allMSGs :', this.allMSGs);
        }
      })

      this.socket$ = new WebSocketSubject('ws://localhost:8080/websocket/'+this.loggedUser?.id); //通过ws协议发起一个长连接请求 连接到 WebSocket服务器
      /*
      WebSocket知识点 是一个长连接，服务器去和客户端始终保持连接， 消息发送方与接收方必须同时在线才能实现信息的传递  使用的是 TCL协议
       */

      // 处理收到的消息
      let that = this;

      this.socket$.subscribe(
        (message: any) => { //message 表示 我收到的消息
          if (message.chatGroupId) return
          console.log('Received message:', message); //这里的message 是指 朋友
//处理 不展示在页面上的消息   只有上 下线的情况 的 msgType才为 'server'
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
            return; //前提是 'server'类型的消息，但是message.msgContent ！=  '_offline'或者 '|new_user'，也直接结束整个 socket$的订阅方法
          }

          //处理 来自朋友发送过来的 已读消息的回执
          if(message!=null&&message.msgType!=undefined&&message.msgType=='backToMsgRead'){ //'backToMsgRead'是 来自WebSocket消息 的消息类型 这是固定的！

            console.log("Nachrichtenverarbeitung gelesen oder ungelesen：",message.fromUuid);
            //    this.editMsgReadState(message.fromUuid);
            //Das hier macht das gleiche wie editMsgReadState nur ohne Fehler.
            this.allMSGs.forEach(msg => {
              /*message是 Websocket发给我(我是发送方) 的消息，消息类型为'backToMsgRead'，
              我主动给好友发送消息 message 只包含fromUuid,isRead,msgType3个属性  isRead属性一定为True！
             */
              if(message.fromUuid == msg.uuid) //fromUuid是我收到的消息  uuid是我主动发出去的
              {
                msg.isRead=true;
              }
            });
            localStorage.setItem("msgList",JSON.stringify(this.allMSGs)); //找到 名字为 "msgList"(唯一！)的key，将它的value更新为 新的(stringify()方法 序列化后的)allMSGs的JSON字符串
            return; //结束整个 订阅的方法
          }

//还有给我发 文字消息
          const temp=JSON.stringify(this.allMSGs);
          //console.log(temp);
          that.allMSGs=[];
          that.allMSGs=JSON.parse(temp);

          /*
          如果好友主动给我发消息， message 只包含fromUuid，msgContent，senderType3个属性
           */
          const msg: Message = { //给message换了一个名字 叫msg
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
          that.allMSGs.push(msg); //将新的msg（朋友发送给我的）存到 我与朋友1对1的  !"that"的聊天记录最后
          this.msgList.push(msg); //将新的msg （朋友发送给我的）存到 我参与的所有的聊天记录(包括私聊与群聊)的最后

          setTimeout(() => { //setTimeout 是JS内置函数，用于在指定的时间后执行一个 函数(在这里是一个匿名函数！)
            this.scroller.scrollToIndex(999999, 'smooth');
          }, 100); //在上一个代码  this.msgList.push(msg) 执行的100毫秒后 再调用scrollToIndex方法 滚动到底部

          localStorage.setItem("msgList",JSON.stringify(this.msgList)); //缓存


          let backToMsg: Message = { //我接受到朋友的信息("msg")后， backToMsg作为我应该给 朋友发送的消息(告诉他已读)
            // @ts-ignore
            uuid: msg.fromUuid, //uuid是我发出去的   fromUuid是我收到的

            // @ts-ignore

            isRead: true,
            msgType: 'backToMsgRead', // 正确使用msgType属性

            // @ts-ignore
            recipient: this.selectedFriendId //接收者 是朋友的id

          };

          if(backToMsg.uuid!=undefined&&backToMsg!=null&&message.senderType==='friend'){
            console.log(backToMsg);
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
//source 定时器每隔2s触发 1次send_All_Unread_Messages_Again的方法
    const source = interval(2000); //interval 函数会返回一个 Observable，每 2000 毫秒（即 2 秒）发出一个值。
    this.subscription = source.subscribe(val => this.send_All_Unread_Messages_Again(null));
    //订阅这个 Observable，每当定时器触发时，调用 send_All_Unread_Messages_Again 方法，并传递 null 作为参数。
    /*
    在 interval 函数返回的 Observable 中，val 是每次定时器触发时发出的值。interval 函数会从 0 开始，每次递增 1，并在每个时间间隔内发出这个递增的值。
    因此，val 表示的是自定时器启动以来触发的次数。
    第一次触发（2 秒后）：val 为 0
    第二次触发（4 秒后）：val 为 1
    第三次触发（6 秒后）：val 为 2
    依此类推
     */
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
    console.log("send_All_Unread_Messages_Again");
  }

  sendMessage(): void {
    console.log("SEND MESSAGE");
    console.log(this.textareaInput.trim());

    const temp=JSON.stringify(this.allMSGs); //通过JSON.stringify方法 将allMSGs数组转化为JSON字符串 将所有消息整合成一个字符串 (序列化当前的消息列表)
    this.allMSGs=[]; // 清空当前的消息列表
    this.allMSGs=JSON.parse(temp); // 反序列化之前的消息列表
    const msgUuid = Math.floor(Math.random() * 100000); //Math.random()指 [0,1)的一个浮点数 * 100000 得到一个 0-99999 的随机数, Math.floor() 作用是去掉小数部分，得到整数
    const message: Message = {
      // @ts-ignore
      uuid:msgUuid,
      msgContent: this.textareaInput.trim(),
      /*
      this.textareaInput 是一个绑定到文本区域输入的字符串，代表用户输入的消息内容。
      this.textareaInput ist ein String, der an die Texteingabe gebunden ist und den vom Benutzer eingegebenen Nachrichteninhalt darstellt。

      trim() 方法用于去除字符串首尾的空白字符，包括空格、制表符和换行符。
      Die Methode trim() entfernt Leerzeichen am Anfang und Ende eines Strings, einschließlich Leerzeichen, Tabulatoren und Zeilenumbrüche。
       */
      // @ts-ignore
      sender: this.loggedUser.id,
      senderType:'me',
      // @ts-ignore
      recipient:this.selectedFriendId,
      isRead:false,
      msgType: 'user_chat'
    };
    if(message.msgContent != ''){ //避免发送空信息
      console.log('message:', message, 'this.selectedFriendId:', this.selectedFriendId);
      this.allMSGs.push(message); //这种方法可以确保在操作过程中数组的状态是独立且安全的，不会因直接操作而导致数据混乱或不可预期的行为。
      this.msgList.push(message); //msgList当前用户参与过的所有聊天记录(包括私聊与群聊) > allMSGs 只是当前用户与选定好友之间的聊天记录

      localStorage.setItem("msgList",JSON.stringify(this.msgList));

      this.textareaInput = ''; // Clear the input field

      this.send_All_Unread_Messages_Again(message); //先多次发送 位于message之前 且 未读的消息  可以不要！！！！

      // @ts-ignore
      this.socket$.next(message);

      setTimeout(() => {
        this.scroller.scrollToIndex(999999, 'smooth');
      }, 100); //紧接着上面的 代码 结束后执行
    }
  }

  public deleteMessage(id: string): void {
    this.allMSGs = this.allMSGs.filter(message => message.uuid !== id); //filter的作用是 将要删除的id信息过滤掉(删除掉) 保留全部 不是要删除的信息
    const localMsgList=localStorage.getItem('msgList');
    if(localMsgList!=undefined&&localMsgList!=null&&localMsgList!=''){ //手动 更新位于内存中的 msgList
      let msgListObj=JSON.parse(localMsgList); //通过反序列化 将localMsgList字符串转化为 any类型的数组 (Message[]数组)
      msgListObj=msgListObj.filter((message: Message) => message.uuid !== id); //filter 满足后面的条件的才能留下
      localStorage.setItem("msgList",JSON.stringify(msgListObj));
    }

  }
  public editMessage(id: string): void {
    this.showUnReadMsgDialog=true;
    this.editMsgUuid=id;
    const messageIndex = this.allMSGs.findIndex(message => message.uuid === id); //绿色的 messageIndex表示是一个局部变量
    if (messageIndex !== -1) { //-1表示 没有找到信息的情况 一般不会发生这种情况，当程序发生错误的情况会找不到
      this.editUnReadMsg = this.allMSGs[messageIndex].msgContent;
      //  this.allMSGs[messageIndex].msgContent = this.editUnReadMsg;

    }
  }

  public confirmEditMessage(id: string): void {
    this.showUnReadMsgDialog=false;
    const messageIndex = this.allMSGs.findIndex(message => message.uuid === id);
    if (messageIndex !== -1) {
      this.allMSGs[messageIndex].msgContent = this.editUnReadMsg; //将修改后的editUnReadMsg(也可以是没有进行修改的原内容) 更新给 allMSGs数组对应位置的msgContent属性
      this.editMsgUuid='';
      const localMsgList=localStorage.getItem('msgList');
      if(localMsgList!=undefined&&localMsgList!=null&&localMsgList!=''){
        let msgListObj =  JSON.parse(localMsgList);
        const msgIndex= msgListObj.findIndex((message: Message) => message.uuid === id);
        msgListObj[msgIndex].msgContent = this.editUnReadMsg;
        localStorage.setItem("msgList",JSON.stringify(msgListObj)); //覆盖原来的localMsgList
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
