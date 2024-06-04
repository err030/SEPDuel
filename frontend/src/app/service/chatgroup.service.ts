import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {HttpResponse} from "@angular/common/http";
import {Observable} from "rxjs";
import {Global} from "../../global";
import {Chatgroup} from "../model/chatgroup";

@Injectable({
  providedIn: 'root'
})
export class ChatgroupService {

  constructor(private http: HttpClient) { }

  selectedChatGroup: Chatgroup | null = null;


  getChatGroupListByUserId(currentUserId: number): Observable<HttpResponse<Chatgroup[]>> {
    const url = Global.chatGroupServiceUrl + "/getChatGroupList" + "/" + currentUserId;
    return this.http.get<Chatgroup[]>(url, {observe: 'response'});
  }


  addChatgroup(chatgroup: Chatgroup): Observable<HttpResponse<any>>{
    return this.http.post<any>(Global.chatGroupServiceUrl+"/create", chatgroup, {observe: 'response'});
  }


  updateChatgroup(item: Chatgroup): Observable<HttpResponse<any>> {
    return this.http.put<any>(Global.chatGroupServiceUrl, item, {observe: 'response'});
  }


  deleteChatgroupById(itemId: number): Observable<HttpResponse<any>>{
    const url = Global.chatGroupServiceUrl + "/id/" + itemId
    return this.http.delete<any>(url, {observe: 'response'});
  }


  deleteChatgroupByIds(itemIds: string): Observable<HttpResponse<number[]>>{
    const url = Global.chatGroupServiceUrl + "/ids/" + itemIds;
    return this.http.delete<number[]>(url, {observe: 'response'});
  }



}
