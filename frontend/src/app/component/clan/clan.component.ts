import {Component, OnInit} from '@angular/core';
import {Clan} from "../../model/clan";
import {User} from "../../model/user";
import {ClanService} from "../../service/clan.service";
import {UserService} from "../../service/user.service";
import {NgForOf} from "@angular/common";
import {Global} from "../../global";
import {Router} from "@angular/router";

@Component({
  selector: 'app-clan',
  standalone: true,
  imports: [
    NgForOf
  ],
  templateUrl: './clan.component.html',
  styleUrl: './clan.component.css'
})
export class ClanComponent implements OnInit{
  clan?: Clan;
  members: User[] = [];
  loggedUser: User | null = null;

  constructor(private clanService: ClanService, private userService: UserService, private router: Router) {
  }

  ngOnInit() {
    this.loggedUser = Global.loggedUser;
    if (this.loggedUser && this.loggedUser.clanId) {
      this.updateClanMembers(this.loggedUser.clanId);
      console.log("Clan info:" + this.clan);
    } else {
      alert("You haven't joined any clan yet.");
      this.goToHome();
    }
  }

  updateClanMembers(id: number): void {
    this.clanService.getClanMembers(id).subscribe(
      response => {
        this.clan = response.body ?? new Clan();
        this.members = this.clan?.users || [];
      }
    );
  }

  goToHome() {
    this.router.navigate(['/homepage-user']);
  }
}
