import { Component } from '@angular/core';
import {RouterOutlet} from "@angular/router";
import {MessageService} from "primeng/api";
import {UserService} from "../../service/user.service";

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [
    RouterOutlet
  ],
  templateUrl: './about.component.html',
  styleUrl: './about.component.css'
})
export class AboutComponent {

}
