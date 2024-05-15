import { Injectable } from '@angular/core';
import {Observable, Subject} from 'rxjs';
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

  allFriends: User[] = [];

  chatListFriends: User[] = [];

  selectedFriendInChatList: Subject<User> = new Subject<User>;

  //用户名搜索用户

  searchUserByEmail(userId: number, email: string): Observable<HttpResponse<friend>> {
    const url = Global.friendRestServiceUrl + "/searchFriendByEmail/" + userId + "/" + email;
    return this.http.get<friend>(url, {observe: 'response'});
  }


  sendFriendRequest(currentUserId: number, targetUserId: number): Observable<HttpResponse<any>> {
    const url = Global.friendRestServiceUrl + "/sendFriendRequest/" + currentUserId + "/" + targetUserId;
    return this.http.post<any>(url, null, {observe: 'response'});
  }


  //从后端获取当前用户收到的好友请求列表
  getFriendRequests(currentUserId: number): Observable<HttpResponse<FriendRequest[]>>{
    const url = Global.friendRestServiceUrl + "/getFriendRequests/" + currentUserId;
    return this.http.get<FriendRequest[]>(url, {observe: 'response'});
  }

  acceptOrRejectFriendRequest(friendRequest: FriendRequest): Observable<HttpResponse<any>>{
    const url = Global.friendRestServiceUrl + "/friendRequest";
    return this.http.put<any>(url, friendRequest, {observe: 'response'});
  }

  getAllFriends(currentUserId: number): Observable<HttpResponse<User[]>> {
    const url = Global.friendRestServiceUrl + "/getAllFriends/" + currentUserId;
    return this.http.get<User[]>(url, {observe: 'response'});
  }

  getListStatus(currentUserId: number): Observable<HttpResponse<boolean>>{
    const url = Global.friendRestServiceUrl + "/getListStatus/" + currentUserId;
    return this.http.get<any>(url, {observe: 'response'});
  }

  updateListStatus(currentUserId: number, newStatus: boolean | null): Observable<HttpResponse<any>> {
    const url = Global.friendRestServiceUrl + "/updateListStatus/" + currentUserId + "/" + newStatus;
    return this.http.put<any>(url, null, {observe: 'response'});
  }

  getNewFriendRequestNumber(currentUserId: number): Observable<HttpResponse<number>> {
    const url = Global.friendRestServiceUrl + "/getNewFriendRequestNumber/" + currentUserId;
    return this.http.get<any>(url, {observe: 'response'});
  }

  deleteFriend(currentUserId: number, friendId: number): Observable<HttpResponse<any>>{
    const url = Global.friendRestServiceUrl + "/" + currentUserId + "/" + friendId;
    return this.http.delete<any>(url, {observe: 'response'});
  }

}
