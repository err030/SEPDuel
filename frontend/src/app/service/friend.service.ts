import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import {HttpClient, HttpResponse} from "@angular/common/http";
import {User} from "../model/user";
import {Global} from "../../global";
import {friend} from "../model/friend";
import {FriendRequest} from "../model/FriendRequest";

@Injectable({
  providedIn: 'root'
})
export class FriendService {
  constructor(private http: HttpClient) {
  }

  selectedFriend: User | null = null;
  selectedFriendListStatus: boolean | null = null;
  allFriends: User[]= [];

  //用户名搜索用户
  searchUserById(currentUserId: number, targetUserId: number): Observable<HttpResponse<friend>>{
    const url = Global.friendRestServiceUrl + "/searchUserById" + currentUserId + "/" + targetUserId;

    return this.http.get<friend>(url, {observe: 'response'});
  }














}
