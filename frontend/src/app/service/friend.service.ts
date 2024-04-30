import { Injectable } from '@angular/core';
import { Observable} from 'rxjs';
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


  sendFriendRequest(currentUserId: number, targetUserId: number): Observable<HttpResponse<any>> {
    const url = Global.friendRestServiceUrl + "/sendFriendRequest" + currentUserId + "/" + targetUserId;

    return this.http.post(url, null, {observe: 'response'});
  }


  //从后端获取当前用户收到的好友请求列表
  getFriendRequests(currentUserId: number): Observable<HttpResponse<FriendRequest[]>>{
    const url = Global.friendRestServiceUrl + "getFriendRequests" + currentUserId;

    return this.http.get<FriendRequest[]>(url, {observe: 'response'});
  }

  acceptOrRejectFriendRequest(friendRequest: FriendRequest): Observable<HttpResponse<any>>{
    const url = Global.friendRestServiceUrl + "acceptOrRejectFriendRequest";

    return this.http.post(url, friendRequest, {observe: 'response'});
  }











}
