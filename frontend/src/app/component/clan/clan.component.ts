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
import {Card} from "../../model/card.model";
import {Tournament} from "../../model/tournament.model";
import {error} from "@angular/compiler-cli/src/transformers/util";

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
  interval: any;
  tournamentId: number | undefined;
  hasBet: Boolean = false;
  betResult: string = '';
  tournamentHasEnded: boolean = false;

  constructor(private clanService: ClanService, private userService: UserService, private router: Router, private tournamentService: TournamentService) {
  }

  ngOnInit() {
    clearInterval(this.interval);
    this.loggedUser = Global.loggedUser;
    if (this.loggedUser && this.loggedUser.clanId) {
      this.updateClanMembers(this.loggedUser.clanId);
      console.log("Clan info:" + this.clan);
      //@ts-ignore
      this.tournamentService.getTournament(this.loggedUser.id).subscribe(
        (response:any) => {
          console.log('Tournament response:', response);
          let tournament = response;
          //@ts-ignore
          if (tournament.winnerId === this.loggedUser.id && tournament.id.toString() !== localStorage.getItem('lastWonTournament')) {
            localStorage.setItem('lastWonTournament',tournament.id.toString());
            alert("Congratulations! You won the tournament!");
            alert("You are awarded with 700 SEP Coins.");
          }
        }
      )
    } else {
      alert("You haven't joined any clans yet.");
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
    clearInterval(this.interval);
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
      (response:any) => {
        console.log(response);
        this.tournamentId = response.id;
        alert("Invitations sent!")
      })
  }

  getInvitations() {
    this.tournamentService.getInvitations().subscribe(
      (response:any) => {
        this.invitations = response;
        console.log(this.invitations);
      })
  }

  refreshInvitations() {
    this.interval = setInterval(() => {
      this.getInvitations();
    }, 1000)
  }


  acceptInvitation(invitation: TournamentInvitation) {
    invitation.accepted = true;
    this.tournamentService.acceptOrDenyTournamentRequest(Global.loggedUser.id ?? 0, invitation).subscribe(
      (response:any) => {
        console.log(response);
        this.tournamentId = response.id;
        this.tournamentService.startTournament(invitation.tournament.id).subscribe(
          response => {
            console.log(response);
          }
        )
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

  protected readonly Global = Global;

  goToTournament() {
    clearInterval(this.interval)
    this.router.navigate(['/tournament/' + this.tournamentId]);
  }

  goChat() {
    if (this.clan) {
      void this.router.navigateByUrl('/clan-group-message/' + this.clan.id)
    }
  }

  placeBet(betOnUserId: number | undefined) {
    //@ts-ignore
    this.tournamentService.placeBet(Global.loggedUser.id,betOnUserId).subscribe({
      next: (response: any) => {
        console.log(response);
        alert("Bet placed!")
        this.hasBet = true;
      },
      error: (error: any) => {
        alert(error.error)
        console.error(error);
      }
    })
  }
  endTournament() {
    //@ts-ignore
    this.tournamentService.getBetResult(Global.loggedUser.id).subscribe(result => {
      this.betResult = result;
      alert(this.betResult);
      this.goToLootbox();
    },
      (error: any) => {
      alert("You did not bet or Tournament did not beginn!");
      }
    );
  }
  goToLootbox() {
    this.router.navigate(['/lootbox']);
  }
}
