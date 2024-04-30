//user.service.ts
import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpResponse} from "@angular/common/http";
import {Observable, tap} from "rxjs";
import {User} from "../model/user";
import {Router} from "@angular/router";
import {Global} from "../global";


@Injectable({
  providedIn: 'root'
})

export class UserService {
  private headers = new HttpHeaders({
    'Content-Type': 'application/json'
  });

  loggedUser: User | null = null;

  constructor(private http: HttpClient,  private router: Router) {
  }

  // 添加新用户
  addUser(user: User): Observable<HttpResponse<any>> {
    return this.http.post<any>(Global.userRestServiceUrl, user, { headers: this.headers, observe: 'response' }).pipe(
      tap(response => {
        if (response.status === 201) {
          // 注册成功后保存用户信息到本地存储
          localStorage.setItem('loggedUser', JSON.stringify(user));
        }
      })
    );
  }

  // 通过Email和用户组检查用户是否存在
  checkEmailExists(user: User): Observable<HttpResponse<any>> {
    const url = Global.userRestServiceUrl + "/" + user.email + "/" + user.groupId;
    return this.http.get<any>(url, {observe: 'response'});
  }

  checkUsernameExists(user: User): Observable<HttpResponse<any>> {
    const url = Global.userRestServiceUrl + "/checkusername/"+user.groupId+"/" + user.username;
    return this.http.get<any>(url, {observe: 'response'});
  }

  // 通过Email、密码和用户组获取用户
  getUserByEmailAndPasswordAndGroupId(user: User): Observable<HttpResponse<User>> {
    const url = Global.userRestServiceUrl + "/" + user.email + "/" + user.password + "/" + user.groupId;
    return this.http.get<User>(url, {observe: 'response'});
  }

  // 通过用户id获取验证码
  getSecurityCodeByUserId(userId: number): Observable<HttpResponse<any>> {
    const url = Global.userRestServiceUrl + "/securitycode/" + userId;
    return this.http.get<any>(url, {observe: 'response'});
  }

  // 检查验证码是否有效
  checkSecurityCode(userId: number, securityCode: string): Observable<HttpResponse<any>> {
    const url = Global.userRestServiceUrl + "/securitycode/" + userId + "/" + securityCode;
    return this.http.get<any>(url, {observe: 'response'});
  }

  // 重置密码
  resetPassword(userId: number, newPassword: string): Observable<HttpResponse<any>> {
    const url = Global.userRestServiceUrl + "/resetpassword";
    return this.http.put<any>(url, { userId, newPassword }, { headers: this.headers, observe: 'response' });
  }

  // 通过用户id获取Token
  getTokenByUserId(userId: number): Observable<string> {
    const url = Global.userRestServiceUrl + "/token/generate/" + userId;
    return this.http.get(url, {responseType: 'text' as const});
  }

  // 通过Token获取用户信息
  getUserByToken(token: string): Observable<HttpResponse<User>> {
    const url = Global.userRestServiceUrl + "/token/getuser";
    const headersWithToken = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token
    });
    return this.http.get<any>(url, {headers: headersWithToken, observe: 'response'});
  }
  //向后端发送请求以发送重置密码链接
  sendResetPasswordEmail(email: string): Observable<HttpResponse<any>> {
    const url = Global.userRestServiceUrl + "/resetpassword/email";
    return this.http.post<any>(url, { email }, { headers: this.headers, observe: 'response' });
  }

  // 检查是否有已经登录的用户
  checkLoggedUser(): void {
    const storedUser = localStorage.getItem('loggedUser');
    if (storedUser) {
      this.loggedUser = JSON.parse(storedUser);
      if (this.loggedUser) { // 检查 loggedUser 是否为 null
        this.navigateBasedOnUserGroup(this.loggedUser.groupId);
      }
    } else {
      const token = localStorage.getItem('token');
      if (token) {
        this.getUserByToken(token).subscribe({
          next: (response: HttpResponse<User>) => { // 显式声明 response 参数的类型
            this.loggedUser = response.body;
            localStorage.setItem('loggedUser', JSON.stringify(this.loggedUser));
            if (this.loggedUser) {
              this.navigateBasedOnUserGroup(this.loggedUser.groupId);
            }
          }
        });
      }
    }
  }

// 根据用户组导航至相应页面
  private navigateBasedOnUserGroup(groupId: number): void {
    if (groupId === 1) {
      void this.router.navigateByUrl("/homepage-user");
    } else if (groupId === 2) {
      void this.router.navigateByUrl("/homepage-admin");
    }
  }

  checkUserByEmailAndGroupId(user: User): Observable<HttpResponse<any>> {
    const url = Global.userRestServiceUrl + "/" + user.email + "/" + user.groupId;
    return this.http.get<any>(url, { observe: 'response' });
  }
// 验证码
  getSecurityCode(): Observable<HttpResponse<any>> {
    const userId = this.loggedUser?.id; // 使用可选链操作符访问id属性
    if (!userId) {
      // 处理loggedUser为null或undefined的情况，这里你可以抛出一个错误或者返回一个合适的Observable
      throw new Error('Logged user id is null or undefined');    }
    const url = Global.userRestServiceUrl + "/securitycode/" + userId;
    return this.http.get<any>(url, {observe: 'response'});
  }


}
