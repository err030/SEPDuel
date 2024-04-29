//login.component.ts
import {Component, OnInit} from '@angular/core';
import {User} from "../../model/user";
import {UserService} from "../../service/user.service";
import {MessageService} from "primeng/api";
import {Router} from "@angular/router";
import {HttpResponse} from "@angular/common/http";
import {FormsModule, NgForm} from "@angular/forms";
import {NgClass} from "@angular/common";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  standalone: true,
  styleUrls: ['./login.component.css'],
  imports: [
    CommonModule,
    FormsModule,
    NgClass
  ],
  providers: [UserService, MessageService]
})
export class LoginComponent implements OnInit {
  user: User = new User("", "", "", "", "",1);

  loggedUser: any;

  constructor(private messageService: MessageService, private userService: UserService, private router: Router) {
  }

  ngOnInit(): void {
    this.userService.checkLoggedUser();
  }

  // 用户登录
  onLoginFormSubmit(loginForm: NgForm): void {
    // 验证表单
    if (loginForm.valid) {
      console.log('Form is valid, logging in...');
      // 将用户输入的Email或者username、密码和用户组发送到后端进行验证
      this.userService.getUserByEmailAndPasswordAndGroupId(this.user).subscribe({
        next: (response) => {
          if (response.status == 200) {
            // 邮箱或用户名存在，现在验证密码
            this.userService.getUserByEmailAndPasswordAndGroupId(this.user).subscribe({
              next: (response) => {
                // 验证成功，将后端返回的Response中body里面的用户信息保存在loggedUser变量中
                if (response.status == 200) {
                  if (response.body) {
                    this.loggedUser = response.body;
                  }
                  // 导航到 verify 页面
                  this.router.navigate(['/verify']);
                }
              },
              error: (error) => {
                // 密码错误
                if (error.status == 401) {
                  this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Your password is incorrect'
                  });
                } else {
                  // 其他错误
                  this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to login. Please try again later.'
                  });
                }
              }
            });
          }
        },
        error: (error) => {
          // 邮箱或用户名不存在
          if (error.status == 404) {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'This email or username does not exist'
            });
          } else {
            // 其他错误
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to login. Please try again later.'
            });
          }
            console.error(error);
        }
      });
    } else {
      console.log('Form is invalid');
    }
  }

    // 申请忘记密码
    forgetPasswordRequest()
  :
    void {
      // 获取用户输入的邮箱地址或用户名
      const emailOrUsername = this.user.email;

      // 检查用户输入的邮箱地址或用户名是否存在
      this.userService.checkUserByEmailAndGroupId(this.user).subscribe({
        next: (response: HttpResponse<any>) => { // 显式声明 response 参数的类型
          // 如果存在用户
          if (response.status == 200) {
            // 发送重置密码链接到用户邮箱
            this.userService.sendResetPasswordEmail(emailOrUsername).subscribe({
              next: (response: HttpResponse<any>) => { // 显式声明 response 参数的类型
                // 发送成功
                if (response.status === 200) {
                  this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'An email with password reset instructions has been sent to your email address.'
                  });
                } else {
                  // 发送失败
                  this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to send password reset email. Please try again later.'
                  });
                }
              },
              error: (error: any) => { // 显式声明 error 参数的类型
                // 发送失败
                this.messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: 'Failed to send password reset email. Please try again later.'
                });
              }
            });
          } else {
            // 用户不存在，显示错误消息
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'This email or username does not exist'
            });
          }
        },
        error: (error: any) => { // 显式声明 error 参数的类型
          // 其他错误，显示通用错误消息
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to send password reset email. Please try again later.'
          });
        }
      });
    }

    goToRegister()
  :
    void {
      this.router.navigateByUrl('/register')
        .then((navigationSuccess: boolean) => {
          if (navigationSuccess) {
            console.log('Navigation to /register successful');
            // 执行其他操作
          } else {
            console.error('Navigation to /register failed');
          }
        });
    }


  }
