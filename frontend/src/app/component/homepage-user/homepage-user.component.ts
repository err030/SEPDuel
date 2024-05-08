// homepage-user.component.ts
import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { UserService } from '../../service/user.service';
import {Router, RouterOutlet} from '@angular/router'; // 导入路由器模块

@Component({
  selector: 'homepage-user',
  templateUrl: './homepage-user.component.html',
  styleUrls: ['./homepage-user.component.css'],
  imports: [
    RouterOutlet
  ],
  standalone: true
})
export class HomepageUserComponent implements OnInit {
  userMenuItems: MenuItem[] = [];
  userAvatarUrl = "";
  showAvatarWord: boolean = false;

  constructor(
    private userService: UserService,
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
  goToFriendlist() {
    this.router.navigate(['/friendlist']);
  }
  //退出登陆
  userLogout() {
    this.userService.userLogout();
  }
}
