//user.service.ts
import {Injectable} from '@angular/core';
import {HttpClient, HttpEvent, HttpHeaders, HttpResponse} from "@angular/common/http";
import {Observable, tap} from "rxjs";
import {User} from "../model/user";
import {Router} from "@angular/router";
import {Global} from "../global";
import {ConfirmationService} from "primeng/api";



@Injectable({
  providedIn: 'root'
})

export class UserService {
  private headers = new HttpHeaders({
    'Content-Type': 'application/json'
  });

  loggedUser: User | null = null;
  selectedUser: User | null = null;

  constructor(private http: HttpClient,  private router: Router) {
    this.restoreUser();
  }
  //在服务初始化时恢复用户数据
  private restoreUser(): void {
    const userData = localStorage.getItem('loggedUser');
    if (userData && (!this.loggedUser || !Global.loggedUser)) {
      this.loggedUser = JSON.parse(userData);
      //omg how could someone forget this line
      //@ts-ignore
      Global.loggedUser = this.loggedUser;
    }
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

  //通过用户id获取用户信息
  getUserByUserId(userId:number):Observable<HttpResponse<any>> {
    const url = Global.userRestServiceUrl + "/" + userId;
    return this.http.get<any>(url, {observe: 'response'});
  }

  // 检查验证码是否有效
  checkSecurityCode(userId: number, securityCode: string): Observable<HttpResponse<any>> {
    const url = Global.userRestServiceUrl + "/securitycode/" + userId + "/" + securityCode;
    return this.http.get<any>(url, {observe: 'response'});
  }

  // 重置密码
  /*resetPassword(userId: number, newPassword: string): Observable<any> {
    const url = Global.userRestServiceUrl + "/reset-password";
    const requestBody = { userId: userId, newPassword: newPassword };
    return this.http.post<any>(url, requestBody);
  }*/

  changeUserPassword(currentPassword: string, newPassword: string): Observable<HttpResponse<any>> {
    const url = Global.userRestServiceUrl + "/" + currentPassword + "/" + newPassword;
    return this.http.put<any>(url, this.loggedUser, {headers: this.headers, observe: 'response'})
  }
  resetPassword(user: User): Observable<HttpResponse<any>> {
    const url = Global.userRestServiceUrl + "/resetpassword";
    return this.http.put<any>(url, user, {headers: this.headers, observe: 'response'});
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

  //获取头像
  getUserAvatarUrl(): string {
    if (this.loggedUser && this.loggedUser.avatarUrl) {
      return Global.backendUrl + this.loggedUser.avatarUrl;
    } else if (this.loggedUser && !this.loggedUser.avatarUrl) {
      return this.loggedUser.firstname.charAt(0) + this.loggedUser.lastname.charAt(0);
    } else {
      return "";
    }
  }
  //上传头像
  uploadAvatar(file: File, userId: number): Observable<HttpEvent<User>> {
    const url = Global.userRestServiceUrl + "/avatar/" + userId;
    const formData = new FormData();
    formData.append("file", file);
    return this.http.put<User>(url, formData, {
      reportProgress: true,
      observe: 'events'  // 改变观察类型为事件，以便能处理进度信息
    });
  }

 //更新头像
  updateLoggedUserAvatar(newAvatarUrl: string): void {
    if (this.loggedUser) {
      this.loggedUser.avatarUrl = newAvatarUrl;
      // 更新 localStorage 或其他持久化存储的信息
      localStorage.setItem('loggedUser', JSON.stringify(this.loggedUser));
    }
  }

  getAllUserByGroupId(user: User): Observable<HttpResponse<User[]>> {
    const url = Global.userRestServiceUrl + "/getAllUser"+ "/" + user.groupId;
    return this.http.get<User[]>(url, {observe: 'response'});
  }

  userLogout() {
    localStorage.clear();
    this.loggedUser = null;
    this.router.navigateByUrl("/login");
  }


// 获取排行榜
  getLeaderboard(): Observable<HttpResponse<User[]>> {
    return this.http.get<User[]>(`${Global.userRestServiceUrl}/leaderboard`, { headers: this.headers, observe: 'response' });
  }

  //更新用户状态
  /*updateUserStatus(userId: number, status: string): Observable<any> {
    return this.http.post(`${Global.userRestServiceUrl}/${userId}/status`, {status});
  }*/

  updateUserStatus(currentUserId: number, status: number): Observable<HttpResponse<any>> {
    const url = Global.userRestServiceUrl + "/updateUserStatus/" + currentUserId + "/" + status;
    return this.http.put<any>(url, status, {observe: 'response'});
  }
}
