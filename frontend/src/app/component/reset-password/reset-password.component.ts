// reset-password.component.ts
import {Component} from '@angular/core';
import {UserService} from '../../service/user.service';
import {Router} from '@angular/router';
import {FormsModule} from "@angular/forms";
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  providers: [UserService],
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent {
  currentPassword: string = '';
  newPassword: string = '';
  confirmPassword: string = '';

  constructor(private userService: UserService, private router: Router) {
  }


  onChangePasswordFormSubmit(): void {
    this.userService.changeUserPassword(this.currentPassword, this.newPassword).subscribe({
      next: (response) => {
        if (response.status == 200) {
          // 密码修改成功，退出登录，返回至首页
          alert("Password reset successfully");
          localStorage.clear();
          this.userService.loggedUser = null;
          void this.router.navigateByUrl("/login");
        }
      },
      error: (error) => {
        if (error.status == 401) {
          // 输入的当前密码不正确
          alert("Current password is incorrect");
        } else {
          alert("error");
        }
      }
    })
  }

  goToProfile() {
    this.router.navigateByUrl("/profile");
  }
}
