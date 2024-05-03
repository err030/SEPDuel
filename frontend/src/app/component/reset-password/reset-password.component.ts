// reset-password.component.ts
import { Component } from '@angular/core';
import { UserService } from '../../service/user.service';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { User } from '../../model/user';
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  standalone: true,
  imports: [
    FormsModule
  ],
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent {

  newPassword: string = '';
  confirmPassword: string = '';

  constructor(private messageService: MessageService, private userService: UserService, private router: Router) { }

  onPasswordFormSubmit(): void {
    if (!this.newPassword) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Please enter a new password.'
      });
      return;
    }

    const userId = this.userService.loggedUser?.id;

    if (!userId) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Cannot get user ID, please try again later.'
      });
      return;
    }

    // 调用 UserService 中的方法来存储新密码
    this.userService.resetPassword(userId, this.newPassword).subscribe(
      (response) => {
        // 处理成功响应
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Password reset successfully.'
        });
        // 重置密码成功后，跳转到个人资料页面
        this.router.navigateByUrl('/profile');
      },
      (error) => {
        // 处理错误响应
        console.error('Failed to reset password:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to reset password, please try again later.'
        });
      }
    );
  }
}
