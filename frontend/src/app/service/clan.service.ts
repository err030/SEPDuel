import {Injectable} from '@angular/core';
import {HttpClient, HttpResponse} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Clan} from "../model/clan";
import {Global} from "../global";

@Injectable({
  providedIn: 'root'
})
export class ClanService {

  private apiUrl = `${Global.backendUrl}/api/clan`;

  constructor(private http: HttpClient) {
  }

  // 创建战队
  createClan(clanName: string, userId: number): Observable<HttpResponse<any>> {
    return this.http.get<HttpResponse<any>>(`${this.apiUrl}/${userId}/createClan/${clanName}`, {observe: 'response'});
  }

  // 加入战队
  joinClan(userId: number, clanId: number): Observable<HttpResponse<any>> {
    return this.http.get<HttpResponse<any>>(`${this.apiUrl}/${userId}/joinClan/${clanId}`, {observe: 'response'});
  }

  // 获取所有战队
  getAllClans(): Observable<HttpResponse <Clan[]>> {
    const url = `${Global.backendUrl}/api/clan/allClans`;
    return this.http.get<Clan[]>(url, { observe: 'response' });
  }

  //获取战队成员
  getClanMembers(id: number): Observable<HttpResponse<Clan>> {
    const url = `${Global.backendUrl}/api/clan/${id}/members`;
    return this.http.get<Clan>(url, { observe: 'response' });
  }
}
