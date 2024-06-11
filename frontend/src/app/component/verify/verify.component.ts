import {Component, OnInit} from '@angular/core';
import {UserService} from "../../service/user.service";
import {Router} from "@angular/router";
import {FormsModule} from "@angular/forms";
import {Global} from "../../global";
@Component({
  selector: 'app-verify',
  templateUrl: './verify.component.html',
  standalone: true,
  styleUrls: ['./verify.component.css'],
  imports: [
    FormsModule
  ],
  providers: [UserService]
})
export class VerifyComponent implements OnInit {
  constructor(private userService: UserService, private router: Router) {

  }

  ngOnInit(): void {
    this.loggedUser = Global.loggedUser;
  }
  superSecurityCode: string = "SEPGruppeQ";

  securityCode: string = "";
  loggedUser: any;

  // 提交验证码
  onSecurityCodeFormSubmit(): void {
    console.log("SC: " + this.securityCode);
    if (!this.loggedUser) {
      console.error('Logged user is not defined.');
      return;
    }

    if (this.securityCode == this.superSecurityCode) {
      // 使用Super验证码，直接获取Token
      console.log("SUPER")
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
            alert("The security code you entered has expired");
          } else if (error.status == 404) {
            alert("The security code entered is invalid");
          } else {
            alert("Something went wrong");
          }
        }
      })
    }
  }
  private getToken(): void {
    console.log("ID:" + this.loggedUser.id)
    if (!this.loggedUser || !this.loggedUser.id) {
      // 如果 loggedUser 或其 id 为空，显示错误消息并返回
      alert("User information is missing or invalid. Please log in again");
      return;
    }
  console.log("GET Token")
    // 如果 loggedUser 存在且其 id 已定义，继续获取 token
    this.userService.getTokenByUserId(this.loggedUser.id).subscribe({
      next: (response) => {
        // 保存Token
        localStorage.setItem('token', response);
        this.userService.updateUserStatus(this.loggedUser.id, 0).subscribe({
          next: (response) => {
            // 将登录用户信息保存到UserService里

            this.loggedUser = response.body;
            console.log(this.loggedUser);
            // this.loggedUser.status = 0;
            this.userService.loggedUser = this.loggedUser;
            Global.loggedUser = this.loggedUser; // 确保在此设置 Global.loggedUser
            localStorage.setItem('loggedUser', JSON.stringify(Global.loggedUser));// 同步到本地存储
            alert("You have successfully logged in");
            if (this.loggedUser.groupId == 1) {
              this.router.navigateByUrl('/homepage-user');
            } else if (this.loggedUser.groupId == 2) {
              this.router.navigateByUrl('/homepage-admin');
            }


          }
        });
        // Global.loggedUser = this.loggedUser; // 确保在此设置 Global.loggedUser
        // localStorage.setItem('loggedUser', JSON.stringify(this.loggedUser)); // 同步到本地存储

        // 根据用户组跳转至相应的页面
        //@ts-ignore


      },
      error: (error) => {
        alert("error");
      }
    })
  }

  // 跳转回登录页面
  goBack(): void {
    void this.router.navigateByUrl("/login");
  }
}
