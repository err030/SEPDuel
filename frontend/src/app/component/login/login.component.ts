//login.component.ts
import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {User} from "../../model/user";
import {UserService} from "../../service/user.service";
import {Router} from "@angular/router";
import {HttpResponse} from "@angular/common/http";
import {FormsModule, NgForm} from "@angular/forms";
import {NgClass, NgOptimizedImage} from "@angular/common";
import {CommonModule} from '@angular/common';
import {DialogModule} from "primeng/dialog";
import {RadioButtonModule} from "primeng/radiobutton";
import {ButtonModule} from "primeng/button";
import {Global} from "../../global";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  standalone: true,
  styleUrls: ['./login.component.css'],
  imports: [
    CommonModule,
    FormsModule,
    NgClass,
    DialogModule,
    RadioButtonModule,
    ButtonModule,
    NgOptimizedImage
  ],
  providers: [UserService]
})
export class LoginComponent implements OnInit, AfterViewInit {
  @ViewChild('loginForm') loginForm: NgForm | undefined;
  user: User = new User("", "", "", "", "", 1);

  loggedUser: any;
  resetPasswordUser: User = new User("", "", "", "", "", 1);
  showResetPasswordDialog: boolean = false;

  constructor(private userService: UserService, private router: Router) {
  }

  ngOnInit(): void {
    this.markFormFieldsAsTouched();
    this.userService.checkLoggedUser();
  }

  ngAfterViewInit(): void { // 在 ngAfterViewInit 钩子中调用 markFormFieldsAsTouched()
    this.markFormFieldsAsTouched();
  }

  // 标记所有表单字段为已触摸状态
  markFormFieldsAsTouched(): void {
    const controls = Object.values(this.loginForm?.controls || {});
    controls.forEach(control => {
      control?.markAsTouched();
    });
  }

//表单验证失败
  showFormValidationErrorMessages(): string {
    let errorMessage = '';
    if (!this.user.email && !this.user.password) {
      errorMessage = 'Please enter your email or username and password';
    } else if (!this.user.email) {
      errorMessage = 'Please enter your username or email';
    } else if (!this.user.password) {
      errorMessage = 'Please enter your password';
    }
    return errorMessage;
  }


//登录逻辑
  onLoginFormSubmit(): void {
    this.userService.getUserByEmailAndPasswordAndGroupId(this.user).subscribe({
      next: (response: HttpResponse<User>) => {
        // bug fix, no idea why
        this.loggedUser = response.body;
        Global.loggedUser = this.loggedUser
        if (response.status === 200) {
          if (response.body) {
            this.loggedUser = response.body;
            Global.loggedUser = this.loggedUser; // 设置 Global.loggedUser
            localStorage.setItem('loggedUser', JSON.stringify(this.loggedUser)); // 同步到本地存储
          }

          // 用户登录成功，导航到验证页面
          this.userService.getSecurityCodeByUserId((this.loggedUser.id)).subscribe({
            next: (response) => {
              if (response.status === 201) {
                Global.loggedUser = this.loggedUser;
                this.router.navigate(['/verify']);
              }
            }
          });
        } else {
          // 用户登录失败，显示错误消息
          alert("Error");
        }
      },
      error: (error) => {
        // 处理用户登录失败的错误情况
        console.error(error);
        alert("E-mail or password is incorrect!");
      }
    });
  }


  showPasswordForgetDialog(): void {
    this.showResetPasswordDialog = true;
  }

  // 申请忘记密码
  forgetPasswordRequest()
    : void {
    // 检查用户输入的邮箱地址或用户名是否存在
    this.userService.checkUserByEmailAndGroupId(this.resetPasswordUser).subscribe({
      next: (response: HttpResponse<any>) => { // 显式声明 response 参数的类型
        // 如果存在用户
        if (response.status == 200) {
          // 发送重置密码链接到用户邮箱
          this.userService.resetPassword(this.resetPasswordUser).subscribe({
            next: (response: HttpResponse<any>) => { // 显式声明 response 参数的类型
              // 发送成功
              if (response.status === 200) {
                alert('Password reset email sent to your email address');
              } else {
                // 发送失败
                alert("Failed to send password reset email. Please try again later.");
              }
            },
            error: (error: any) => { // 显式声明 error 参数的类型
              // 其他报错
              alert("Error");
            }
          });
        } else {
          // 用户不存在，显示错误消息
          alert("User doesn't exist");
        }
      },
      error: (error: any) => { // 显式声明 error 参数的类型
        // 其他错误，显示通用错误消息
        alert("Error");
      }
    });
  }


  goToRegister(): void {
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
