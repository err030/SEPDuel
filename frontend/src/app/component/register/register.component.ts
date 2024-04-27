import { Component } from '@angular/core';
import { MessageService } from 'primeng/api';
import { UserService } from '../../service/user.service';
import { Router } from '@angular/router';
import { User } from '../../model/user';
import {CommonModule, NgClass} from '@angular/common';
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgClass
  ],
  providers: [UserService, MessageService]
})
export class RegisterComponent {
  user: User = new User("", "", "", "", 1);
  confirmPassword: string = "";
  years: number[] = [];
  months: number[] = [];
  days: number[] = [];

  constructor(private messageService: MessageService, private userService: UserService, private router: Router) {

  // 初始化年份、月份和日期选项
  this.years = this.generateOptions(1970, 2006);
  this.months = Array.from({ length: 12 }, (_, i) => i + 1);
  this.days = Array.from({ length: 31 }, (_, i) => i + 1);
}

// 辅助函数，用于生成指定范围内的数字数组
generateOptions(start: number, end: number): number[] {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

// 验证邮箱是否符合规则
  isValidEmail(email: string): boolean {
    if (!email) {
      // 如果邮箱为空，返回 false
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // 检查邮箱是否符合正则表达式规则
    if (!emailRegex.test(email)) {
      // 如果邮箱不符合规则，返回 false
      return false;
    }

    // 其他情况下，返回 true
    return true;
  }

  // 提交新用户注册信息
  onRegisterFormSubmit(): void {
    // 检查所有字段是否填写
    if (!this.user.email || !this.user.username || !this.user.password || !this.user.firstname || !this.user.lastname) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Please fill in all fields'
      });
      return;
    }

    // 检查密码是否一致
    if (this.user.password !== this.confirmPassword) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Passwords do not match'
      });
      return;
    }

    const emailUser = new User('', '', this.user.email, '', 0);
    const usernameUser = new User('', '', '', '', 0, undefined, undefined, undefined, this.user.username);
  // 检查邮箱是否存在
    this.userService.checkEmailExists(emailUser).subscribe({
      next: (exists) => {
        if (exists) {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'This email has already been registered'
          });
        } else {
          // 检查用户名是否存在
          this.userService.checkUsernameExists(usernameUser).subscribe({
            next: (exists) => {
              if (exists) {
                this.messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: 'This username exists already'
                });
              } else {
                // 如果Admin invitation code是SEP2024，则将用户添加为管理员
                if (this.user.adminInvitationCode == "SEP2024") {
                  this.user.groupId = 2;
                }

                // 注册用户
                this.userService.addUser(this.user).subscribe({
                  // 如果http请求成功
                  next: (response) => {
                    // 如果状态码为201
                    if (response.status == 201) {
                      // 显示注册成功的信息
                      this.messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: 'You have successfully registered'
                      });
                      // 清空表单数据
                      this.user = new User("", "", "", "", 1);
                      this.confirmPassword = "";
                      // 跳转到登录页面
                      void this.router.navigateByUrl("/login");
                    }
                  },
                  // 如果请求失败
                  error: (error) => {
                    // 如果是其他错误，通过error.statusText显示错误信息
                    this.messageService.add({ severity: 'error', summary: 'Fehler', detail: error.statusText });
                  }
                });
              }
            },
            error: (error) => {
              this.messageService.add({ severity: 'error', summary: 'Fehler', detail: error.statusText });
            }
          });
        }
      },
      error: (error) => {
        this.messageService.add({ severity: 'error', summary: 'Fehler', detail: error.statusText });
      }
    });
  }

  //跳转到登录页面
  returnToLogin(): void {
    this.router.navigateByUrl("/login");
  }
}
