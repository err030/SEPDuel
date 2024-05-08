import { Component } from '@angular/core';
import {MessageService} from "primeng/api";
import {UserService} from "../../service/user.service";
import {Router, RouterOutlet} from "@angular/router";

@Component({
    selector: 'app-homepage-admin',
    templateUrl: './homepage-admin.component.html',
    styleUrls: ['./homepage-admin.component.css'],
    standalone: true,
    imports: [
        RouterOutlet
    ],
    providers: [MessageService, UserService]
})
export class HomepageAdminComponent {
  constructor(private router: Router) {}

// 导航到编辑个人资料页面
  goToEditProfile() {
    this.router.navigate(['/profile']); // 跳转到编辑个人资料页面的路由
  }
  //导航到管理卡库
  goToEditCard(){

  }

  userLogout() {
    this.userLogout();
  }
}
