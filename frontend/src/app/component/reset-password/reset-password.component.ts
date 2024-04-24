import { Component } from '@angular/core';
import { UserService } from '../../service/user.service';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  standalone: true,
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent {
  //应该后端需要调用这里，因为是后端发送给用户一个链接，点击链接后是这个重制密码页面
  newPassword: string = '';

  constructor(private messageService: MessageService, private userService: UserService, private router: Router) { }

  onNextButtonClick(): void {
    if (!this.newPassword) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Please, try again'
      });
      return;
    }

    // 获取用户 ID
    const userId = this.userService.loggedUser?.id;

    if (!userId) {
      // 如果无法获取用户 ID，则显示错误消息并返回
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Cannot get user ID, please try again later.'
      });
      return;
    }

    // 调用 resetPassword 方法，并传递用户 ID 和新密码
    this.userService.resetPassword(userId, this.newPassword).subscribe({
      next: (response) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Your password has been reset'
        });
        void this.router.navigateByUrl('/login');
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to reset password'
        });
      }
    });
  }
}
