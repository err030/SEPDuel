import {Component, OnInit} from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {UserService} from "../../service/user.service";
import {Global} from "../../global";
import {CommonModule} from '@angular/common';
import {FormsModule} from "@angular/forms";
import {PaginatorModule} from "primeng/paginator";
import {HttpEventType, HttpResponse} from "@angular/common/http";
import {ChangeDetectorRef} from '@angular/core';
import {User} from '../../model/user';
import {Clan} from "../../model/clan";

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, PaginatorModule, RouterLink],
  providers: [UserService]
})
export class ProfileComponent implements OnInit {
  public loggedUser!: User;
  public selectedFile: File | null = null;
  public isUploading: boolean = false;

  constructor(
    private router: Router,
    private userService: UserService,
    private changeDetector: ChangeDetectorRef
  ) {
  }

  ngOnInit(): void {
    const storedUser = localStorage.getItem('loggedUser');
    if (storedUser) {
      this.loggedUser = JSON.parse(storedUser);
    }
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
              console.log('event body not null');
              this.loggedUser.avatarUrl = `${Global.backendUrl}${event.body.avatarUrl}`;
              this.userService.updateLoggedUserAvatar(this.loggedUser.avatarUrl);
              console.log('should updated url:', this.loggedUser.avatarUrl);
              localStorage.setItem('loggedUser', JSON.stringify(this.loggedUser));
              this.changeDetector.detectChanges();
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
    const token = localStorage.getItem('token');
    if (token) {
      this.userService.getUserByToken(token).subscribe({
        next: (response) => {
          const user = response.body;
          if (user) {
            this.updateUserInfo({
              username: user.username,
              email: user.email,
              birthday: user.birthday,
              firstname: user.firstname,
              lastname: user.lastname,
              sepCoins: user.sepCoins,
              leaderBoardPunkt: user.leaderBoardPunkt,
              avatarUrl: user.avatarUrl ? `${Global.backendUrl}${user.avatarUrl}` : 'assets/images/user.png'
            });
          }
        },
        error: (error) => {
          console.error('Failed to get user details', error);
        }
      });
    }
  }

  updateUserInfo(updatedData: any): void {
    this.loggedUser = {...this.loggedUser, ...updatedData};
    localStorage.setItem('loggedUser', JSON.stringify(this.loggedUser));
    this.changeDetector.detectChanges();
  }

  goToHome() {
    if (this.loggedUser.groupId == 1) {
      this.router.navigate(['/homepage-user']);
    } else if (this.loggedUser.groupId == 2) {
      this.router.navigate(['/homepage-admin']);
    }
  }
}
