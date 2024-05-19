import { Component } from '@angular/core';
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
    providers: [UserService]
})
export class HomepageAdminComponent {
  constructor(private userService: UserService,
              private router: Router) {}

// 导航到编辑个人资料页面
  goToEditProfile() {
    this.router.navigate(['/profile']); // 跳转到编辑个人资料页面的路由
  }

  userLogout() {
    this.userService.userLogout();
  }

  cardUpload() {
    this.router.navigate(['/card-upload']);
  }

  userList() {
    this.router.navigate(['/admin-userlist'])
  }
}
