import {ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router, RouterOutlet} from '@angular/router';
import {Global} from "../../global";
import {User} from "../../model/user";
import {UserService} from "../../service/user.service";
import {FriendService} from "../../service/friend.service";
import {ChatgroupService} from "../../service/chatgroup.service";
import {TabViewModule} from "primeng/tabview";
import {ScrollerModule} from "primeng/scroller";
import {NgClass, NgIf} from "@angular/common";
import {ButtonModule} from "primeng/button";
import {DividerModule} from "primeng/divider";
import {FormsModule, NgForm} from "@angular/forms";
import {Chatgroup} from "../../model/chatgroup";
import {AvatarModule} from "primeng/avatar";
import {DialogModule} from "primeng/dialog";
import {filter,map} from "rxjs/operators";

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    TabViewModule,
    ScrollerModule,
    NgClass,
    ButtonModule,
    DividerModule,
    RouterOutlet,
    AvatarModule,
    NgIf,
    DialogModule,
    FormsModule
  ],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {
  selectedFriendId: number | undefined;
  public loggedUser: any;
  selectedUser: User | null = null;
  friends: User[] = [];
  //showFriendList: boolean = false;
 // selectedFriendListItemId: number | undefined;
  selectedChatListItemId: number | undefined; //现在 正在聊天的对象
  activeIndex: number = 0;
  // showChatListFriends: boolean = false;
  chatListFriends: User[] = [];
  allFriends: User[] = [];
  isListPublic: boolean | null = false;
  newFriendRequests: string = "";

  @ViewChild(NgForm)
  userSearchForm: any;

  showFriendList: boolean = false;

  chatGroupName: string | undefined;

  selectedItems = [];

  chatGroupUsers :User[] = [];
  currentUserChatGroupList:Chatgroup[] = [];
  selectedChatGroupListItemId: number | undefined;

  newChatGroup:Chatgroup = new Chatgroup("","", "",[],0,0);

  constructor(private userService: UserService,
              private friendService: FriendService,
              private router: Router,
              private route: ActivatedRoute,
              private changeDetector: ChangeDetectorRef,
              private chatgroupService: ChatgroupService) {
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
  /*
  async  必须与 await成对出现
   */
  async ngOnInit(): Promise<void> {
    this.loggedUser = this.userService.loggedUser;
    if (this.loggedUser && this.loggedUser.id) {
      // 获取当前用户的所有好友
      await this.getAllFriends(this.loggedUser)
      // 获取当前用户的好友列表状态（是否公开）
      this.friendService.getListStatus(this.loggedUser.id).subscribe({
        next: (response) => {
          if (response.status == 200) {
            this.isListPublic = response.body;
          }
        },
        error: (error) => {
          alert(error.statusText)
        }
      })
      // 获取当前用户有多少个未处理的好友请求
      this.friendService.getNewFriendRequestNumber(this.loggedUser.id).subscribe({
        next: (response) => {
          if (response.status == 200 && response.body && response.body != 0) {
            this.newFriendRequests = response.body.toString();
          }
        },
        error: (error) => {
          alert(error.statusText)
        }
      })
      // 获取路由参数id
      // console.log(this.route)
      this.route.paramMap.subscribe(params => {
        // console.log(params, '===params');
        const selectedFriendIdParam = params.get('friendId');
        //判断是从哪个按钮 来自 Friend界面 还是主界面的chatten
        // console.log(selectedFriendIdParam,'===selectedFriendIdParam' );
        if (selectedFriendIdParam != null) {
          this.selectedFriendId = parseInt(selectedFriendIdParam); //从好友列表 选中具体的好友后获取他的 Userid (= value.id) selectedFriendId是个全局变量
          // this.loggedUser = Global.loggedUser;
          // this.selectedUser = this.friendService.selectedFriend;
          this.selectedChatListItemId = undefined;
          // 检查该好友是否已经在chatListFriends中
          for (let user of this.chatListFriends) {
            if (user.id == this.selectedFriendId) {
              this.selectedChatListItemId = user.id; //现在 正在和哪个好友聊天  保存和当前用户正在聊天的好友的id
              break;
            }
          }
          // 如果不存在，添加到chatListFriends的第一个
          /*
          对用户的所有friend进行遍历 寻找与selectedFriendId 匹配的好友Object
          循环的目的: 只知道聊天对象的id  但是不知道聊天对象是谁，为了获取到对象
           */
          if (this.selectedChatListItemId == undefined) {
           console.log('this.allFriends: ', this.allFriends);
            for (let friend of this.allFriends) {
              console.log(friend,friend.id,this.selectedFriendId);
              if (friend.id == this.selectedFriendId){
                let chatListFriends = this.chatListFriends;
                chatListFriends.unshift(friend); //将选中的好友添加到第一个
                this.chatListFriends = chatListFriends;
                //this.chatListFriends.unshift(friend);//unshift 方法会将friend这个对象 添加到数组的首个位置
                setTimeout(() => {
                  this.changeDetector.detectChanges(); //手动刷新 试图
                })
                console.log(this.chatListFriends);
                // this.showChatListFriends = true
                this.selectedChatListItemId = this.selectedFriendId;
                console.log(this.selectedChatListItemId)
                break;
              }
            }
          }
        }
        this.activeIndex = 0; //切换聊天对象的index ??
      });
    }

    //聊天群组列表
    // @ts-ignore
    this.chatgroupService.getChatGroupListByUserId(this.loggedUser.id).subscribe({
      next: (response) => {
        if (response.status == 200&&response.body) {
          console.log(response.body)
          this.currentUserChatGroupList = response.body;
          setTimeout(() => {
            this.changeDetector.detectChanges(); //手动刷新 试图
          })
        }
      },
      error: (error) => {
        console.log("error message:",error.statusText);
      }
    })

  }

  resetList(): void {
    console.log('reset list')
    this.selectedFriendId = 0;
    // void this.router.navigateByUrl(this.activeIndex == 0 ? '/chat/0' : '/chat/0/group_message/0');
    this.router.navigateByUrl('/chat');
  }

  getItemClass(friend: User): string {
    if (friend.id == this.selectedFriendId) {
      return 'friendListItemSelected';
    } else {
      return 'friendListItemUnselected';
    }
  }

  getGroupClass(chatgroup: Chatgroup): string {
    if (chatgroup.id == this.selectedChatGroupListItemId) {
      return 'friendListItemSelected';
    } else {
      return 'friendListItemUnselected';
    }
  }

  getUserAvatarWord(user: User): string {
    return user.lastname.charAt(0) + user.firstname.charAt(0);
  }

  getUserAvatarUrl(user: User){
    return Global.backendUrl + user.avatarUrl;
  }


  onChatListItemClick(chatListFriend: User): void {
    this.selectedFriendId = chatListFriend.id;
    this.friendService.selectedFriend = chatListFriend;
    void this.router.navigateByUrl("/chat/user_message/" + chatListFriend.id);
  }

  onChatGroupListItemClick(chatGroup: Chatgroup): void {
    console.log("chatgroup obj:",chatGroup);
    this.selectedChatGroupListItemId = chatGroup.id;
    this.chatgroupService.selectedChatGroup = chatGroup;
    void this.router.navigateByUrl("/chat/group_message/" + chatGroup.id);
  }

  openFriendList(): void {
    this.showFriendList=true;
  }
  //创建群聊分组
  createChatGroup():void{

    //使用 document.querySelectorAll 获取所有选中的复选框元素。
    // 将这些复选框元素转换为数组，并提取它们的值（用户ID），存储在 this.selectedItems 中。
    const checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
    // @ts-ignore
    this.selectedItems = Array.from(checkboxes).map((checkbox: HTMLInputElement) => checkbox.value);

//输出选中的用户ID和聊天群组名称，便于调试。
    console.log("selectedItems："+this.selectedItems)
    console.log("chatGroupName："+this.chatGroupName)
    //const newChatGroup = <Chatgroup>{};
    //this.loggedUser instanceof User ? newChatGroup.creator = this.loggedUser :this.loggedUser;

    /*
    1.设置聊天群组的名称、类型和创建者ID。
    2.将当前登录用户的ID添加到选中的用户ID列表中。
     */
    typeof this.chatGroupName === "string" ? this.newChatGroup.name = this.chatGroupName :'';
    this.newChatGroup.type = "group";
    this.newChatGroup.creatorId=this.loggedUser?.id;


    //群组聊天要3个人

    /*
    确保选中的用户数至少为3人。
    遍历选中的用户ID，调用 userService.getUserByUserId 获取用户信息，并将用户对象添加到 chatGroupUsers 列表中。
     */
    // @ts-ignore
    this.selectedItems.push(this.loggedUser?.id);
    if(this.selectedItems.length>=3){
      this.selectedItems.forEach(userId=>{
        this.userService.getUserByUserId(userId).subscribe({
          next: (response) => {
            if (response.status == 200) {

              let user = <User>{};
              user=response.body;

              this.chatGroupUsers.push(user)
              // console.log(this.chatGroupUsers);
              //this.newChatGroup.participants.push(user);

            }
          },
          error: (error) => {
            console.log("error message:",error.statusText);
          }
        });
      })
    }

    console.log("newChatGroup.participants:",this.chatGroupUsers);
    this.newChatGroup.participants = this.chatGroupUsers;
    console.log("this.newChatGroup:",this.newChatGroup);
    console.log(this.selectedItems.toString())
    this.newChatGroup.chatUserIds=this.selectedItems.toString();
    this.chatgroupService.addChatgroup(this.newChatGroup).subscribe({
      next: (response) => {
        if (response.status == 200) {
          console.log(response.body);
          this.refreshGroupList();
        }
      },
      error: (error) => {
        console.log("error message:",error.statusText);
      }
    });
    this.showFriendList=false;
  }

//刷新群列表
  refreshGroupList(){
    // @ts-ignore
    this.chatgroupService.getChatGroupListByUserId(this.loggedUser.id).subscribe({
      next: (response) => {
        if (response.status == 200&&response.body) {
          //console.log(response.body)
          this.currentUserChatGroupList = response.body;
          setTimeout(() => {
            this.changeDetector.detectChanges(); //手动刷新 试图
          })
        }
      },
      error: (error) => {
        console.log("error message:",error.statusText);
      }
    });
  }

}
