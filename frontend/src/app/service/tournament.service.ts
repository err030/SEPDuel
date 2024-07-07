// tournament.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import {Global} from "../global";

@Injectable({
  providedIn: 'root'
})
export class TournamentService {
  private apiUrl = `${Global.backendUrl}/api`;

  constructor(private http: HttpClient) { }

  placeBet(userId: number, tournamentId: number, betOnUserId: number): Observable<any> {
    const url = `${this.apiUrl}/user/${userId}/tournament/${tournamentId}/placeBet`;
    const body = { betOnUserId: betOnUserId };
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    return this.http.post(url, body, { headers: headers });
  }

}
