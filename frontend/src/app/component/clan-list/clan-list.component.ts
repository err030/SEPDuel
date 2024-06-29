import {Component, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {FormsModule} from "@angular/forms";
import {ClanService} from "../../service/clan.service";
import {Clan} from "../../model/clan";
import {UserService} from "../../service/user.service";
import {NgForOf, NgIf} from "@angular/common";
import {Global} from "../../global";
import {User} from "../../model/user";

@Component({
  selector: 'app-clan-list',
  standalone: true,
  imports: [
    FormsModule,
    NgIf,
    NgForOf
  ],
  templateUrl: './clan-list.component.html',
  styleUrls: ['./clan-list.component.css'],
  providers: [ClanService, UserService]
})
export class ClanListComponent implements OnInit {
  clan: Clan = new Clan();
  clans: Clan[] = [];
  showCreateDialog: boolean = false;
  loggedUser: User | null = null;

  constructor(private router: Router, private clanService: ClanService, private userService: UserService) {
  }

  ngOnInit(): void {
    console.log('Global.loggedUser:', Global.loggedUser);
    this.loggedUser = Global.loggedUser;
    this.updateClanList();
  }

  updateClanList() {
    this.clanService.getAllClans().subscribe(response => {
      if (response.status === 200) {
        this.clans = response.body || [];
      }
    });
  }


  onCreateClanFormSubmit() {
    if (!this.clan.name) {
      alert("Please Name Your Clan");
      return;
    }
    if (this.loggedUser && this.loggedUser.id !== undefined) {
      this.clanService.createClan(this.clan.name, this.loggedUser.id).subscribe(
        response => {
          if (response.status === 201) {
            alert("Clan created successfully!");
            this.showCreateDialog = false;
            this.updateClanList();
          }
        },
        error => {
          if (error.status === 409) {
            alert("Clan name already exists. Please choose a different name.");
          } else {
            alert("You are already in a clan");
            this.showCreateDialog = false;
          }
        }
      );
    }
  }

  joinClan(clanId: number) {
    if (this.loggedUser && this.loggedUser.id) {
      this.clanService.joinClan(this.loggedUser.id, clanId).subscribe(
        response => {
          if (response.status === 200) {
            alert("You have joined this clan!");
            this.updateClanList();
          }
        }
      );
    }
  }

  goToClan() {
    // @ts-ignore
    this.router.navigate(['/clan/' + this.clan.id]);
  }

  goToHome() {
    this.router.navigate(['/homepage-user']);
  }
}
