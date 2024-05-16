// profile.component.ts
import {Component, OnInit} from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {UserService} from "../../service/user.service";
import {Global} from "../../global";
import {CommonModule} from '@angular/common';
import {FormsModule} from "@angular/forms";
import {PaginatorModule} from "primeng/paginator";
import {error} from "@angular/compiler-cli/src/transformers/util";
import {HttpEventType, HttpResponse} from "@angular/common/http";


@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, PaginatorModule, RouterLink],
  providers: [UserService]
})
export class ProfileComponent implements OnInit {
  public loggedUser: any;
  public sepCoins: number | undefined;
  public leaderBoardPunkt: number | undefined;
  public selectedFile: File | null = null;
  public isUploading: boolean = false;

  constructor(
    private router: Router,
    private userService: UserService
  ) {
  }

  ngOnInit(): void {
    // 假设Global.loggedUser是在登录成功后设置的
    this.loggedUser = Global.loggedUser;
    if (!this.loggedUser || !this.loggedUser.id) {
      console.error('User data is not loaded or user ID is missing.');
    }
    this.getUserDetails();
  }


  onFileSelected(event: any) {
    const element = event.currentTarget as HTMLInputElement;
    let files: FileList | null = element.files;
    if (files) {
      this.selectedFile = files.item(0);
      console.log('File selected:', this.selectedFile);
    }
  }

  onAvatarFormSubmit(): void {
    if (!this.selectedFile) {
      console.error('No file selected.');
      return;
    }
    // 确保 loggedUser 和 loggedUser.id 都不是 null 或 undefined
    if (!this.userService.loggedUser || this.userService.loggedUser.id === undefined) {
      console.error('User data is incomplete.');
      return;
    }
    this.uploadAvatar();
  }

  private uploadAvatar(): void {
    this.isUploading = true;
    if (this.selectedFile && this.userService.loggedUser && this.userService.loggedUser.id !== undefined) {
      this.userService.uploadAvatar(this.selectedFile, this.userService.loggedUser.id).subscribe({
        next: (event) => {
          if (event.type === HttpEventType.UploadProgress) {
            const total = event.total ?? 0;
            const loaded = event.loaded ?? 0;
            const percentDone = total ? Math.round(100 * loaded / total) : 0;
            console.log(`File is ${percentDone}% uploaded.`);
          } else if (event instanceof HttpResponse) {
            console.log('Avatar uploaded successfully:', event.body);
            if (event.body && event.body.avatarUrl) {
              // 确保使用后端提供的完整URL
              this.loggedUser.avatarUrl = 'http://localhost:8080/avatars/' + event.body.avatarUrl;
              this.userService.updateLoggedUserAvatar(this.loggedUser.avatarUrl); // 更新服务中的用户信息
            }
            this.isUploading = false;
          }
        },
        error: (error) => {
          console.error('Failed to upload avatar:', error);
          this.isUploading = false;
        }
      });
    }
  }



  getUserDetails(): void {
    const token = localStorage.getItem('token'); // 从 localStorage 中获取 token
    if (token) {
      this.userService.getUserByToken(token).subscribe({
          next: (response) => {
            const user = response.body;
            if (user) {
              this.sepCoins = user.sepCoins;
              this.leaderBoardPunkt = user.leaderBoardPunkt;
              if (this.loggedUser.avatarUrl == null) {
                this.loggedUser.avatarUrl = `${Global.backendUrl}/assets/images/user.png`;
              } else {
                this.loggedUser.avatarUrl = `${Global.backendUrl}/${this.loggedUser.avatarUrl}`;
              }
            }
          },
          error: (error) => {
            console.error('Failed to get user details', error);
          }
        }
      );
    }
  }

}
