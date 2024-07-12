// homepage-user.component.ts
import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { UserService } from '../../service/user.service';
import {Router, RouterLink, RouterOutlet} from '@angular/router';
import {Global} from "../../global";
import {User} from "../../model/user";
import {RobotService} from "../../service/robot.service";
import {DuelRequest} from "../../model/DuelRequest";
import {NgIf} from "@angular/common";
import {HttpResponse} from "@angular/common/http";
import {DuelService} from "../../service/duel.service"; // 导入路由器模块

@Component({
  selector: 'homepage-user',
  templateUrl: './homepage-user.component.html',
  styleUrls: ['./homepage-user.component.css'],
  imports: [
    RouterOutlet,
    RouterLink,
    NgIf
  ],
  standalone: true
})
export class HomepageUserComponent implements OnInit {
  userMenuItems: MenuItem[] = [];
  userAvatarUrl = "";
  showAvatarWord: boolean = false;
  duelRequest?: DuelRequest;
  selectedUserId: number | undefined;
  sentRequest: DuelRequest | null = null;
  userId: number | null = null;
  loggedUser: User | null = null;


  constructor(
    private userService: UserService,
    private robotService: RobotService,
    private duelService: DuelService,
    private router: Router
  ) {}

  ngOnInit() {
    // 获取用户头像地址
    this.userAvatarUrl = this.userService.getUserAvatarUrl();
    const loggedUser = this.userService.loggedUser;
    // 如果用户头像不存在，则用名字和姓的首字母当头像
    if (loggedUser && !loggedUser.avatarUrl) {
      this.showAvatarWord = true;
    }

    // 初始化loggedUser
    if (loggedUser) {
      this.loggedUser = loggedUser;
      console.log('Global.loggedUser:', this.loggedUser);
    } else {
      console.error('Logged user is not available');
      return;
    }


    // 菜单项
    this.userMenuItems = [
      {
        label: 'Logout',
        icon: 'pi pi-fw pi-power-off',
        command: () => this.userService.userLogout()
      }
    ];
  }

  // 导航到编辑个人资料页面
  goToEditProfile() {
    this.router.navigate(['/profile']); // 跳转到编辑个人资料页面的路由
  }
  //导航到卡库

  //导航到好友列表
  navigateToFriends() {
    this.router.navigateByUrl('/friendlist').catch(err => console.error('Navigation Error:', err));
  }
  //退出登陆
  userLogout() {
    if (this.loggedUser && this.loggedUser.id) {
      this.userService.updateUserStatus(this.loggedUser.id, 2).subscribe({
        next: () => {
          this.completeLogout();
        },
        error: (error) => {
          console.error('Failed to update user status:', error);
          this.completeLogout(); // Ensure logout if status update fails
        }
      });
    } else {
      console.error('Logged user or user ID is not available');
      this.completeLogout(); // Logout even if no user is detected
    }
    this.userService.userLogout();

  }

  private completeLogout() {
    this.userService.userLogout();
    localStorage.clear();
    this.router.navigateByUrl("/login");
  }


  goToDecks() {
    this.router.navigate(['/deck-list']); // 跳转到卡组页面的路由
  }

  goToLootbox() {
    this.router.navigate(['/lootbox']);
  }

  goToClanList(){
    this.router.navigate(['/clan-list']);
  }

  goToClan(){
    this.router.navigate(['/clan']);
  }


// 导航到聊天页面
//   navigateToChat() {
//   this.router.navigateByUrl(':friendId').catch(err => console.error('Navigation Error:', err));
// }

  getUserId(){
    return Global.loggedUser.id;
  }


  playWithRobot() {
    // @ts-ignore
    Global.currentDeck = JSON.parse(localStorage.getItem('currentDeck'));
    if (!Global.currentDeck) {
      alert("Please select a deck first");
      this.router.navigate(['/deck-list']);
      return;
    }

    if (this.loggedUser && this.loggedUser.id) {
      if (this.loggedUser.status === 0) {
        //@ts-ignore
        this.robotService.createRobotRequest(this.getUserId(), Global.currentDeck.id)
          .subscribe((response: HttpResponse<any>) => {
            // 处理请求成功的逻辑
            if (response.body) {
              this.duelRequest = response.body;
              console.log('duelRequest:', this.duelRequest);
              if (this.duelRequest && this.loggedUser && Global.currentDeck) {
                this.duelService.createRobotDuel(this.duelRequest.id, this.getUserId(), Global.currentDeck.id)
                  .subscribe(
                    (response) => {
                      this.duelService.initializer = false;
                      localStorage.setItem('initializer', '0');
                      this.router.navigate([`/duel/${this.duelRequest?.id}`]);
                    }
                  );
              } else {
                console.error('Error: duelRequest, loggedUser or currentDeck is undefined');
              }
            } else {
              alert("Failed to create duel request.");
            }
          }, error => {
            alert("Error sending duel request");
          });
      } else {
        alert("This user is not available for a duel.");
      }
    } else {
      alert("Current user or target user is null.");
    }


  }


  goToSepTv() {
    this.router.navigate(['/sep-tv']);
  }
}
