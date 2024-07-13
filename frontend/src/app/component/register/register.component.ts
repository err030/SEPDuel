import { Component } from '@angular/core';
import { UserService } from '../../service/user.service';
import { Router } from '@angular/router';
import { User } from '../../model/user';
import {CommonModule, NgClass} from '@angular/common';
import {FormsModule} from "@angular/forms";
import { CalendarModule } from 'primeng/calendar';


@Component({
   selector: 'app-register',
   templateUrl: './register.component.html',
   styleUrls: ['./register.component.css'],
   standalone: true,
   imports: [
    CommonModule,
    FormsModule,
    NgClass,
    CalendarModule
   ],
   providers: [UserService]
})
export class RegisterComponent {
  user: User = new User("", "", "", "", "",1);
  confirmPassword: string = "";

  constructor(private userService: UserService, private router: Router) {
  }

// 验证邮箱是否符合规则
isValidEmail(email: string): boolean {
    if (!email) {
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return false;
    }
    return true;
  }

  // 提交新用户注册信息
  onRegisterFormSubmit(): void {
    // 检查所有字段是否填写
    if (!this.user.email || !this.user.username || !this.user.password || !this.user.firstname || !this.user.lastname) {
      alert("Please fill in all fields");
      return;
    }

    // 检查密码是否一致
    if (this.user.password !== this.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    const emailUser = new User('', '', "", this.user.email, "",1);
    const usernameUser = new User('', '', this.user.username, '',"", 1, undefined, undefined);
  // 检查邮箱是否存在
    this.userService.checkEmailExists(emailUser).subscribe({
      next: (response) => {
        if (response.body) {
          alert("This email already exists");
        } else {
          // 检查用户名是否存在
          this.userService.checkUsernameExists(usernameUser).subscribe({
            next: (response) => {
              if (response.body) {
                alert("Username already exists");
              } else {
                // 如果Admin invitation code是SEP2024，则将用户添加为管理员
                if (this.user.adminInvitationCode == "SEP2024") {
                  this.user.groupId = 2;
                }

                // 注册用户
                this.userService.addUser(this.user).subscribe({
                  next: (response) => {
                    if (response.status == 201) {
                      alert("Registration successful");
                      this.userService.userLogout();

                      this.router.navigateByUrl("/login");
                    }
                  },
                  // 如果请求失败
                  error: (error) => {
                    // 如果是其他错误，通过error.statusText显示错误信息
                    alert(error.statusText);
                  }
                });
              }
            },
            error: (error) => {
              alert(error.statusText);
            }
          });
        }
      },
      error: (error) => {
        alert(error.statusText);
      }
    });

  }

  //跳转到登录页面
  returnToLogin(): void {
    this.router.navigateByUrl("/login");
  }
}



