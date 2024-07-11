import { Injectable } from '@angular/core';
import { Global } from "../global";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { Tournament } from "../model/tournament.model";
import { TournamentInvitation } from "../model/tournament-invitation.model";
import { TournamentBet } from "../model/tournament-bet.model";
import { Duel } from "../model/duel.model";
import {DuelRequest} from "../model/DuelRequest";

@Injectable({
  providedIn: 'root'
})
export class TournamentService {
  private apiUrl = Global.tournamentRestServiceUrl;
  private betUrl = Global.backendUrl

  constructor(private http: HttpClient) { }

  startTournamentRequest(currentUserId: number, clanId: number): Observable<TournamentInvitation[]> {
    return this.http.post<TournamentInvitation[]>(`${this.apiUrl}/clan/${clanId}/user/${currentUserId}/sendRequest`, {});
  }

  acceptOrDenyTournamentRequest(userId: number, invitation: TournamentInvitation): Observable<TournamentInvitation> {
    return this.http.put<TournamentInvitation>(`${this.apiUrl}/user/${userId}/invitations`, invitation);
  }

  getInvitations(): Observable<TournamentInvitation[]> {
    return this.http.get<TournamentInvitation[]>(`${this.apiUrl}/getInvitations/`);
  }

  startTournament(tournamentId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${tournamentId}/start`, {});
  }

  getAllDuelRequests(id: number): Observable<DuelRequest[]> {
    return this.http.get<DuelRequest[]>(`${this.apiUrl}/${id}/duelRequests`);
  }

  placeBet(userId: number, clanId: number, betOnUserId: number): Observable<any> {
    return this.http.post(`${this.betUrl}/api/clan/${clanId}/user/${userId}/betOnUser/${betOnUserId}/placeBet`,{});
  }

  getBetResult(userId: number, tournamentId: number): Observable<string> {
    return this.http.get(`${this.apiUrl}/user/${userId}/tournament/${tournamentId}/betResult`, { responseType: 'text' });
  }

  getTournament(userId: number): Observable<Tournament> {
    return this.http.get<Tournament>(`${this.apiUrl}/user/${userId}/getTournament`);
  }

  exitTournament(tournamentId: number, userId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${tournamentId}/exit/${userId}`);
  }
}
