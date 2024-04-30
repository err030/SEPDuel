import { Component } from '@angular/core';
import {UserService} from "../../service/user.service";
import {MessageService} from "primeng/api";
import {Router} from "@angular/router";
import {FormsModule} from "@angular/forms";
@Component({
  selector: 'app-verify',
  templateUrl: './verify.component.html',
  standalone: true,
  styleUrls: ['./verify.component.css'],
  imports: [
    FormsModule
  ],
  providers: [MessageService, UserService]
})
export class VerifyComponent {
  constructor(private messageService: MessageService, private userService: UserService, private router: Router) {
    this.loggedUser = {}; // 初始化 loggedUser
  }
  superSecurityCode: string = "SEPGruppeQ";

  securityCode: string = "";
  loggedUser: any;

  // 提交验证码
  onSecurityCodeFormSubmit(): void {
    if (!this.loggedUser) {
      console.error('Logged user is not defined.');
      return;
    }

    if (this.securityCode == this.superSecurityCode) {
      // 使用Super验证码，直接获取Token
      this.getToken();
    }

    else {
      // 不使用Super验证码，先验证输入的验证码是否有效
      this.userService.checkSecurityCode(this.loggedUser.id, this.securityCode).subscribe({
        // 验证码有效，获取Token
        next: (response) => {
          if (response.status == 200) {
            this.getToken();
          }
        },
        // 验证码无效，根据返回的状态值显示相应的错误信息
        error: (error) => {
          if (error.status == 401) {
            this.messageService.add({
              severity: 'error',
              summary: 'Fehler',
              detail: 'Der eingegebene Sicherheitscode ist abgelaufen'
            });
          } else if (error.status == 404) {
            this.messageService.add({
              severity: 'error',
              summary: 'Fehler',
              detail: 'Der eingegebene Sicherheitscode ist ungültig'
            });
          } else {
            this.messageService.add({severity: 'error', summary: 'Fehler', detail: error.statusText});
          }
        }
      })
    }
  }
  private getToken(): void {
    if (!this.loggedUser || !this.loggedUser.id) {
      // 如果 loggedUser 或其 id 为空，显示错误消息并返回
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'User information is missing or invalid. Please log in again.'
      });
      return;
    }

    // 如果 loggedUser 存在且其 id 已定义，继续获取 token
    this.userService.getTokenByUserId(this.loggedUser.id).subscribe({
      next: (response) => {
        // 保存Token
        localStorage.setItem('token', response);
        // 将登录用户信息保存到UserService里
        this.userService.loggedUser = this.loggedUser;
        // 根据用户组跳转至相应的页面
        if (this.loggedUser.groupId == 1) {
          this.router.navigateByUrl('/homepage-user');
        } else if (this.loggedUser.groupId == 2) {
          this.router.navigateByUrl('/homepage-admin');
        }
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'You have successfully logged in'
        });
      },
      error: (error) => {
        this.messageService.add({severity: 'error', summary: 'Fehler', detail: error.statusText});
      }
    })
  }

  // 跳转回登录页面
  goBack(): void {
    void this.router.navigateByUrl("/login");
  }
}
