import { Component } from '@angular/core';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {NgForOf, NgIf} from "@angular/common";

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    FormsModule,
    NgForOf,
    NgIf,
    ReactiveFormsModule
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {
  username: string = "JohnDoe";
  firstname: string = "John";
  lastname: string = "Doe";
  email: string = "johndoe@example.com";
  leaderboardPoints: number = 0;
  sepCoins: number = 500;


  passwordReset(){
    console.log("Password Reset");
  }
}
