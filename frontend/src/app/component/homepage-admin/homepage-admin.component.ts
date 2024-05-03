import { Component } from '@angular/core';
import {MessageService} from "primeng/api";
import {UserService} from "../../service/user.service";

@Component({
  selector: 'app-homepage-admin',
  templateUrl: './homepage-admin.component.html',
  styleUrls: ['./homepage-admin.component.css'],
  standalone: true,
  providers: [MessageService, UserService]
})
export class HomepageAdminComponent {}
