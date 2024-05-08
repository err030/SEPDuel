// reset-password.component.ts
import { Component } from '@angular/core';
import { UserService } from '../../service/user.service';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { User } from '../../model/user';
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
  providers:[UserService,MessageService],
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent {
  currentPassword: string='';
  newPassword: string = '';
  confirmPassword: string = '';

  constructor(private messageService: MessageService, private userService: UserService, private router: Router) { }


  onChangePasswordFormSubmit(): void {
    this.userService.changeUserPassword(this.currentPassword, this.newPassword).subscribe({
      next: (response) => {
        if (response.status == 200) {
          // 密码修改成功，退出登录，返回至首页
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Password reset successfully.'
          });
          localStorage.clear();
          this.userService.loggedUser = null;
          void this.router.navigateByUrl("/login");
        }
      },
      error: (error) => {
        if (error.status == 401) {
          // 输入的当前密码不正确
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to reset password, please try again later.'
          });
        } else {
          this.messageService.add({
            severity: 'error', summary: 'Fehler', detail: error.statusText
          });
        }
      }
    })
  }
  /*onPasswordFormSubmit(): void {
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
  }*/
}
