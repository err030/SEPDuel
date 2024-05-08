// profile.component.ts
import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {UserService} from "../../service/user.service";
import {Global} from "../../global";
import {CommonModule} from '@angular/common';
import {FormsModule} from "@angular/forms";
import {PaginatorModule} from "primeng/paginator";
import {error} from "@angular/compiler-cli/src/transformers/util";


@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, PaginatorModule],
  providers: [UserService]
})
export class ProfileComponent implements OnInit {
  public loggedUser: any;
  public sepCoins: number | undefined;
  public leaderboardPoints: number | undefined;
  public selectedFile: File | null = null;
  public isUploading: boolean = false;

  constructor(
    private router: Router,
    private userService: UserService
  ) {
  }

  ngOnInit(): void {
    this.loggedUser = Global.loggedUser;
    this.getUserDetails();
  }

  onFileSelected(event: any){
    this.selectedFile = event.target.files[0];
  }
  onAvatarFormSubmit() {
    if (this.selectedFile) {
      this.isUploading = true;
      // 调用 UserService 中的 uploadAvatar 方法上传文件
      this.userService.uploadAvatar(this.selectedFile, this.loggedUser.userId).subscribe(
        (response) => {
          // 上传成功，可以在这里处理响应，例如更新用户头像 URL
          console.log('Avatar uploaded successfully:', response);
          this.isUploading = false;
        },
        (error) => {
          // 上传失败，可以在这里处理错误
          console.error('Failed to upload avatar:', error);
          this.isUploading = false;
        }
      );
    }
  }
  confirmUpload(){

  }
  isUploaded(){}

  getUserDetails(): void {
    const token = localStorage.getItem('token'); // 从 localStorage 中获取 token
    if (token) {
      this.userService.getUserByToken(token).subscribe({
        next: (response) => {
          const user = response.body;
          if(user){
            this.sepCoins=user.sepCoins;
            this.leaderboardPoints=user.leaderboardPoints;
            if(this.loggedUser.avatarUrl==null){
              this.loggedUser.avatarUrl="assets/images/user.png";
            }
          }
        },
        error:(error) =>{
          console.error('Failed to get user details',error);
        }
        }

      );
    }
  }

  goToHomePage(): void {
    if (this.loggedUser.groupId == 1) {
      this.router.navigateByUrl('/homepage-user');
    } else if (this.loggedUser.groupId == 2) {
      this.router.navigateByUrl('/homepage-admin');
    }
  }

  changePassword(): void {
    this.router.navigateByUrl('/reset-password');
  }
}
