import { Component } from '@angular/core';
import {MessageService} from "primeng/api";
import {UserService} from "../../service/user.service";

@Component({
  selector: 'app-homepage-user',
  standalone: true,
  imports: [],
  templateUrl: './homepage-user.component.html',
  styleUrl: './homepage-user.component.css',
  providers: [MessageService, UserService]
})
export class HomepageUserComponent {

  cards() {
    window.location.href = "/all-cards";
  }
}
