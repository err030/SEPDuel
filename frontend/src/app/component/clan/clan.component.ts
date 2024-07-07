import {Component, OnInit} from '@angular/core';
import {Clan} from "../../model/clan";
import {User} from "../../model/user";
import {ClanService} from "../../service/clan.service";
import {UserService} from "../../service/user.service";
import {NgForOf, NgIf} from "@angular/common";
import {Global} from "../../global";
import {Router} from "@angular/router";
import {TournamentService} from "../../service/tournament.service";
import {TournamentInvitation} from "../../model/tournament-invitation.model";

@Component({
  selector: 'app-clan',
  standalone: true,
  imports: [
    NgForOf,
    NgIf
  ],
  templateUrl: './clan.component.html',
  styleUrl: './clan.component.css'
})
export class ClanComponent implements OnInit{
  clan?: Clan;
  members: User[] = [];
  invitations: TournamentInvitation[] = [];
  loggedUser?: User;

  constructor(private clanService: ClanService, private userService: UserService, private router: Router, private tournamentService: TournamentService) {
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
    this.refreshInvitations();
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

  exitClan() {
    // @ts-ignore
    this.clanService.exitClan(this.loggedUser?.id).subscribe(
      () => {
        // @ts-ignore
        this.loggedUser.clanId = null;
        localStorage.setItem('loggedUser', JSON.stringify(this.loggedUser));
        if (this.loggedUser) {
          Global.loggedUser = this.loggedUser;
        }
        this.goToHome();
      }
    );
  }

  goToTournaments() {
    this.router.navigate(['/tournament']);
  }

  goToChat() {

  }

  startTournamentRequest() {
    //@ts-ignore
    this.tournamentService.startTournamentRequest(Global.loggedUser.id, this.clan.id).subscribe(
      response => {
        console.log(response);
      })
  }

  getInvitations() {
    this.tournamentService.getInvitations().subscribe(
      (response:any) => {
        console.log(response);
        this.invitations = response.body;
      })
  }

  refreshInvitations() {
    setInterval(() => {
      this.getInvitations();
    }, 1000)
  }


  acceptInvitation(invitation: TournamentInvitation) {
    invitation.accepted = true;
    this.tournamentService.acceptOrDenyTournamentRequest(Global.loggedUser.id ?? 0, invitation).subscribe(
      response => {
        console.log(response);
        this.getInvitations();
      }
    )
  }

  declineInvitation(invitation: TournamentInvitation) {
    invitation.accepted = false;
    this.tournamentService.acceptOrDenyTournamentRequest(Global.loggedUser.id ?? 0, invitation).subscribe(
      response => {
        console.log(response);
        this.getInvitations();
      }
    )
  }
}
